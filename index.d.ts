declare module "@download/blockies"

interface Account {
    address: string
    ENS?: string
    displayAddress: string
    profilePhoto: string
}

interface Transaction {
    to: string
    from: string
    hash: string
    value: string
    input: string
    nonce: string
    gasUsed: string
    gasPrice: string
    timeStamp: string
    blockNumber: string
    functionName: string
    txreceipt_status: "0" | "1"
}

type AvailableL2s = "all" | "optimism" | "arbitrum" | "zkSyncLite" | "linea" | "base"

interface TransactionSavings {
    L2: AvailableL2s
    hash: string
    L2Fee: number
    L1Fee: number
    saved: number
    timesCheaper: number
}

interface TransactionSavingsLocalized {
    L2: AvailableL2s
    hash: string
    L2Fee: string
    L1Fee: string
    saved: string
    timesCheaper: string
}

interface CalcProgress {
    text: "Fetching transaction receipts" | "Calculating fees" | "Calculated savings"
    current: number
    total?: number
}

interface Savings {
    L1: {
        gasSpent: number
        feesSpent: {
            ether: number
            usd: number
        }
    }
    L2: {
        transactionsSent: number
        gasSpent: number
        feesSpent: {
            ether: number
            usd: number
        }
    }
    saved: {
        ether: number
        usd: number
        timesCheaper: number
    }
    details: TransactionSavings[]
}

interface LocalizedSavings {
    L1: {
        gasSpent: string
        feesSpent: {
            ether: string
            usd: string
        }
    }
    L2: {
        transactionsSent: string
        gasSpent: string
        feesSpent: {
            ether: string
            usd: string
        }
    }
    saved: {
        ether: string
        usd: string
        timesCheaper: string
    }
    details: TransactionSavingsLocalized[]
}

type ZkSyncLiteTransaction = "Transfer" | "Swap" | "MintNFT"

type AllSavings = {
    [K in AvailableL2s]: Savaings
}

type AllSavingsLocalized = {
    [K in AvailableL2s]: LocalizedSavings
}

interface L2 {
    calculateSavings(): Promise<Savings>
}
