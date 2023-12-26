import useChosenL2 from "@/app/hooks/useChosenL2"
import useSavings from "@/app/hooks/useSavings"
import localizeChain from "@/app/lib/localizeChain"
import SavingsData from "@/app/lib/savingsdata"
import Button from "../Button"

import { LuDownload, LuTwitter } from "react-icons/lu"
import { colorMap } from "@/app/lib/constants"

function Stat({
    text,
    what,
    final = false,
    dataColor,
}: {
    text: string
    what: string
    final?: boolean
    dataColor: string
}) {
    const formattedText =
        text === "..."
            ? text
            : what === "ether"
            ? `Ξ${text}`
            : what === "usd"
            ? `$${parseFloat(text).toFixed(1).toLocaleString()}`
            : what === "x"
            ? `${parseFloat(text).toFixed(1).toLocaleString()}x`
            : `${parseInt(text).toLocaleString()} ${what}`

    return <span style={{ color: final ? "#dc2626" : dataColor }}>{formattedText}</span>
}

function Emoji({ L2, emoji }: { L2: any; emoji: string }) {
    const emojiValue =
        L2.feesSpent.ether !== "..." && parseInt(L2.transactionsSent) !== 0
            ? emoji
            : parseInt(L2.transactionsSent) === 0
            ? "😐"
            : "😴"
    return <span>{emojiValue}</span>
}

function Chain({ chainColor, chainName }: { chainColor: string; chainName: string }) {
    return <span style={{ color: chainColor }}>{chainName}</span>
}

function Mainnet({ mainnetColor }: { mainnetColor: string }) {
    return <span style={{ color: mainnetColor }}>Ethereum Mainnet</span>
}

export default function Savings() {
    const { chosenL2 } = useChosenL2()
    const { savings, localizedSavings } = useSavings()

    if (!savings || !localizedSavings) return <p>Loading...</p>

    const { L2, L1, saved: total } = localizedSavings[chosenL2]
    const chainColor = colorMap[chosenL2].chainColor
    const dataColor = colorMap[chosenL2].dataColor

    return (
        <div className="flex flex-col p-5 space-y-4 md:space-y-8">
            <p className="font-bold md:text-3xl">
                You have sent{" "}
                <Stat
                    text={L2.transactionsSent}
                    what={parseInt(L2.transactionsSent) === 1 ? "transaction" : "transactions"}
                    dataColor={dataColor}
                />{" "}
                on <Chain chainColor={chainColor} chainName={localizeChain(chosenL2)} /> and used{" "}
                <Stat text={L2.gasSpent} what="gas" dataColor={dataColor} />. This has cost you{" "}
                <Stat text={L2.feesSpent.ether} what="ether" dataColor={dataColor} />, worth{" "}
                <Stat text={L2.feesSpent.usd} what="usd" dataColor={dataColor} />.{" "}
                <Emoji L2={L2} emoji="😁" />
            </p>
            <p className="font-bold md:text-3xl">
                If you had sent these transactions on <Mainnet mainnetColor={colorMap.mainnet} />,
                you would have spent <Stat text={L1.gasSpent} what="gas" dataColor={dataColor} />{" "}
                and it would have cost{" "}
                <Stat text={L1.feesSpent.ether} what="ether" dataColor={dataColor} />, worth{" "}
                <Stat text={L1.feesSpent.usd} what="usd" dataColor={dataColor} />.{" "}
                <Emoji L2={L2} emoji="😮" />
            </p>
            <p className="font-bold md:text-3xl">
                You have saved <Stat text={total.ether} what="ether" final dataColor={dataColor} />{" "}
                in fees, worth <Stat text={total.usd} what="usd" final dataColor={dataColor} />.
                That&apos;s <Stat text={total.timesCheaper} what="x" final dataColor={dataColor} />{" "}
                cheaper! <Emoji L2={L2} emoji="🤯" />
            </p>

            <div className="flex flex-row justify-around">
                <Button
                    link={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        `I have saved a total of $${parseInt(
                            savings.all.saved.usd.toString()
                        ).toLocaleString()} using L2s. That's ${parseFloat(
                            savings.all.saved.timesCheaper.toString()
                        )
                            .toFixed(1)
                            .toLocaleString()}x cheaper than L1 costs. See how much you've saved using @L2Savings`
                    )}`}
                >
                    <LuTwitter />
                    Tweet
                </Button>
                <Button
                    link={`data:text/json;charset=utf-8,${SavingsData.prepareDownload(savings)}`}
                    download={`l2savings-${new Date().toISOString()}.json`}
                >
                    <LuDownload />
                    Download Data
                </Button>
            </div>
        </div>
    )
}
