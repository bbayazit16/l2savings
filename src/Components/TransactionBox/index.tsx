import Utils from "../../Utils"

import triangle from "../../Assets/Image/triangle.svg"

import { useState } from "react"

interface ITransactionBox {
    savings: AllSavings
    viewing: AvailableL2s
}

type SortProps = {
    key: keyof TransactionSavingsLocalized | "dont"
    order: "asc" | "desc"
}

const TransactionBox = ({ savings, viewing }: ITransactionBox) => {
    const [triangleIsReverse, setTriangleIsReverse] = useState({
        L2: false,
        hash: false,
        L2Fee: false,
        L1Fee: false,
        saved: false,
        timesCheaper: false,
    })

    const [sortBy, setSortBy] = useState<SortProps>({
        key: "dont",
        order: "asc",
    })

    const changeSortBy = (key: keyof TransactionSavingsLocalized) => {
        if (sortBy.key === key) {
            setTriangleIsReverse({
                ...triangleIsReverse,
                [key]: !triangleIsReverse[key],
            })
            setSortBy({
                key,
                order: sortBy.order === "asc" ? "desc" : "asc",
            })
        } else {
            setTriangleIsReverse({
                ...triangleIsReverse,
                [key]: true,
                [sortBy.key]: false,
            })
            setSortBy({
                key,
                order: "asc",
            })
        }
    }

    const localizedSavings = Utils.localize(savings)

    const { details } = localizedSavings[viewing]

    const body = Utils.sortBy(
        details,
        sortBy.key,
        sortBy.key === "hash" || sortBy.key === "L2"
    ).map((transaction, index) => (
        <tr key={index}>
            <td className="text-left p-4">
                <img
                    className={[
                        "rounded-full",
                        "select-none",
                        "h-4",
                        "w-4",
                        "mr-1",
                        "overflow-hidden",
                        "md:h-8",
                        "md:w-8",
                    ]
                        .concat(transaction.L2 === "optimism" ? ["border-black", "border-2"] : [])
                        .join(" ")}
                    alt="L2 logo"
                    src={Utils.chainToAsset(transaction.L2)}
                />
            </td>
            <td className="text-left text-xl p-4 underline text-blue-400">
                <a
                    href={`${Utils.explorerURI(transaction.L2)}/tx/${transaction.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {Utils.truncateTransactionHash(transaction.hash)}
                </a>
            </td>
            <td className="text-left text-xl p-4">{transaction.L2Fee}Ξ</td>
            <td className="text-left text-xl p-4">{transaction.L1Fee}Ξ</td>
            <td className="text-left text-xl p-4">{transaction.saved}Ξ</td>
            <td className="text-left text-xl p-4">
                {parseFloat(transaction.timesCheaper).toFixed(1).toLocaleString()}x
            </td>
        </tr>
    ))

    const getTableHeader = (key: keyof TransactionSavingsLocalized, text: string) => {
        return (
            <th
                className="text-left p-4 text-xl md:text-2xl select-none cursor-pointer"
                onClick={() => changeSortBy(key)}
            >
                <span className="w-full flex flex-row">
                    {text}
                    <img
                        className={["h-4", "w-4", "mr-1", "mt-2"]
                            .concat(triangleIsReverse[key] ? [] : ["rotate-180"])
                            .join(" ")}
                        src={triangle}
                        alt="order by"
                    ></img>
                </span>
            </th>
        )
    }

    return (
        <table className="w-full">
            <thead className="pl-4 pr-4">
                <tr>
                    {getTableHeader("L2", "L2")}
                    {getTableHeader("hash", "Transaction Hash")}
                    {getTableHeader("L2Fee", "L2 Fee")}
                    {getTableHeader("L1Fee", "L1 Fee")}
                    {getTableHeader("saved", "Saved")}
                    {getTableHeader("timesCheaper", "Times Cheaper")}
                </tr>
            </thead>
            <tbody>{sortBy.order === "asc" ? body : body.reverse()}</tbody>
        </table>
    )
}

export default TransactionBox
