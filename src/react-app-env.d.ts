/// <reference types="react-scripts" />
declare module "@download/blockies"

interface Window {
    ethereum?: any
    tempEthereum?: any
}

interface Account {
    address?: string
    ENS?: string
    displayAddress?: string
    profilePhoto?: string
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
    blockNumber: string
    functionName: string
    txreceipt_status: "0" | "1"
}

type AvailableL2s = "all" | "optimism" | "arbitrum" | "zkSync"

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
    text: "Fetching transaction receipts" | "Calculating fees" | "Calculated savings",
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

type ZkSyncTransaction = "Transfer" | "Swap" | "MintNFT"

interface AllSavings {
    all: Savings
    optimism: Savings
    arbitrum: Savings
    zkSync: Savings
}

interface AllSavingsLocalized {
    all: LocalizedSavings
    optimism: LocalizedSavings
    arbitrum: LocalizedSavings
    zkSync: LocalizedSavings
}

interface L2 {
    calculateSavings(): Promise<Savings>
}
