type AvailableL2s = "all" | "optimism" | "arbitrum" | "zkSyncLite"

export default function localizeChain(chain: AvailableL2s): string {
    switch (chain) {
        case "all":
            return "All L2s"
        case "optimism":
            return "Optimism"
        case "arbitrum":
            return "Arbitrum"
        case "zkSyncLite":
            return "ZkSync Lite"
    }
}
