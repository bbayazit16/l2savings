import Utils from "../Utils"

/**
 * ZkSync class calculates savings for ZkSync.
 *
 * ======== Methodology ========
 *
 * ZkSync is a rollup using zero knowledge proof. It is currently not EVM compatible.
 * (ZkEVM is in testnet)
 *
 * Transactions have specific types, such as "transfer", "swap", "mint".
 * The most convenient way to calculate the savings is to hard code gas
 * amounts for each transaction type.
 *
 * Moreover, ZkSync allows users to pay fees with any supported ERC20 token. If the token
 * price is known, it should be converted to ETH.
 *
 * As usual, transactions that are L2 specific are not considered.
 *
 *
 *
 *   Fetch 100 Transactions
 *   ┌─────────┐                          ┌─────────────┐
 *   │L2Savings├───────────┬──────────────►api.zksync.io│
 *   └─────────┘           │              └──────┬──────┘
 *                         │                     │    Zero Transactions?  ┌──────┐       L2 -> L1 Gas Mapping
 *                         │                     ├────────────────────────┤Return│     ┌─────────────────────────┐
 *                         ├───────────◄─────────┘                        └──────┘     │ ETH Transfer -> 21,000  │
 *                         │ Request until there are                                   │ ERC20 Transfer -> 50,000│
 *                         │ no more txs or max limit reached                          │ Swap -> 105,000         │
 *        Append to Array  │                                                           │ Mint NFT -> 210,000     │
 *                         │                                                           └─────────────┬───────────┘
 *                         │                                                                         │
 *                         │                                                                         │
 *                      ┌──▼──┐   ┌─────────────┐   For Each Tx  ┌───────────┐                       │
 *                      │Array├───►Reverse Array├─▲──────────────►Transaction│                       │       ┌─────────────┐
 *                      └──┬──┘   └─────────────┘ │              └─────┬─────┘        {Deposit}      │       │Average daily│
 *                         │                      │                    │              {Withdraw}     │       │gas data     │
 *                         │                      │    Yes     ┌───────┴──────┐       {WithdrawNFT}  │       └──────┬──────┘
 * Get ETH prices in range │                      └────────────┤Is irrelevant?│====== {ForcedExit}   │              │
 *       of first and last │                                   └───────┬──────┘       {ChangePubKey} │              │
 *       transaction dates │                                           │                             │              │
 *                         │                                        No ├───────────────────────┐     │              │
 *                  ┌──────▼─────┐   Convert fees to ether with        │                       │     │              │
 *   _\|/^          │Poloniex API├─────────────┐respect to ether ┌─────▼────────┐      ┌───────▼─────▼─┐            │
 *    (_oo /        └────────────┘             │price on tx date │Fees paid with│      │Predict L1 gas │            │
 *   /-|--/                                    │  ┌──────────────┤stablecoins?  │      │from tx type   │            │
 *   \ |                                       │  │              └──────┬───────┘      └──────────┬────┘            │
 *     /--i                                    │  │                     │                         │                 │
 *    /   L                                  ┌─▼──▼─┐       No          │                         │                 │
 *    L                                      │Tx Fee◄───────────────────┘                         │                 │
 *     ▲               ┌──────┐              └───┬──┘                                             │                 │
 *     │  Return Data  │      │                  │                   ┌──────────┐                 │                 │
 *     └───────────────┤ Data ◄──────────────────┼───────────────────┤Fees if on│ Gas * Gas Price │                 │
 *                     │      │                  │                   │ Mainnet  ◄─────────────────┴─────────────────┘
 *                     └──▲───┘                  │                   └────┬─────┘
 *                        │               ┌──────▼──┐                     │
 *                        └───────────────┤Fee saved◄─────────────────────┘         Website Used: https://asciiflow.com/
 *                                        └─────────┘                               Stickman Art: https://ascii.co.uk/art/stickman
 */
export default class ZkSync implements L2 {
    /**
     * The address that the data will be collected for
     */
    private address: string

    /**
     * The callback to call when the savings of a transaction is calculated
     */
    private onSavingCalculated: (progress: CalcProgress) => void

    /**
     * Maximum amount of supported transactions
     */
    private readonly MAX_SUPPORTED_TRANSACTIONS = 1000

