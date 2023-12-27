import customFetch from "./customfetch"

export default async function getBatchCustomReceipts(url: string, hashes: string[]): Promise<any> {
    const response = await customFetch(url, {
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

    return response.map((res: any) => {
        if (!res.result) {
            throw new Error(`Api limit`)
        }
        return res.result
    })
}
