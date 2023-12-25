import { noSavingsLocalized } from "./constants"

export default class SavingsData {
    public static localize(savings: AllSavings | undefined): AllSavingsLocalized {
        if (!savings) {
            return {
                optimism: noSavingsLocalized,
                arbitrum: noSavingsLocalized,
                zkSyncLite: noSavingsLocalized,
                linea: noSavingsLocalized,
                all: noSavingsLocalized,
            }
        }

        let chain: AvailableL2s
        for (chain in savings) {
            savings[chain] = SavingsData._localize(savings[chain])
        }

        return savings as unknown as AllSavingsLocalized
    }

    public static calculateTotalSavings(...savings: Savings[]): Savings {
        const total = savings.reduce((acc, obj) => (acc = SavingsData._sumObjects(acc, obj)))
        total.saved.timesCheaper = total.L1.feesSpent.ether / total.L2.feesSpent.ether
        return total
    }

    public static prepareDownload(savings: AllSavings): string {
        const savingsDup = JSON.parse(JSON.stringify(savings))
        savingsDup.all.details = []
        return encodeURIComponent(JSON.stringify(savingsDup))
    }

    private static _sumObjects(a: any, b: any): any {
        return Object.keys(a).reduce((acc: any, key: any) => {
            if (Array.isArray(b[key])) {
                acc[key] = a[key].concat(b[key])
            } else if (typeof b[key] === "object") {
                acc[key] = this._sumObjects(a[key], b[key])
            } else {
                acc[key] = (isNaN(a[key]) ? 0 : a[key]) + (isNaN(b[key]) ? 0 : b[key])
            }
            return acc
        }, {})
    }

    private static _localize(obj: any): any {
        for (const key in obj) {
            if (Array.isArray(obj[key])) {
                obj[key] = obj[key].map(this._localize)
            } else if (typeof obj[key] === "object") {
                obj[key] = this._localize(obj[key])
            } else if (typeof obj[key] !== "string" && isNaN(obj[key])) {
                obj[key] = "0"
            } else {
                if (typeof obj[key] === "number") {
                    obj[key] = obj[key].toFixed(5).toLocaleString()
                } else {
                    obj[key] = obj[key].toLocaleString()
                }
            }
        }
        return obj
    }
}
