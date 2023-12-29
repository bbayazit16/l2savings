import { noSavings } from "../constants"

import chunk from "../chunk"
import customFetch from "../customfetch"
import EthFees from "../ethfees"
import getBatchCustomReceipts from "../gethBatchCustomReceipts"

/**
 * Base class calculates savings for Base.
 *
 * ======== Methodology ========
 *
 * @see Optimism.ts This file is a copy of Optimism.ts, the only difference being
 * the environment variables.
 *
 * Base is EVM equivalent, and is based on Optimism's OP stack.
 */
export default class Base implements L2 {
    /**
     * The address that the data will be collected for
     */
    private address: string

    /**
     * The callback to call when the savings of a transaction is calculated
     */
    private onSavingCalculated: (progress: CalcProgress) => void

    /**
     * Optional abort signal, used to cancel the request
     */
    private signal?: AbortSignal

    /**
     * @param address a valid 20 byte address as hex string with 0x prefix, 42 characters total
     * @param onTransactionCalculated a callback to call when the savings of a transaction is calculated
     */
    public constructor(
        address: string,
        onTransactionCalculated: (progress: CalcProgress) => void,
        signal?: AbortSignal
    ) {
        this.address = address
        this.onSavingCalculated = onTransactionCalculated
        this.signal = signal
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
        // Update 2023-12-29: Trying limits of 20 with delayTime 200 and retryLimit 16
        const chunkSize = 20
        const chunks = chunk(transactions, chunkSize)
        const retryLimit = 16
        const delayTime = 200
        const receipts = []
        for (const transactionChunk of chunks) {
            if (this.signal && this.signal.aborted) {
                throw new Error("Aborted: Base")
            }

            let retries = 0
            while (retries < retryLimit) {
                if (this.signal && this.signal.aborted) {
                    throw new Error("Aborted: Base")
                }

                try {
                    const batchReceipts = await getBatchCustomReceipts(
                        process.env.NEXT_PUBLIC_BASE_RPC!,
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
                    })
                    break
                } catch (error) {
                    console.error(`Error fetching receipts for chunk in Base. Retrying: ${error}`)
                    await new Promise(resolve => setTimeout(resolve, delayTime))

                    retries++
                    if (retries === retryLimit) {
                        throw new Error(`Failed to fetch receipts after ${retryLimit} retries.`)
                    }
                }
            }
            await new Promise(resolve => setTimeout(resolve, delayTime))
        }

        const flatReceipts = receipts
            .map(({ receipts, gasPrices }) => {
                return receipts.map((receipt: any, index: number) => {
                    return {
                        receipt,
                        gasPrice: gasPrices[index],
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

        if (this.signal && this.signal.aborted) {
            throw new Error("Aborted: Base")
        }

        let transactionsCalculated = 0
        for (const { receipt, gasPrice } of flatReceipts) {
            if (this.signal && this.signal.aborted) {
                throw new Error("Aborted: Base")
            }

            const L2Fee = EthFees.weiToEther(
                BigInt(receipt.gasUsed) * BigInt(gasPrice) + BigInt(receipt.l1Fee)
            )

            const L1Fee = EthFees.weiToEther(BigInt(receipt.gasUsed) * BigInt(receipt.l1GasPrice))

            transactionsCalculated++

            this.onSavingCalculated({
                text: "Calculating fees",
                current: transactionsCalculated,
                total: flatReceipts.length,
            })

            allSavings.push({
                L2: "base",
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

        if (this.signal && this.signal.aborted) {
            throw new Error("Aborted: Base")
        }

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
    private async getAllTransactions(): Promise<{ hash: string; gasPrice: string }[]> {
        const transactions = await customFetch(
            `https://api.basescan.org/api?module=account&action=txlist&address=${this.address}&sort=desc&apikey=${process.env.NEXT_PUBLIC_BASESCAN_API_KEY}`
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
                    transaction.gasUsed !== "0" &&
                    transaction.gasPrice !== "0"
            )
            .map(transaction => {
                return {
                    hash: transaction.hash,
                    gasPrice: transaction.gasPrice,
                }
            })
    }
}
