import { noSavings, noSavingsLocalized } from "./constants"

export default class SavingsData {
    public static localize(savings: AllSavings | undefined): AllSavingsLocalized {
        if (!savings) {
            return {
                optimism: JSON.parse(JSON.stringify(noSavingsLocalized)),
                arbitrum: JSON.parse(JSON.stringify(noSavingsLocalized)),
                zkSyncLite: JSON.parse(JSON.stringify(noSavingsLocalized)),
                linea: JSON.parse(JSON.stringify(noSavingsLocalized)),
                base: JSON.parse(JSON.stringify(noSavingsLocalized)),
                all: JSON.parse(JSON.stringify(noSavingsLocalized)),
            }
        }

        let chain: AvailableL2s
        for (chain in savings) {
            savings[chain] = SavingsData._localize(savings[chain])
        }

        return savings as unknown as AllSavingsLocalized
    }

    public static calculateTotalSavings(...savings: Savings[]): Savings {
        const total = JSON.parse(JSON.stringify(noSavings))

        savings.forEach(s => {
            total.L1.gasSpent += s.L1.gasSpent
            total.L1.feesSpent.ether += s.L1.feesSpent.ether
            total.L1.feesSpent.usd += s.L1.feesSpent.usd

            total.L2.transactionsSent += s.L2.transactionsSent
            total.L2.gasSpent += s.L2.gasSpent
            total.L2.feesSpent.ether += s.L2.feesSpent.ether
            total.L2.feesSpent.usd += s.L2.feesSpent.usd

            total.saved.ether += s.saved.ether
            total.saved.usd += s.saved.usd

            total.details = total.details.concat(s.details)
        })

        total.saved.timesCheaper =
            total.L2.feesSpent.ether !== 0 ? total.L1.feesSpent.ether / total.L2.feesSpent.ether : 0

        return total
    }

    public static prepareDownload(savings: AllSavings): string {
        const savingsDup = JSON.parse(JSON.stringify(savings))
        savingsDup.all.details = []
        return encodeURIComponent(JSON.stringify(savingsDup))
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
