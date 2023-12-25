export default async function customFetch(
    url: string,
    params: any = {},
    totalRetries: number = 0,
    failed: boolean = false
): Promise<any> {
    params["cache"] = "no-store"
    const response = await fetch(url, params).catch(_ => {
        return { ok: false, status: 404, json: () => {} }
    })

    if (totalRetries === 16 && !failed) {
        alert(
            "Api endpoints receiving too many requests at the moment. Consider trying again later."
        )
        throw new Error(`Failed to fetch: 429 Too Many Requests ${url}`)
    } else if (totalRetries === 5 && failed) {
        alert("Network error! One of the services used may be down. Consider trying again later.")
        throw new Error(`Failed to fetch ${url}`)
    }

    if (response.status === 429) {
        await new Promise(p => setTimeout(p, 1536 * (totalRetries + 1)))
        return customFetch(url, params, totalRetries + 1)
    } else if (!response.ok) {
        await new Promise(p => setTimeout(p, 1536 * (totalRetries + 1)))
        return customFetch(url, params, totalRetries + 1, true)
    }

    return await response.json()
}
