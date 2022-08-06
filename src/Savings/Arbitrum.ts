import Utils from "../Utils"

/**
 * Arbitrum class calculates savings for Arbitrum.
 *
 * ======== Methodology ========
 *
 * Unlike Optimism, Arbitrum is not EVM equivalent. Arbitrum has a completely different
 * approach to gas usage.
 *
 * Each unit of gas in Arbitrum is called an "arbgas". Although it is possible to estimate, it
 * is not possible to directly compare arbgas with L1 gas. (Roughly divide arbgas by 10-20)
 *
 * Moreover AVM (Arbitrum Virtual Machine) has different gas costs for each EVM intsruction.
 * @see https://developer.offchainlabs.com/docs/avm_specification#instructions
 *
 * Arbgas concept will be removed with Arbitrum Nitro.
 * @see https://github.com/OffchainLabs/nitro/blob/master/docs/migration/dapp_migration.md#cool-new-stuff
 *
 * All of these factors make it hard to estimate the amount of savings. However, until Arbitrum nitro is
 * live, the following approach can be used:
 *
 * - For transactions with known signatures, use the hardcoded gas amount:
 * - 21,000 gas for ETH transfers,
 * - 50,000 gas for ERC20 swaps and approvals,
 * - 105,000 gas for swaps,
 * - 150,000 gas for multicall as it can be used for anything
 * - 200,000 gas for add/remove liquidity
 * - 100,000 gas for deposits/withdraw (to any protocol)
 * - 200,000 gas for purchase
 * - 150,000 gas for stake
 *
 * For other signatures, use the following formula:
 *
 * arbgas <= 450,000                21,000
 * 450,000 < arbgas <= 750,000      50,000 + arbgas / 100
 * else                             (arbgas / 8) + 21_000;
 *
 * These gas costs are only averages and do not provide accurate data, but an estimation.
 *
 *
 * Similar to Optimistic Etherscan, Arbiscan does not return the total fee paid for a transaction.
 * The formula for the total fee paid is the following:
 *
 * l1Transaction + l1Calldata + l2Storage + l2Computation
 *
 * which are all values found in an eth_getTransactionReceipt JSON RPC call.
 *
 * For the current L1 gas, l1Calldata price retrieved by the eth_getTransactionReceipt
 * can be used. It is currently set to 15% higher than L1 gas price, which means
 * it should be close enough to L1 fast gas price.
 *
 */
export default class Arbitrum implements L2 {
    /**
     * Mapping for function signature => gas
     */
    private readonly gasMap: Map<string, number> = new Map([
        ["", 21_000],
        ["transfer", 50_000], // anything with "transfer"
        ["approve", 50_000],
        ["stake", 150_000], // anything with "stake"
        ["swap", 105_000], // anything with "swap"
        ["purchase", 200_000],
        ["deposit", 100_000],
        ["withdraw", 100_000], // anything with "withdraw"
        ["withdraw", 100_000],
        ["withdrawAndHarvest", 100_000],
        ["multicall", 150_000],
        ["addLiquidity", 200_000],
        ["addLiquidityETH", 200_000],
        ["addTokenLiquidity", 200_000],
        ["closePosition", 200_000],
        ["removeLiquidity", 200_000],
        ["removeLiquidityETH", 200_000],
        ["removeLiquidityWithPermit", 200_000],
        ["removeLiquidityETHWithPermit", 200_000],
        ["removeLiquidityETHSupportingFeeOnTransferTokens", 200_000],
        ["removeLiquidityETHWithPermitSupportingFeeOnTransferTokens", 200_000],
        ["swapExactTokensForTokens", 105_000],
        ["swapTokensForExactTokens", 105_000],
        ["swapExactETHForTokens", 105_000],
        ["swapTokensForExactETH", 105_000],
        ["swapExactTokensForETH", 105_000],
        ["swapETHForExactTokens", 105_000],
        ["swapExactTokensForTokensSupportingFeeOnTransferTokens", 105_000],
        ["swapExactETHForTokensSupportingFeeOnTransferTokens", 105_000],
        ["swapExactTokensForETHSupportingFeeOnTransferTokens", 105_000],
    ])

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
            current: 0,
            total: transactions.length,
        })

        if (transactions.length == 0) {
            return Utils.noSavings
        }

        const allSavings: TransactionSavings[] = []

        let totalL1Fees = 0
        let totalL2Fees = 0

        let totalL1GasPredicted = 0
        let totalL2GasSpent = 0

        let transactionsCalculated = 0
        for (const { hash, method } of transactions) {
            if (!Utils.connected) {
                throw new Error("Cancelled")
            }

            const receipt: any = await Utils.getCustomReceipt(
                process.env.REACT_APP_ARBITRUM_RPC!,
                hash
            )

            const paid: any = receipt.feeStats.paid

            const L2Gas = parseInt(receipt.gasUsed, 16)
            const L2Fee = Utils.weiToEther(
                BigInt(paid.l1Transaction) +
                    BigInt(paid.l1Calldata) +
                    BigInt(paid.l2Storage) +
                    BigInt(paid.l2Computation)
            )

            const L1Gas = this.getL1Gas(L2Gas, method)
            const L1Fee = Utils.weiToEther(
                BigInt(L1Gas) * BigInt(receipt.feeStats.prices.l1Calldata)
            )

            transactionsCalculated++

            this.onSavingCalculated({
                current: transactionsCalculated,
                total: transactions.length,
            })

            allSavings.push({
                L2: "arbitrum",
                hash,
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

        const totalL1FeesUsd = await Utils.ethToUsd(totalL1Fees)
        const totalL2FeesUsd = await Utils.ethToUsd(totalL2Fees)

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
     * @return all transactions hashes and their methods
     */
    private async getAllTransactions(): Promise<{ hash: string; method: string }[]> {
        const transactions = await Utils.fetch(
            `https://api.arbiscan.io/api?module=account&action=txlist&address=${this.address}&sort=desc&apikey=8PZFKWRJSCDH5SEJ6QP2DTM2QN6DK2Q1UV`
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
                    method: transaction.functionName.split("(")[0],
                }
            })
    }

    /**
     * @param L2Gas the amount of arbgas spent
     * @param method the readable function signature
     * @return estimated L1 gas
     */
    private getL1Gas(L2Gas: number, method: string): number {
        switch (true) {
            case method === "" && L2Gas >= 450_000:
                // Calculate amount based on gas, not transaction input
                return this.getL1Gas(L2Gas, "!")
            case method.includes("transfer"):
                return this.gasMap.get("transfer")!
            case method.includes("stake"):
                return this.gasMap.get("stake")!
            case method.includes("swap"):
                return this.gasMap.get("swap")!
            case method.includes("withdraw"):
                return this.gasMap.get("withdraw")!
            case this.gasMap.has(method):
                return this.gasMap.get(method)!
            case L2Gas <= 450_000:
                return 21_000
            case L2Gas <= 750_000:
                return Math.round(50_000 + L2Gas / 100)
            default:
                return Math.round(L2Gas / 8 + 21_000)
        }
    }
}
