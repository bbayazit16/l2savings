"use client"

import ChooseL2 from "./ChooseL2"

import useAccount from "@/app/hooks/useAccount"
import EnterAddress from "./EnterAddress"
import Savings from "./Savings"
import ButtonImage from "../ButtonImage"
import useSavings from "@/app/hooks/useSavings"
import TransactionBox from "./TransactionBox"

function ProgressBar({ current, total }: { current: number; total: number | undefined }) {
    const width = total ? `${(current / total) * 100}%` : "0%"
    return (
        <div className="flex flex-row items-center gap-2 w-full">
            <span className="text-lg justify-self-end">{current}</span>
            <div className="relative w-3/4 border-black border-2 rounded-full h-4">
                <div className="bg-green-500 h-full rounded-full" style={{ width }}></div>
            </div>
            <span className="text-lg justify-self-start">{total}</span>
        </div>
    )
}

function SavingsProgress({
    progress,
}: {
    progress: Record<Exclude<AvailableL2s, "all">, CalcProgress>
}) {
    const renderProgress = (chainName: string, progressData: CalcProgress) => (
        <div className="flex flex-col md:flex-row space-x-0 md:space-x-4 items-center">
            <span className="font-bold min-w-fit">{chainName}:</span>
            <ProgressBar current={progressData.current} total={progressData.total} />
        </div>
    )

    return (
        <div className="grid grid-cols-2 gap-4">
            {renderProgress("Arbitrum", progress.arbitrum)}
            {renderProgress("Optimism", progress.optimism)}
            {renderProgress("ZkSync Lite", progress.zkSyncLite)}
            {renderProgress("Linea", progress.linea)}
        </div>
    )
}

export default function SavingsBox() {
    const { account } = useAccount()

    const { progress, savings } = useSavings()

    if (savings) {
        return (
            <div className="flex flex-col space-y-4">
                <div className="flex flex-col m-auto border-zinc-800 dark:border-white border-2 p-4 rounded-lg">
                    <ChooseL2 />
                    <Savings />
                </div>
                <TransactionBox />
            </div>
        )
    }

    return (
        <div className="flex flex-col space-y-4 mt-[10%]">
            {/* <h1 className="font-bold text-3xl">What is L2Savings?</h1> */}
            <div className="flex flex-col space-y-4 text-justify">
                <p>
                    L2Saving analyzes your L2 transactions, converting gas used to L1 equivalents
                    based on the gas prices <strong>when those transactions happened</strong>. This
                    allows you to see how much you&apos;ve saved compared to if you&apos;d done the
                    same, exact transaction on the Ethereum Mainnet. L2Savings excludes any
                    self-transfers and failed transactions — just your net savings.
                </p>
            </div>
            <div className="flex flex-row space-x-4">
                <span>Supported Chains:</span>
                <div className="flex flex-row space-x-2">
                    <span>Optimism</span>
                    <ButtonImage src="/optimism.svg" alt="Optimism logo" animate border rounded />
                </div>
                <div className="flex flex-row space-x-2">
                    <span>Arbitrum</span>
                    <ButtonImage src="/arbitrum.svg" alt="Arbitrum logo" animate />
                </div>
                <div className="flex flex-row space-x-2">
                    <span>ZkSync Lite</span>
                    <ButtonImage src="/zksync.svg" alt="ZkSync logo" animate />
                </div>
                <div className="flex flex-row space-x-2">
                    <span>Linea</span>
                    <ButtonImage src="/linea.svg" alt="Linea logo" className="dark:invert" animate />
                </div>
            </div>
            <p>To get started, input your Ethereum address or ENS:</p> <EnterAddress />
            {account && (
                <div className="m-auto justify-center w-full">
                    {/* <p>Fetching transactions...</p> */}
                    <SavingsProgress progress={progress} />
                </div>
            )}
        </div>
    )
}
