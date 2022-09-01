import Utils from "../../Utils"

interface ISavingsParagraph {
    savings: AllSavings | undefined
    viewing: AvailableL2s
}

const colorMap = {
    all: {
        dataColor: "#47BF61",
        chainColor: "#5FEA31",
    },
    optimism: {
        dataColor: "#BF4747",
        chainColor: "#EA3431",
    },
    arbitrum: {
        dataColor: "#4E82EA",
        chainColor: "#4E9FEA",
    },
    zkSync: {
        dataColor: "#6E73B8",
        chainColor: "#4E5395",
    },
    mainnet: "#6872ab",
}

const SavingsParagraph = ({ savings, viewing }: ISavingsParagraph) => {
    const localizedSavings = Utils.localize(savings)

    const { L2, L1, saved: total } = localizedSavings[viewing]

    const stat = (
        text: string,
        what: "ether" | "usd" | "x" | "transactions" | "transaction" | "gas",
        final: boolean = false
    ): JSX.Element => {
        return (
            <span style={{ color: final ? "#e32320" : colorMap[viewing].dataColor }}>
                {what === "ether"
                    ? `Ξ${text}`
                    : what === "usd"
                    ? `$${text === "..." ? text : parseFloat(text).toFixed(1).toLocaleString()}`
                    : what === "x"
                    ? `${text === "..." ? text : parseFloat(text).toFixed(1).toLocaleString()}x`
                    : `${text === "..." ? text : parseInt(text).toLocaleString()} ${what}`}
            </span>
        )
    }

    const chain = (
        <span style={{ color: colorMap[viewing].chainColor }}>{Utils.localizeChain(viewing)}</span>
    )

    const getEmoji = (emoji: string): string => {
        return L2.feesSpent.ether !== "..."
            ? parseInt(L2.transactionsSent) === 0
                ? "😐"
                : emoji
            : "😴"
    }

    console.log(L2.transactionsSent)

    const mainnet = <span style={{ color: colorMap.mainnet }}>Ethereum Mainnet</span>

    return (
        <div className="flex flex-col p-5 space-y-8">
            <p className="font-bold text-3xl">
                You have sent{" "}
                {stat(
                    L2.transactionsSent,
                    parseInt(L2.transactionsSent) === 1 ? "transaction" : "transactions"
                )}{" "}
                on {chain} and used {stat(L2.gasSpent, "gas")}. This has cost you{" "}
                {stat(L2.feesSpent.ether, "ether")}, worth {stat(L2.feesSpent.usd, "usd")}.{" "}
                {getEmoji("😁")}
            </p>
            <p className="font-bold text-3xl">
                If you had sent these transactions on {mainnet}, you would have spent{" "}
                {stat(L1.gasSpent, "gas")} and it would have cost{" "}
                {stat(L1.feesSpent.ether, "ether")}, worth {stat(L1.feesSpent.usd, "usd")}.{" "}
                {getEmoji("😮")}
            </p>
            <p className="font-bold text-3xl">
                You have saved {stat(total.ether, "ether", true)} in fees, worth{" "}
                {stat(total.usd, "usd", true)}. That's {stat(total.timesCheaper, "x", true)}{" "}
                cheaper! {getEmoji("🤯")}
            </p>
            {viewing === "arbitrum" && (
                <p className="text-md">
                    *Only transactions sent after Arbitrum Nitro are supported
                </p>
            )}
        </div>
    )
}

export default SavingsParagraph
