export const noProgress: CalcProgress = {
    text: "Fetching transaction receipts",
    current: 0,
    total: undefined,
}

export const noSavings = {
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

export const noSavingsLocalized = {
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

type CommonL2Color = {
    dataColor: string
    chainColor: string
}

type L2Colors = {
    dataColor: string
    chainColor: string
}

type ColorMapType = {
    [K in AvailableL2s]: L2Colors
} & {
    mainnet: string
}

export const colorMap: ColorMapType = {
    all: {
        dataColor: "#47BF61",
        chainColor: "#51c72a",
    },
    optimism: {
        dataColor: "#BF4747",
        chainColor: "#EA3431",
    },
    arbitrum: {
        dataColor: "#4E82EA",
        chainColor: "#4E9FEA",
    },
    zkSyncLite: {
        dataColor: "#6E73B8",
        chainColor: "#4E5395",
    },
    linea: {
        dataColor: "#F5A623",
        chainColor: "#F04623",
    },
    base: {
        dataColor: "#3F6AD1",
        chainColor: "#1C5BF0",
    },
    mainnet: "#6872ab",
}
