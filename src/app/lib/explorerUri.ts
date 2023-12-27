export default function explorerUri(chain: AvailableL2s): string {
    switch (chain) {
        case "all":
            return "https://blockscan.com"
        case "optimism":
            return "https://optimistic.etherscan.io"
        case "arbitrum":
            return "https://arbiscan.io"
        case "zkSyncLite":
            return "https://zkscan.io"
        case "linea":
            return "https://lineascan.build"
        case "base":
            return "https://basescan.org"
    }
}
