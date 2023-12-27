import { noSavings } from "../constants"

import chunk from "../chunk"
import customFetch from "../customfetch"
import EthFees from "../ethfees"
import getBatchCustomReceipts from "../gethBatchCustomReceipts"

/**
 * Linea class calculates savings for Linea.
 *
 * ======== Methodology ========
 *
 * Linea is EVM equivalent to Ethereum, meaning that each unit of gas on Linea is
 * equivalent to each unit of gas on Ethereum. Unlike Optimism, fees can be
 * simply calculated by multiplying gasUsed by gasPrice.
 *
 * Unlike Optimism, this time we cannot reliable get l1fee during the time of the transaction.
 * So, we have to use the average daily fee instead.
 *
 * Because each unit of L1 gas is equal to L2 gas, gasUsed * l1gasPrice retuns the
 * amount of fee that would be spent if the transaction was sent on L1 at the exact same date.
 */
export default class Linea implements L2 {
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

        // The beauty of EVM equivalence is that each unit of L1 gas
        // is equivalent to each unit of L2 gas :)
        let totalGasSpent = 0

        // // Chunk receipts into batches of 5 (to avoid hitting api limits)
        // const chunkSize = transactions.length > 1_000 ? 10 : 5

        // Update 2023-12-25: Trying limits of 10 due to api limits
        const chunkSize = 10
        const chunks = chunk(transactions, chunkSize)
        const retryLimit = 6
        const delayTime = 375
        const receipts = []
        for (const transactionChunk of chunks) {
            let retries = 0
            while (retries < retryLimit) {
                try {
                    const batchReceipts = await getBatchCustomReceipts(
                        process.env.NEXT_PUBLIC_LINEA_RPC!,
                        transactionChunk.map(tx => tx.hash)
                    )

                    this.onSavingCalculated({
                        text: "Fetching transaction receipts",
                        current: receipts.length,
                        total: chunks.length,
                    })

                    receipts.push({
                        receipts: batchReceipts,
                        gasPrices: transactionChunk.map(tx => tx.gasPrice),
                        timestamps: transactionChunk.map(tx => parseInt(tx.timestamp)),
                    })
                    break
                } catch (error) {
                    console.error(`Error fetching receipts for chunk: ${error}`)
                    retries++
                    if (retries === retryLimit) {
                        throw new Error(`Failed to fetch receipts after ${retryLimit} retries.`)
                    }
                }
            }
            await new Promise(resolve => setTimeout(resolve, delayTime))
        }

        const flatReceipts = receipts
            .map(({ receipts, gasPrices, timestamps }) => {
                return receipts.map((receipt: any, index: number) => {
                    return {
                        receipt,
                        gasPrice: gasPrices[index],
                        timestamp: timestamps[index],
                    }
                })
            })
            .flat()
            .filter(receipt => receipt.receipt !== null && receipt.receipt !== undefined)

        this.onSavingCalculated({
            text: "Fetching transaction receipts",
            current: 0,
            total: flatReceipts.length,
        })

        let transactionsCalculated = 0
        for (const { receipt, gasPrice, timestamp } of flatReceipts) {
            const L2Fee = EthFees.weiToEther(BigInt(receipt.gasUsed) * BigInt(gasPrice))

            // evm equivalence
            const L2Gas = parseInt(receipt.gasUsed, 16)

            const L1Fee = await EthFees.averageDailyFee(timestamp, L2Gas)

            transactionsCalculated++

            this.onSavingCalculated({
                text: "Calculating fees",
                current: transactionsCalculated,
                total: flatReceipts.length,
            })

            allSavings.push({
                L2: "linea",
                hash: receipt.transactionHash,
                L2Fee,
                L1Fee,
                saved: L1Fee - L2Fee,
                timesCheaper: L1Fee / L2Fee,
            })

            totalL1Fees += L1Fee
            totalL2Fees += L2Fee

            totalGasSpent += parseInt(receipt.gasUsed, 16)
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
                gasSpent: totalGasSpent,
                feesSpent: {
                    ether: totalL1Fees,
                    usd: totalL1FeesUsd,
                },
            },
            L2: {
                transactionsSent: transactions.length,
                gasSpent: totalGasSpent,
                feesSpent: {
                    ether: totalL2Fees,
                    usd: totalL2FeesUsd,
                },
            },
            saved: {
                ether: totalL1Fees - totalL2Fees,
                usd: totalL1FeesUsd - totalL2FeesUsd,
                timesCheaper: totalL1Fees / totalL2Fees,
            },
            details: allSavings,
        }
    }

    /**
     * @return all transaction hashes and their gas prices
     */
    private async getAllTransactions(): Promise<
        { hash: string; gasPrice: string; timestamp: string }[]
    > {
        const transactions = await customFetch(
            `https://api.lineascan.build/api?module=account&action=txlist&address=${this.address}&sort=desc&apikey=${process.env.NEXT_PUBLIC_LINEASCAN_API_KEY}`
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
                    gasPrice: transaction.gasPrice,
                    timestamp: transaction.timeStamp,
                }
            })
    }
}
