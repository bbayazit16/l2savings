import { noSavings } from "../constants"

import chunk from "../chunk"
import customFetch from "../customfetch"
import EthFees from "../ethfees"
import getBatchCustomReceipts from "../gethBatchCustomReceipts"

/**
 * Arbitrum class calculates savings for Arbitrum.
 *
 * ======== Methodology ========
 *
 * Arbitrum savings are only calculated for transactions after Arbitrum Nitro. This is because AVM had different
 * gas costs for each instruction compared to the EVM.
 *
 * Arbgas concept was removed with Arbitrum Nitro.
 * @see https://github.com/OffchainLabs/nitro/blob/master/docs/migration/dapp_migration.md#cool-new-stuff
 *
 * So,
 *
 * L2Gas = gasUsed
 * L2Fee = L2Gas * effectiveGasPrice
 *
 * Gas if transaction was on L1:
 * L1Gas = L2Gas - gasUsedForL1, because L2Gas includes L1 calldata gas.
 *
 * L1Fees are calculated according to dmihal/ethereum-average-fees subgraph.
 *
 */
export default class Arbitrum implements L2 {
    /**
     * The address that the data will be collected for
     */
    private address: string

    /**
     * The callback to call when the savings of a transaction is calculated
     */
    private onSavingCalculated: (progress: CalcProgress) => void

    /**
     * @param address a valid 20 byte address as hex string with 0x prefix, 42 characters total
     * @param onTransactionCalculated a callback to call when the savings of a transaction is calculated
     */
    public constructor(address: string, onTransactionCalculated: (progress: CalcProgress) => void) {
        this.address = address
        this.onSavingCalculated = onTransactionCalculated
    }

    /**
     * Calculates and sets savings
     * @return Savings
     */
    public async calculateSavings(): Promise<Savings> {
        const transactions = await this.getAllTransactions()

        this.onSavingCalculated({
            text: "Fetching transaction receipts",
            current: 0,
            total: transactions.length,
        })

        if (transactions.length == 0) {
            this.onSavingCalculated({
                text: "Calculated savings",
                current: 0,
                total: 0,
            })
            return JSON.parse(JSON.stringify(noSavings)) as Savings
        }

        const allSavings: TransactionSavings[] = []

        let totalL1Fees = 0
        let totalL2Fees = 0

        let totalL1GasPredicted = 0
        let totalL2GasSpent = 0

        // // Chunk receipts into batches of 5 (to avoid hitting api limits)
        // const chunkSize = transactions.length > 1_000 ? 10 : 5

        // Update 2023-12-25: Trying limits of 10 due to api limits
        const chunkSize = 10

        let onChunk = 0
        const receipts = await Promise.all(
            chunk(transactions, chunkSize).map(async chunk => {
                const receipts = await getBatchCustomReceipts(
                    process.env.NEXT_PUBLIC_ARBITRUM_RPC!,
                    chunk.map(chunk_1 => chunk_1.hash)
                )
                onChunk += chunk.length
                this.onSavingCalculated({
                    text: "Fetching transaction receipts",
                    current: onChunk,
                    total: transactions.length,
                })
                return {
                    receipts,
                    timestamps: chunk.map(ch => ch.timestamp),
                }
            })
        )

        const flatReceipts: { receipt: any; timestamp: number }[] = receipts
            .map(({ receipts, timestamps }) => {
                return receipts.map((receipt: any, index: number) => {
                    return {
                        receipt,
                        timestamp: timestamps[index],
                    }
                })
            })
            .flat()
            .filter(
                receipt =>
                    receipt.receipt !== null &&
                    receipt.receipt !== undefined &&
                    receipt.receipt.l1BlockNumber !== null &&
                    receipt.receipt.l1BlockNumber !== undefined
            )

        this.onSavingCalculated({
            text: "Fetching transaction receipts",
            current: 0,
            total: flatReceipts.length,
        })

        const l1Blocks = flatReceipts.map(receipt => receipt.receipt.l1BlockNumber)

        const gasFeesAtL1Blocks = await EthFees.getGasFeesAtBlocks(l1Blocks)

        let transactionsCalculated = 0
        for (const { receipt, timestamp } of flatReceipts) {
            // L2Gas including L1 calldata
            const L2Gas = parseInt(receipt.gasUsed, 16)

            // Total fee paid on Arbitrum
            const L2Fee = EthFees.weiToEther(
                BigInt(receipt.gasUsed) * BigInt(receipt.effectiveGasPrice)
            )

            const L1Gas = L2Gas - parseInt(receipt.gasUsedForL1, 16)

            const L1Fee = EthFees.weiToEther(
                gasFeesAtL1Blocks[receipt.l1BlockNumber] * BigInt(L1Gas)
            )

            transactionsCalculated++

            this.onSavingCalculated({
                text: "Calculating fees",
                current: transactionsCalculated,
                total: transactions.length,
            })

            allSavings.push({
                L2: "arbitrum",
                hash: receipt.transactionHash,
                L2Fee,
                L1Fee,
                saved: L1Fee - L2Fee,
                timesCheaper: L1Fee / L2Fee,
            })

            totalL1Fees += L1Fee
            totalL2Fees += L2Fee

            totalL1GasPredicted += L1Gas
            totalL2GasSpent += L2Gas
        }

        this.onSavingCalculated({
            text: "Calculated savings",
            current: transactionsCalculated,
            total: transactionsCalculated,
        })

        const totalL1FeesUsd = await EthFees.ethToUsd(totalL1Fees)
        const totalL2FeesUsd = await EthFees.ethToUsd(totalL2Fees)

        return {
            L1: {
                gasSpent: totalL1GasPredicted,
                feesSpent: {
                    ether: totalL1Fees,
                    usd: totalL1FeesUsd,
                },
            },
            L2: {
                transactionsSent: transactions.length,
                gasSpent: totalL2GasSpent,
                feesSpent: {
                    ether: totalL2Fees,
                    usd: totalL2FeesUsd,
                },
            },
            saved: {
                ether: totalL1Fees + totalL2Fees,
                usd: totalL1FeesUsd + totalL2FeesUsd,
                timesCheaper: totalL1Fees / totalL2Fees,
            },
            details: allSavings,
        }
    }

    /**
     * @return transaction hashes + timestamp of all trannsactions for address after Arbitrum nitro
     */
    private async getAllTransactions(): Promise<{ hash: string; timestamp: number }[]> {
        // Get all transactions of address before Arbitrum Nitro (+- 4 hours)
        const transactions = await customFetch(
            `https://api.arbiscan.io/api?module=account&action=txlist&address=${this.address}&startBlock=22213298&sort=desc&apikey=${process.env.NEXT_PUBLIC_ARBISCAN_API_KEY}`
        )

        // Filter incoming transactions and remove:
        // - transactions that are not outgoing
        // - transactions that failed
        // - transaction that are L2 deposits (0 gas used)
        // - transactions that were sent to self
        return (transactions.result as Transaction[])
            .filter(
                transaction =>
                    transaction.from.toLowerCase() === this.address.toLowerCase() &&
                    transaction.txreceipt_status !== "0" &&
                    transaction.gasUsed !== "0"
            )
            .map(transaction => {
                return {
                    hash: transaction.hash,
                    timestamp: parseInt(transaction.timeStamp),
                }
            })
    }
}
