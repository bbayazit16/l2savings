import Utils from "../Utils"

/**
 * Optimism class calculates savings for Optimism.
 *
 * ======== Methodology ========
 *
 * Optimism is an optimistic rollup that is EVM equivalent, hence each L2 gas is equivalent
 * to an L1 gas.
 *
 * Since the Etherscan API does not return fees paid for a transsaction, it
 * has to be calculated manually. Fees paid can be calculated using the following
 * formula:
 *
 * (L2GasUsed * L2GasPrice) + (L1GasUsed * L1GasPrice * feeScalar)
 * where
 * L2GasUsed: The amount of gas used by the transaction
 * L2GasPrice: The price of one unit of gas on Optimism in wei
 * L1GasUsed: The amount of L1 gas used by the transaction
 * L1GasPrice: The price of one unit of gas on L1 in wei, set automatically
 * by the OVM Gas Price Oracle as the gas price on L1 varies
 * feeScalar: a constant set by the L2 owner, that is rarely changed.
 *
 * Index 2071713: Fee scalar reduced from 1.5 to 1.24 @see https://optimistic.etherscan.io/tx/2071713
 * Index 5368652: Fee scalar reduced from 1.24 to 1.00 @see https://optimistic.etherscan.io/tx/5368652
 *
 *
 * L1GasUsed is straightforward to calculate. For each unit of rlp encoded transaction, zero bytes cost
 * 4 gas while non-zero bytes cost 16 gas. Overhead cost and 68 bytes of padding are added,
 * where
 * padding is 68 * 16, added for the lack of signature on transaction
 * overhead is the per batch gas overhead of posting both transaction and state roots to
 * L1 given larger batch sizes, a constant controlled by the chain owner that is rarely
 * changed.
 *
 * Index 2071714: Overhead reduced from 2750 to 2100 @see https://optimistic.etherscan.io/tx/2071714
 *
 * @see https://optimistic.etherscan.io/address/0x420000000000000000000000000000000000000F#code
 *
 *
 * The method eth_getTransactionReceipt on Optimism JSON RPC returns l1fee, which is equal
 * to l1GasUsed * l1GasPrice * l1FeeScalar. All that needs to be done is to add l2fee to l1fee
 * to retreive total fee paid, where l2fee = (L2GasUsed * L2GasPrice).
 *
 * Finally, because each unit of L1 gas is equal to L2 gas, gasUsed * l1gasPrice retuns the
 * amount of fee that would be spent if the transaction was sent on L1 at the exact same date.
 */
export default class Optimism implements L2 {
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
            return Utils.noSavings
        }

        const allSavings: TransactionSavings[] = []

        let totalL1Fees = 0
        let totalL2Fees = 0

        // The beauty of EVM equivalence is that each unit of L1 gas
        // is equivalent to each unit of L2 gas :)
        let totalGasSpent = 0

        let onChunk = 0
        // Chunk receipts into batches of 5 (to avoid hitting api limits)
        const receipts = await Promise.all(
            Utils.chunk(transactions, 5).map(async chunk => {
                const receipts = await Utils.getBatchCustomReceipts(
                    process.env.REACT_APP_OPTIMISM_RPC!,
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
                    gasPrices: chunk.map(ch => ch.gasPrice),
                }
            })
        )

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

        let transactionsCalculated = 0
        for (const { receipt, gasPrice } of flatReceipts) {
            if (!Utils.connected) {
                throw new Error("Cancelled")
            }

            const L2Fee = Utils.weiToEther(
                BigInt(receipt.gasUsed) * BigInt(gasPrice) + BigInt(receipt.l1Fee)
            )

            const L1Fee = Utils.weiToEther(BigInt(receipt.gasUsed) * BigInt(receipt.l1GasPrice))

            transactionsCalculated++

            this.onSavingCalculated({
                text: "Calculating fees",
                current: transactionsCalculated,
                total: flatReceipts.length,
            })

            allSavings.push({
                L2: "optimism",
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

        const totalL1FeesUsd = await Utils.ethToUsd(totalL1Fees)
        const totalL2FeesUsd = await Utils.ethToUsd(totalL2Fees)

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
                ether: totalL1Fees + totalL2Fees,
                usd: totalL1FeesUsd + totalL2FeesUsd,
                timesCheaper: totalL1Fees / totalL2Fees,
            },
            details: allSavings,
        }
    }

    /**
     * @return all transaction hashes and their gas prices
     */
    private async getAllTransactions(): Promise<{ hash: string; gasPrice: string }[]> {
        const transactions = await Utils.fetch(
            `https://api-optimistic.etherscan.io/api?module=account&action=txlist&address=${this.address}&sort=desc&apikey=AUK6ZKXZXDDFJ5MYY8G287Z9D4D57SYVF8`
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
                }
            })
    }
}
