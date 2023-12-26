"use client"

import useChosenL2 from "@/app/hooks/useChosenL2"
import useSavings from "@/app/hooks/useSavings"
import explorerUri from "@/app/lib/explorerUri"
import truncateTransactionHash from "@/app/lib/truncateTransactionHash"
import ButtonImage from "../ButtonImage"
import chainToAsset from "@/app/lib/chainToAssetSrc"
import sortBy from "@/app/lib/sortBy"
import clsx from "clsx"

import { useState, useMemo } from "react"

type SortByProps = {
    key: keyof TransactionSavingsLocalized | "dont"
    order: "asc" | "desc"
}

export default function TransactionBox() {
    const { localizedSavings } = useSavings()
    const { chosenL2 } = useChosenL2()

    const [triangleIsReverse, setTriangleIsReverse] = useState({
        L2: false,
        hash: false,
        L2Fee: false,
        L1Fee: false,
        saved: false,
        timesCheaper: false,
    })

    const [sortByProps, setSortByProps] = useState<SortByProps>({
        key: "dont",
        order: "asc",
    })

    function changeSortBy(key: keyof TransactionSavingsLocalized) {
        setTriangleIsReverse(prevState => ({
            ...prevState,
            [key]: key === sortByProps.key ? !prevState[key] : true,
        }))
        setSortByProps(prevState => ({
            key,
            order: prevState.key === key && prevState.order === "asc" ? "desc" : "asc",
        }))
    }

    // If there were no savings, this component wouldn't have rendered
    // at the first place.
    const { details } = localizedSavings![chosenL2]

    const sortedTransactions = useMemo(() => {
        if (sortByProps.key === "dont") {
            return details
        }
        return sortBy(details, sortByProps.key)
    }, [details, sortByProps.key])

    return (
        <div className="flex flex-col overflow-y-scroll h-64 lg:h-96 w-full border-zinc-800 dark:border-white border-2 p-4 rounded-lg">
            <table className="w-full">
                <TableHeader changeSortBy={changeSortBy} triangleIsReverse={triangleIsReverse} />
                <TableBody transactions={sortedTransactions} order={sortByProps.order} />
            </table>
        </div>
    )
}

function TableHeader({
    changeSortBy,
    triangleIsReverse,
}: {
    changeSortBy: Function
    triangleIsReverse: any
}) {
    const headers = [
        { key: "L2", text: "L2" },
        { key: "hash", text: "Transaction Hash" },
        { key: "L2Fee", text: "L2 Fee" },
        { key: "L1Fee", text: "L1 Fee" },
        { key: "saved", text: "Saved" },
        { key: "timesCheaper", text: "Times Cheaper" },
    ]

    return (
        <thead className="pl-4 pr-4">
            <tr>
                {headers.map(({ key, text }) => (
                    <th
                        key={key}
                        className="text-left p-4 select-none cursor-pointer"
                        onClick={() => changeSortBy(key)}
                    >
                        <span className="w-full flex flex-row">
                            {text}
                            <SortIcon key={key} isReversed={triangleIsReverse[key]} />
                        </span>
                    </th>
                ))}
            </tr>
        </thead>
    )
}

function SortIcon({ isReversed }: { isReversed: boolean }) {
    return (
        <svg
            className={clsx("h-4 w-4 mr-1 mt-2 fill-zinc-800 dark:fill-zinc-200", {
                "rotate-180": !isReversed,
            })}
            xmlns="http://www.w3.org/2000/svg"
            version="1.0"
            viewBox="0 0 100 100"
        >
            <polygon points="50,16 85,85 15,85 50,16" />
        </svg>
    )
}

function TableBody({
    transactions,
    order,
}: {
    transactions: TransactionSavingsLocalized[]
    order: "asc" | "desc"
}) {
    const transactionRows = order === "asc" ? transactions : [...transactions].reverse()

    return (
        <tbody>
            {transactionRows.map(transaction => (
                <tr key={transaction.hash}>
                    <td className="text-left p-4">
                        <ButtonImage
                            src={chainToAsset(transaction.L2)}
                            alt="L2 Logo"
                            border={transaction.L2 === "optimism"}
                            className={clsx({
                                "dark:invert": transaction.L2 === "linea",
                            })}
                            animate
                        />
                    </td>
                    <td className="text-left p-4 underline text-blue-400">
                        <a
                            href={`${explorerUri(transaction.L2)}/tx/${transaction.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {truncateTransactionHash(transaction.hash)}
                        </a>
                    </td>
                    <td className="text-left p-4">{transaction.L2Fee}Ξ</td>
                    <td className="text-left p-4">{transaction.L1Fee}Ξ</td>
                    <td className="text-left p-4">{transaction.saved}Ξ</td>
                    <td className="text-left p-4">
                        {parseFloat(transaction.timesCheaper).toFixed(1).toLocaleString()}x
                    </td>
                </tr>
            ))}
        </tbody>
    )
}
