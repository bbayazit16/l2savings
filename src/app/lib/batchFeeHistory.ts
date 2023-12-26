import customFetch from "./customfetch"

export default async function getBatchL1FeeHistory(
    blockNumbersHex: string[]
): Promise<{ [blockNumber: number]: bigint }> {
    const rpc = process.env.NEXT_PUBLIC_ETH_RPC!
    const response = await customFetch(rpc, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(
            blockNumbersHex.map((blockNumberHex, index) => ({
                jsonrpc: "2.0",
                method: "eth_feeHistory",
                params: [1, blockNumberHex, [50]],
                id: index,
            }))
        ),
    })

    const feeHistory: { [blockNumber: number]: bigint } = {}

    response.forEach((res: any) => {
        const { oldestBlock, reward, baseFeePerGas } = res.result
        const fee = BigInt(baseFeePerGas[0]) + BigInt(reward[0][0])
        feeHistory[oldestBlock] = fee
    })

    return feeHistory
}
