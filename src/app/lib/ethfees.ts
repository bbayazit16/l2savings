import { CryptoStatsSDK } from "@cryptostats/sdk"
import { ethers } from "ethers"
import provider from "./provider"
import chunk from "./chunk"
import getBatchL1FeeHistory from "./batchFeeHistory"

export default class EthFees {
    private static gasCache: Map<number, number> = new Map()
    private static ethPriceCache: Map<number, number> = new Map()
    private static readonly sdk = new CryptoStatsSDK()

    private static gasPriceLatestOracleAnswer: number | undefined
    private static ethUsdlatestOracleAnswer: number | undefined

    private static readonly gasPriceOracle = new ethers.Contract(
        "0x169E633A2D1E6c10dD91238Ba11c4A708dfEF37C",
        [
            {
                constant: true,
                inputs: [],
                name: "latestAnswer",
                outputs: [{ name: "", type: "int256" }],
                payable: false,
                stateMutability: "view",
                type: "function",
            },
        ],
        provider
    )

    private static readonly ethUsdOracle = new ethers.Contract(
        "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
        [
            {
                constant: true,
                inputs: [],
                name: "latestAnswer",
                outputs: [{ name: "", type: "int256" }],
                payable: false,
                stateMutability: "view",
                type: "function",
            },
        ],
        provider
    )

    public static async averageDailyFee(
        timestamp: number,
        type: "swap" | "mint" | "ethTransfer" | "erc20Transfer" | number
    ): Promise<number> {
        const nTimestamp = Math.floor(timestamp / 86_400)
        let averageSwapFee: number

        if (EthFees.gasCache.has(nTimestamp)) {
            averageSwapFee = EthFees.gasCache.get(nTimestamp)!
        } else {
            try {
                averageSwapFee = parseFloat(
                    (
                        await EthFees.sdk.graph
                            .query(
                                "dmihal/ethereum-average-fees",
                                `{dayStat(id:${nTimestamp}){averageSwapCostETH}}`
                            )
                            .catch(async () => {
                                console.warn(
                                    `Error fetching average daily fee ${type} at ${Math.floor(
                                        timestamp
                                    )}, returning current fee`
                                )
                                const ethGasPrice = await EthFees._fastGas()
                                return { dayStat: { averageSwapCostETH: ethGasPrice * 105_000 } }
                            })
                    ).dayStat.averageSwapCostETH
                )
            } catch {
                console.warn(
                    `Average daily fee ${type} at ${Math.floor(
                        timestamp
                    )} not found, returning current fee`
                )
                const ethGasPrice = await EthFees._fastGas()
                averageSwapFee = ethGasPrice * 105_000
            }
        }

        EthFees.gasCache.set(nTimestamp, averageSwapFee)

        if (typeof type === "number") {
            return (averageSwapFee / 105_000) * type
        }

        switch (type) {
            case "ethTransfer":
                return averageSwapFee / 5
            case "erc20Transfer":
                return averageSwapFee / 2.1
            case "swap":
                return averageSwapFee
            case "mint":
                return averageSwapFee * 2
        }
    }

    public static async getGasFeesAtBlocks(
        l1Blocks: string[],
        currentProgress?: (current: number) => void
    ): Promise<{ [blockNumber: string]: bigint }> {
        const chunkSize = 10
        const delayTime = 500
        const retryLimit = 4

        const chunkedBlocks = chunk(l1Blocks, chunkSize)
        let allResults: { [blockNumber: string]: bigint } = {}

        for (let i = 0; i < chunkedBlocks.length; i++) {
            let retries = 0
            while (retries < retryLimit) {
                try {
                    const result = await getBatchL1FeeHistory(chunkedBlocks[i])
                    allResults = { ...allResults, ...result }
                    if (currentProgress) currentProgress(i * chunkSize)
                    break
                } catch (error) {
                    console.error(`Error fetching data for chunk: ${error}`)
                    retries++
                    if (retries === retryLimit) {
                        throw new Error(`Failed to fetch data after ${retryLimit} retries.`)
                    }
                }
            }
            await new Promise(resolve => setTimeout(resolve, delayTime))
        }

        if (currentProgress) currentProgress(l1Blocks.length)
        return allResults
    }

