export default function chainToAsset(chain: AvailableL2s): string {
    switch (chain) {
        case "all":
            return "bg-gradient-to-r from-green-700 via-cyan-600 to-blue-400"
        case "optimism":
            return "/optimism.svg"
        case "arbitrum":
            return "/arbitrum.svg"
        case "zkSyncLite":
            return "/zksync.svg"
        case "linea":
            return "/linea.svg"
    }
}