    /**
     * The mapping for transaction type => gas
     */
    private readonly gasMap = {
        ETHTransfer: {
            nativeGasSpent: 1045,
            L1gasSpent: 21_000,
        },
        ERC20Transfer: {
            nativeGasSpent: 1045,
            L1gasSpent: 50_000,
        },
        Swap: {
            nativeGasSpent: 2350,
            L1gasSpent: 105_000,
        },
        MintNFT: {
            nativeGasSpent: 2874,
            L1gasSpent: 210_000,
        },
    }

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
        let from: string = "latest"
        let fetchedTxCount = 0

        const allTransactions: any[][] = []

        while (fetchedTxCount < this.MAX_SUPPORTED_TRANSACTIONS) {
            const transactions: any[] = (
                await Utils.fetch(
                    `https://api.zksync.io/api/v0.2/accounts/${this.address}/transactions?from=${from}&limit=100&direction=older`
                )
            ).result.list

            if (transactions.length === 0 && fetchedTxCount === 0) {
                this.onSavingCalculated({
                    text: "Calculated savings",
                    current: 0,
                    total: 0,
                })
                return Utils.noSavings
            }

            allTransactions.push(transactions)

            if (transactions.length === 100) {
                from = transactions[transactions.length - 1].txHash
                fetchedTxCount += 100
            } else {
                break
            }
        }

        // Rerversing the transasctions array helps take batch transactions into account
        const reversedTransactions = allTransactions
            .map(arr => arr.reverse())
            .reverse()
            .flat()

        let totalTransactionsLength = reversedTransactions.filter(
            tx => tx.op.type === "Transfer" || tx.op.type === "Swap" || tx.op.type === "MintNFT"
        ).length

        // Try to predict the total transaction count after irrelevant transactions
        const seenBatchIds = new Set<number>()
        for (const { batchId } of reversedTransactions) {
            if (seenBatchIds.has(batchId)) {
                continue
            }

            totalTransactionsLength--
            seenBatchIds.add(batchId)
        }

        totalTransactionsLength--

        if (totalTransactionsLength < 0) {
            // Something went wrong
            totalTransactionsLength = 0
        }

        this.onSavingCalculated({
            text: "Fetching transaction receipts",
            current: 0,
            total: totalTransactionsLength,
        })

        let totalL1Fees = 0
        let totalL2Fees = 0

        let totalL1GasPredicted = 0
        let totalL2GasPredicted = 0

        let batchSize = 0

        const allSavings: TransactionSavings[] = []

