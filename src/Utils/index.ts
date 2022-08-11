import optimism from "../Assets/Image/optimism.svg"
import arbitrum from "../Assets/Image/arbitrum.svg"
import zksync from "../Assets/Image/zksync.svg"

import WalletConnectProvider from "@walletconnect/ethereum-provider"

import { CryptoStatsSDK } from "@cryptostats/sdk"
import { createIcon } from "@download/blockies"
import { ethers } from "ethers"

/** For the classes that manage savings calculations, @see Savings folder in the parent directory */
export default class Utils {
    private static readonly provider = new ethers.providers.JsonRpcProvider(
        process.env.REACT_APP_ETH_RPC!
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
        Utils.provider
    )

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
        Utils.provider
    )

    private static readonly sdk = new CryptoStatsSDK()

    private static ethUsdlatestOracleAnswer: number | undefined
    private static gasPriceLatestOracleAnswer: number | undefined

    private static blockiesCache: Map<string, string> = new Map()
    private static ethPriceCache: Map<number, number> = new Map()

    public static connected: boolean = false

    private static hasAlert: boolean = false

    public static readonly noProgress: CalcProgress = {
        text: "Fetching transaction receipts",
        current: 0,
        total: undefined,
    }

    public static readonly noSavings = {
        L1: {
            gasSpent: 0,
            feesSpent: {
                ether: 0,
                usd: 0,
            },
        },
        L2: {
            transactionsSent: 0,
            gasSpent: 0,
            feesSpent: {
                ether: 0,
                usd: 0,
            },
        },
        saved: {
            ether: 0,
            usd: 0,
            timesCheaper: 0,
        },
        details: [],
    }

    private static readonly noSavingsLocalized = {
        L1: {
            gasSpent: "...",
            feesSpent: {
                ether: "...",
                usd: "...",
            },
        },
        L2: {
            transactionsSent: "...",
            gasSpent: "...",
            feesSpent: {
                ether: "...",
                usd: "...",
            },
        },
        saved: {
            ether: "...",
            usd: "...",
            timesCheaper: "...",
        },
        details: [],
    }

    public static localizeChain(chain: AvailableL2s): string {
        return chain === "all" ? "All L2's" : chain.charAt(0).toUpperCase() + chain.slice(1)
    }

    public static chainToAsset(chain: AvailableL2s): string {
        switch (chain) {
            case "all":
                return "bg-gradient-to-r from-green-700 via-cyan-600 to-blue-400"
            case "optimism":
                return optimism
            case "arbitrum":
                return arbitrum
            case "zkSync":
                return zksync
        }
    }

    public static explorerURI(chain: AvailableL2s): string {
        switch (chain) {
            case "all":
                return "https://blockscan.com"
            case "optimism":
                return "https://optimistic.etherscan.io"
            case "arbitrum":
                return "https://arbiscan.io"
            case "zkSync":
                return "https://zkscan.io"
        }
    }

    public static weiToEther(num: number | bigint): number {
        return parseFloat(ethers.utils.formatEther(num))
    }

    public static async ethToUsd(amount: number): Promise<number> {
        return amount * (await Utils._ethPrice())
    }

    public static truncateTransactionHash(hash: string): string {
        return hash.slice(0, 6) + "..." + hash.slice(-6)
    }

    public static async averageDailyFee(
        timestamp: number,
        type: "swap" | "mint" | "ethTransfer" | "erc20Transfer"
    ): Promise<number> {
        let averageSwapFee: number

        try {
            averageSwapFee = parseFloat(
                (
                    await this.sdk.graph
                        .query(
                            "dmihal/ethereum-average-fees",
                            `{dayStat(id:${Math.floor(timestamp / 86_400)}){averageSwapCostETH}}`
                        )
                        .catch(async err => {
                            console.warn(
                                `Error fetching average daily fee ${type} at ${Math.floor(
                                    timestamp
                                )}, returning current fee`
                            )
                            const ethGasPrice = await Utils._fastGas()
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
            const ethGasPrice = await Utils._fastGas()
            averageSwapFee = ethGasPrice * 105_000
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

    public static async ethPriceAt(timestamp: number): Promise<number> {
        const dayTimestamp = Math.floor(timestamp / 86_400)

        if (Utils.ethPriceCache.has(dayTimestamp)) {
            return Utils.ethPriceCache.get(dayTimestamp)!
        }

        try {
            const {
                dayStat: { averageSwapCostETH, averageSwapCostUSD },
            } = await this.sdk.graph
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
                            averageSwapCostETH: 1,
                            averageSwapCostUSD: await Utils._ethPrice(),
                        },
                    }
                })

            const ethPrice = parseFloat(averageSwapCostUSD) / parseFloat(averageSwapCostETH)
            Utils.ethPriceCache.set(dayTimestamp, ethPrice)

            return ethPrice
        } catch {
            console.warn(
                `Ether price at ${Math.floor(timestamp)} not found, returning current price`
            )

            const ethPrice = await Utils._ethPrice()
            Utils.ethPriceCache.set(dayTimestamp, ethPrice)
            return ethPrice
        }
    }

    public static async fetch(
        url: string,
        params: any = {},
        totalRetries: number = 0,
        failed: boolean = false
    ): Promise<any> {
        const response = await fetch(url, params).catch(_ => {
            return { ok: false, status: 404, json: () => {} }
        })

        if (totalRetries === 10 && !failed) {
            if (!Utils.hasAlert) {
                Utils.hasAlert = true
                alert(
                    "Api endpoints receiving too many requests at the moment. Consider trying again later."
                )
            }
            throw new Error(`Failed to fetch: 429 Too Many Requests ${url}`)
        } else if (totalRetries === 5 && failed) {
            if (!Utils.hasAlert) {
                Utils.hasAlert = true
                alert(
                    "Network error! One of the services used may be down. Consider trying again later."
                )
            }
            throw new Error(`Failed to fetch ${url}`)
        }

        if (response.status === 429) {
            await new Promise(p => setTimeout(p, 2048 * (totalRetries + 1)))
            return Utils.fetch(url, params, totalRetries + 1)
        } else if (!response.ok) {
            await new Promise(p => setTimeout(p, 2048 * (totalRetries + 1)))
            return Utils.fetch(url, params, totalRetries + 1, true)
        }

        return await response.json()
    }

    // DEPRECATED, until required again
    //
    //
    // public static async getCustomReceipt(url: string, hash: string): Promise<any> {
    //     const response = await Utils.fetch(url, {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({
    //             jsonrpc: "2.0",
    //             method: "eth_getTransactionReceipt",
    //             params: [hash],
    //             id: 1,
    //         }),
    //     })

    //     return response.result
    // }

    public static async getBatchCustomReceipts(url: string, hashes: string[]): Promise<any> {
        const response = await Utils.fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(
                hashes.map((hash, index) => ({
                    jsonrpc: "2.0",
                    method: "eth_getTransactionReceipt",
                    params: [hash],
                    id: index,
                }))
            ),
        })
        // Wait for two seconds after batch requests to avoid limits
        await new Promise(p => setTimeout(p, 2000))

        return response.map((res: any) => res.result)
    }

    public static chunk<T>(array: T[], size: number): T[][] {
        const chunks = []

        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size))
        }

        return chunks
    }

    public static async connectWallet(
        connectionType: "metamask" | "walletconnect",
        setAccount: (account: Account) => void
    ) {
        let account: Account
        switch (connectionType) {
            case "metamask": {
                if (!window.ethereum) {
                    alert("Metamask or an injected provider not found!")
                    return
                }

                const accounts = await window.ethereum.request({
                    method: "eth_requestAccounts",
                })

                const address = ethers.utils.getAddress(accounts[0])
                localStorage.setItem("connectionType", "metamask")

                account = {
                    address: address,
                    displayAddress: Utils._shorten(address),
                    profilePhoto: Utils._createIdenticon(address),
                }

                Utils.connected = true
                setAccount(account)

                break
            }
            case "walletconnect": {
                const provider = new WalletConnectProvider()

                await provider.enable().catch(() => {})

                const accounts = (await provider.request({
                    method: "eth_requestAccounts",
                })) as string[]

                const address = ethers.utils.getAddress(accounts[0])
                localStorage.setItem("connectionType", "walletconnect")

                window.tempEthereum = window.ethereum
                window.ethereum = provider

                account = {
                    address: address,
                    displayAddress: Utils._shorten(address),
                    profilePhoto: Utils._createIdenticon(address),
                }

                Utils.connected = true
                setAccount(account)

                break
            }
        }

        Utils._fetchMetadata(account, setAccount)
    }

    public static async safeConnect(setAccount: (account: Account) => void) {
        const lastConnectionType = localStorage.getItem("connectionType")

        if (!lastConnectionType) return

        if (lastConnectionType === "metamask" || lastConnectionType === "walletconnect") {
            Utils.connectWallet(lastConnectionType, setAccount)
        } else {
            // ??? Storage corrupted
            localStorage.clear()
            window.location.reload()
        }
    }

    public static listenAccountChanges(
        setAccount: (account: Account) => void,
        resetSavings: () => void
    ) {
        if (!window.ethereum) {
            return
        }

        window.ethereum.on("accountsChanged", (accounts: string[]) => {
            if (accounts.length !== 0) {
                Utils.safeConnect(setAccount)
            } else {
                Utils.disconnectWallet(setAccount, resetSavings)
            }
        })

        window.ethereum.on("disconnect", () => {
            Utils.disconnectWallet(setAccount, resetSavings)
        })
    }

    public static disconnectWallet(
        setAccount: (account: Account) => void,
        resetSavings: () => void
    ) {
        Utils.connected = false

        setAccount({ address: undefined })
        resetSavings()

        localStorage.removeItem("connectionType")

        if (window.tempEthereum) {
            window.ethereum = window.tempEthereum
            window.tempEthereum = undefined
        }
    }

    // Converts strings to float during sort, unless otherwise specified by
    // isString. The "dont" thing saves a few lines of code
    public static sortBy<T>(arr: T[], key: keyof T | "dont", isString: boolean = false): T[] {
        if (key === "dont") {
            return arr
        }

        return arr.sort((a, b) => {
            if (isString) {
                if (a[key] < b[key]) return -1
                if (a[key] > b[key]) return 1
                return 0
            }

            if (parseFloat(a[key] as unknown as string) < parseFloat(b[key] as unknown as string))
                return -1
            if (parseFloat(a[key] as unknown as string) > parseFloat(b[key] as unknown as string))
                return 1

            return 0
        })
    }

    public static localize(savings: AllSavings | undefined): AllSavingsLocalized {
        if (!savings) {
            return {
                optimism: Utils.noSavingsLocalized,
                arbitrum: Utils.noSavingsLocalized,
                zkSync: Utils.noSavingsLocalized,
                all: Utils.noSavingsLocalized,
            }
        }

        let chain: AvailableL2s
        for (chain in savings) {
            savings[chain] = Utils._localize(savings[chain])
        }

        return savings as unknown as AllSavingsLocalized
    }

    public static calculateTotalSavings(...savings: Savings[]): Savings {
        const total = savings.reduce((acc, obj) => (acc = this._sumObjects(acc, obj)))
        total.saved.timesCheaper = total.L1.feesSpent.ether / total.L2.feesSpent.ether
        return total
    }

    public static prepareDownload(savings: AllSavings): string {
        const savingsDup = JSON.parse(JSON.stringify(savings))
        savingsDup.all.details = []
        return encodeURIComponent(JSON.stringify(savingsDup))
    }

    private static _shorten(address: string): string {
        return address.substring(0, 6) + "..." + address.substring(address.length - 4)
    }

    private static _createIdenticon(address: string): string {
        if (!Utils.blockiesCache.has(address)) {
            Utils.blockiesCache.set(
                address,
                createIcon({
                    seed: address.toLowerCase(),
                    size: 8,
                    scale: 16,
                }).toDataURL("image/png")
            )
        }
        return Utils.blockiesCache.get(address)!
    }

    private static async _ethPrice(): Promise<number> {
        if (Utils.ethUsdlatestOracleAnswer) return Utils.ethUsdlatestOracleAnswer

        const response = await Utils.ethUsdOracle.latestAnswer()

        Utils.ethUsdlatestOracleAnswer = parseInt(response) / 100000000
        return Utils.ethUsdlatestOracleAnswer
    }

    private static async _fastGas(): Promise<number> {
        if (Utils.gasPriceLatestOracleAnswer) return Utils.gasPriceLatestOracleAnswer

        const response = await Utils.gasPriceOracle.latestAnswer()

        Utils.gasPriceLatestOracleAnswer = Utils.weiToEther(parseInt(response))
        return Utils.gasPriceLatestOracleAnswer
    }

    private static _sumObjects(a: any, b: any): any {
        return Object.keys(a).reduce((acc: any, key: any) => {
            if (Array.isArray(b[key])) {
                acc[key] = a[key].concat(b[key])
            } else if (typeof b[key] === "object") {
                acc[key] = this._sumObjects(a[key], b[key])
            } else {
                acc[key] = (isNaN(a[key]) ? 0 : a[key]) + (isNaN(b[key]) ? 0 : b[key])
            }
            return acc
        }, {})
    }

    private static _localize(obj: any): any {
        for (const key in obj) {
            if (Array.isArray(obj[key])) {
                obj[key] = obj[key].map(this._localize)
            } else if (typeof obj[key] === "object") {
                obj[key] = this._localize(obj[key])
            } else if (typeof obj[key] !== "string" && isNaN(obj[key])) {
                obj[key] = "0"
            } else {
                if (typeof obj[key] === "number") {
                    obj[key] = obj[key].toFixed(4).toLocaleString()
                } else {
                    obj[key] = obj[key].toLocaleString()
                }
            }
        }
        return obj
    }

    private static async _fetchMetadata(account: Account, setAccount: (account: Account) => void) {
        if (!account.address) return

        const ENS = await Utils.provider.lookupAddress(account.address)

        let profilePhoto: string

        if (ENS) {
            if (!Utils.connected) {
                return
            }

            setAccount({
                address: account.address,
                ENS: ENS,
                displayAddress: ENS,
                profilePhoto: account.profilePhoto,
            })

            const avatar = await Utils.provider.getAvatar(ENS)
            profilePhoto = avatar || Utils._createIdenticon(account.address)
        } else {
            profilePhoto = Utils._createIdenticon(account.address)
        }

        if (!Utils.connected) {
            return
        }

        setAccount({
            address: account.address,
            ENS: ENS || undefined, // ENS type declared as undefined, not null
            displayAddress: ENS || account.displayAddress,
            profilePhoto: profilePhoto,
        })
    }
}
