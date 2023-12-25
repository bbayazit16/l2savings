export default function sortBy<T>(arr: T[], key: keyof T, isString: boolean = false): T[] {
    return arr.sort((a, b) => {
        if (isString) {
            if (a[key] < b[key]) return -1
            if (a[key] > b[key]) return 1
            return 0
        }

        if (parseFloat(a[key] as unknown as string) < parseFloat(b[key] as unknown as string))
            return -1
        if (parseFloat(a[key] as unknown as string) > parseFloat(b[key] as unknown as string))
            return 1

        return 0
    })
}