    public static async cacheGasTimestamps(timestamps: number[]) {
        const seenTimestamps = new Set<number>()

        let queryString = "{"
        for (const timestamp of timestamps) {
            const nTimestamp = Math.floor(timestamp / 86_400)

            if (seenTimestamps.has(nTimestamp) || EthFees.gasCache.has(nTimestamp)) {
                continue
            }

            seenTimestamps.add(nTimestamp)

            queryString += `x${nTimestamp}: dayStat(id: ${nTimestamp}) {averageSwapCostETH}`
        }
        queryString += "}"

        let response: any
        try {
            response = await EthFees.sdk.graph
                .query("dmihal/ethereum-average-fees", queryString)
                .catch(async () => {
                    console.warn(
                        "Error caching average daily fees, proceeding without average gas cache"
                    )
                    response = undefined
                })
        } catch {
            response = undefined
        }

        if (!response) {
            return
        }

        for (const key in response) {
            const timestamp = parseInt(key.substring(1))

            if (!response[key]) {
                const ethGasPrice = await EthFees._fastGas()
                EthFees.gasCache.set(timestamp, ethGasPrice * 105_000)
                continue
            }

            const swapCost = parseFloat(response[key].averageSwapCostETH)
            EthFees.gasCache.set(timestamp, swapCost)
        }
    }

    public static async ethPriceAt(timestamp: number): Promise<number> {
        const dayTimestamp = Math.floor(timestamp / 86_400)

        if (EthFees.ethPriceCache.has(dayTimestamp)) {
            return EthFees.ethPriceCache.get(dayTimestamp)!
        }

        try {
            const {
                dayStat: { averageSwapCostETH, averageSwapCostUSD },
            } = await EthFees.sdk.graph
                .query(
                    "dmihal/ethereum-average-fees",
                    `{dayStat(id:${dayTimestamp}){averageSwapCostETH\naverageSwapCostUSD}}`
                )
                .catch(async () => {
                    console.warn(
                        `Error fetching Ether price at ${Math.floor(
                            timestamp
                        )}, returning current price`
                    )
                    return {
                        dayStat: {
                            // averageSwapCostETH is later divided to averageSwapCostUSD
                            // so this works fine.
                            averageSwapCostETH: 1,
                            averageSwapCostUSD: await EthFees._ethPrice(),
                        },
                    }
                })

            const ethPrice = parseFloat(averageSwapCostUSD) / parseFloat(averageSwapCostETH)
            EthFees.ethPriceCache.set(dayTimestamp, ethPrice)

            return ethPrice
        } catch {
            console.warn(
                `Ether price at ${Math.floor(timestamp)} not found, returning current price`
            )

            const ethPrice = await EthFees._ethPrice()
            EthFees.ethPriceCache.set(dayTimestamp, ethPrice)
            return ethPrice
        }
    }

    public static weiToEther(num: number | bigint): number {
        return parseFloat(ethers.formatEther(num))
    }

    public static async ethToUsd(amount: number): Promise<number> {
        return amount * (await EthFees._ethPrice())
    }

    private static async _ethPrice(): Promise<number> {
        if (EthFees.ethUsdlatestOracleAnswer) return EthFees.ethUsdlatestOracleAnswer

        const response = await EthFees.ethUsdOracle.latestAnswer()

        EthFees.ethUsdlatestOracleAnswer = parseInt(response) / 100000000
        return EthFees.ethUsdlatestOracleAnswer
    }

    private static async _fastGas(): Promise<number> {
        if (EthFees.gasPriceLatestOracleAnswer) return EthFees.gasPriceLatestOracleAnswer

        const response = await EthFees.gasPriceOracle.latestAnswer()

        EthFees.gasPriceLatestOracleAnswer = EthFees.weiToEther(parseInt(response))
        return EthFees.gasPriceLatestOracleAnswer
    }
}
