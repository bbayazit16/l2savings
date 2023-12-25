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
    console.log("response", hashes, response)
    // Wait for two seconds after batch requests to avoid limits
    await new Promise(p => setTimeout(p, 2000))

    return response.map((res: any) => res.result)
}