        let transactionsCalculated = 0
        for (const transaction of reversedTransactions) {
            if (!Utils.connected) {
                throw new Error("Cancelled")
            }

            const op = transaction.op

            let feeToken = op.feeToken || 0

            const txTimestamp = Math.round(new Date(transaction.createdAt).getTime() / 1000)

            const transactionType: ZkSyncTransaction = op.type

            switch (true) {
                case transactionType === "Transfer" &&
                    op.from.toLowerCase() === this.address.toLowerCase(): {
                    feeToken = feeToken || transaction.op.token
                    const transferType = op.token === 0 ? "ETHTransfer" : "ERC20Transfer"

                    // Calculate the batch transaction price
                    if (transaction.batchId) {
                        const batchIsFinal = !(Utils.weiToEther(op.fee) === 0)
                        if (!batchIsFinal) {
                            batchSize++
                            continue
                        } else {
                            batchSize = batchSize === 0 ? 1 : batchSize

                            // the last tx of the batch
                            // batch count doesn't have to be increased again, because
                            // the value transferred is zero. It is assumed that
                            // every value transfer === ether transfer (21K gas on mainnet).
                            //
                            // fees paid include batch fees on zksync api
                            const L2Fee = await this.zkSyncFee(
                                feeToken,
                                Utils.weiToEther(op.fee),
                                txTimestamp,
                                false
                            )

                            const L1Fee =
                                batchSize *
                                (await Utils.averageDailyFee(
                                    txTimestamp,
                                    transferType === "ETHTransfer" ? "ethTransfer" : "erc20Transfer"
                                ))

                            totalL2Fees += L2Fee
                            totalL2GasPredicted +=
                                this.gasMap[transferType].nativeGasSpent * batchSize

                            totalL1GasPredicted += this.gasMap[transferType].L1gasSpent * batchSize
                            totalL1Fees += L1Fee

                            transactionsCalculated++

                            this.onSavingCalculated({
                                text: "Calculating fees",
                                current: transactionsCalculated,
                                total: totalTransactionsLength,
                            })

                            allSavings.push({
                                L2: "zkSync",
                                hash: transaction.txHash,
                                L2Fee,
                                L1Fee,
                                saved: L1Fee - L2Fee,
                                timesCheaper: L1Fee / L2Fee,
                            })

                            // reset batch size
                            batchSize = 0

                            continue
                        }
                    }

                    const L2Fee = await this.zkSyncFee(
                        feeToken,
                        Utils.weiToEther(op.fee),
                        txTimestamp,
                        false
                    )

                    const L1Fee = await Utils.averageDailyFee(
                        txTimestamp,
                        transferType === "ETHTransfer" ? "ethTransfer" : "erc20Transfer"
                    )

                    totalL2Fees += L2Fee
                    totalL2GasPredicted += this.gasMap[transferType].nativeGasSpent * batchSize

                    totalL1GasPredicted += this.gasMap[transferType].L1gasSpent * batchSize
                    totalL1Fees += L1Fee

                    transactionsCalculated++

                    this.onSavingCalculated({
                        text: "Calculating fees",
                        current: transactionsCalculated,
                        total: totalTransactionsLength,
                    })

                    allSavings.push({
                        L2: "zkSync",
                        hash: transaction.txHash,
                        L2Fee,
                        L1Fee,
                        saved: L1Fee - L2Fee,
                        timesCheaper: L1Fee / L2Fee,
                    })

                    break
                }
                case transactionType === "Swap" || transactionType === "MintNFT": {
                    const L2Fee = await this.zkSyncFee(
                        feeToken,
                        Utils.weiToEther(op.fee),
                        txTimestamp,
                        true
                    )

                    const L1Fee = await Utils.averageDailyFee(
                        txTimestamp,
                        transactionType === "Swap" ? "swap" : "mint"
                    )

                    totalL1Fees += L1Fee
                    totalL2Fees += L2Fee

                    totalL2GasPredicted += (this.gasMap as any)[transactionType].nativeGasSpent
                    totalL1GasPredicted += (this.gasMap as any)[transactionType].L1gasSpent

                    transactionsCalculated++

                    this.onSavingCalculated({
                        text: "Calculating fees",
                        current: transactionsCalculated,
                        total:
                            totalTransactionsLength > transactionsCalculated
                                ? totalTransactionsLength
                                : transactionsCalculated,
                    })

                    allSavings.push({
                        L2: "zkSync",
                        hash: transaction.txHash,
                        L2Fee,
                        L1Fee,
                        saved: L1Fee - L2Fee,
                        timesCheaper: L1Fee / L2Fee,
                    })

                    break
                }
                default: // Transaction is irrelevant
                    continue
            }
        }

        this.onSavingCalculated({
            text: "Calculated savings",
            current: allSavings.length,
            total: allSavings.length,
        })

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
                transactionsSent: allSavings.length,
                gasSpent: totalL2GasPredicted,
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
     * ZkSync allows users to pay in multiple tokens. The API returns the "token ID". This function
     * returns token ID, amount, and date to Ether. Average daily ETH price data is used unless the
     * date is not found, in which the current ETH price of the asset is returned.
     * https://zkscan.io/explorer/tokens/
     * @param tokenId token ID of ERC20 token
     * @param fee the amount of fee paid in ether
     * @param timestamp the timestamp of transaction
     * @param isExpensive return estimated random transaction price based on isExpensive
     * @return estimated ZkSync fee paid
     */
    private async zkSyncFee(tokenId: number, fee: number, timestamp: number, isExpensive: boolean) {
        if (tokenId === 0) {
            return fee
        }

        // Both NFT, ERC20 and Ether transfers are classified under the "transfer" function type.
        // If id = 0, it's an ether transfer. If the id is in token ID's, it's a token, otherwise an nft.
        // NFT token id's are usually "big" ~6 digits. The biggest token ID as of now is 173.
        // To avoid fetching https://api.zksync.io/api/v0.2/tokens/<id> each time to check whether a
        // transfer is an NFT transfer or not, ID size can be checked.
        if (tokenId <= 6 || tokenId >= 500) {
            // Token ID <= 6 all stables
            if (tokenId === 2 || tokenId === 4) {
                fee *= 10 ** 12 // USDC and USDT have 6 decimal places
            }
            return fee / (await Utils.ethPriceAt(timestamp))
        }

        // If fees are paid with an unknown token id, return a randomly chosen estimate
        if (isExpensive) {
            console.warn(
                `Fees paid in unsupported token ID ${tokenId} for ZkSync. Assumed 0.0002Ξ TX Fee`
            )
            return 0.0002
        }

        console.warn(
            `Fees paid in unsupported token ID ${tokenId} for ZkSync. Assumed 0.0001Ξ TX Fee`
        )
        return 0.0001
    }
}
