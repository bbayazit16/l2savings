export default function truncateTransactionHash(hash: string): string {
    return hash.slice(0, 6) + "..." + hash.slice(-6)
}
