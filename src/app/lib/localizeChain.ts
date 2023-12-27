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
        case "linea":
            return "Linea"
        case "base":
            return "Base"
    }
}
