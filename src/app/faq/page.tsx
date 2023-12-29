import Link from "next/link"

export default function Faq() {
    return (
        <main className="flex flex-col space-y-4 flex-grow m-auto text-justify w-3/5">
            <Link href="/" className="text-blue-500 hover:underline max-w-fit">
                Back
            </Link>
            <div className="flex flex-col space-y-4">
                <h1 className="font-bold text-4xl">What is L2Savings?</h1>
                <p>
                    L2Savings calculates your savings by analyzing each of your L2 transactions to
                    determine the gas and fees used. Then, L2Savings converts the L2 gas into L1 gas
                    equivalents and multiplies this by the L1 gas price{" "}
                    <strong>at the time of the transaction</strong>. This method estimates the L1
                    fees you would have incurred if you had submitted the same transaction with the
                    same calldata on the Ethereum Mainnet at that time.
                </p>
                <p>
                    So, your savings are the difference between these estimated L1 fees and the
                    actual L2 fees you paid!
                </p>
                <p>
                    L2Savings does not include failed transactions, transactions you sent to your
                    own address, or L2-specific activities like bridge deposits and cryptographic
                    updates in the calculations.
                </p>
            </div>

            <div className="flex flex-col space-y-4">
                <h1 className="font-bold text-4xl">How Accurate is L2Savings?</h1>
                <p>Simply put, it depends on the chain.</p>
            </div>

            <div>
                <h2 className="text-4xl text-[#EA3431]">Optimism</h2>
                <p>
                    Savings are highly accurate since each unit of L2 gas is equivalent to
                    Ethereum&apos;s, thanks to Optimism&apos;s EVM equivalence. The
                    eth_getTransactionReceipt call on Optimism also returns the L1 gas price during
                    the time of the transaction, which makes savings even more easier and accurate
                    to calculate!
                </p>
            </div>

            <div>
                <h2 className="text-4xl text-[#4E9FEA]">Arbitrum</h2>
                <p>
                    After the migration to Nitro, Arbitrum replaced &quot;arbgas&quot; with the
                    standard L1-equivalent unit of gas that we&apos;re all used to. So, L2Gas is a
                    combination of L1 Calldata Gas + L2 Gas (which is equal to L1 computation
                    costs). Since eth_getTransactionReceipt includes the L1 block number, we can use
                    this to query eth_feeHistory to get the median of the L1 average gas price
                    during the time of the transaction. So, Nitro upgrade actually made transactions
                    cheaper and easier to calculate savings! For this reason, L2Savings only
                    supports transactions after Arbitrum Nitro.
                </p>
            </div>

            <div>
                <h2 className="text-4xl text-[#4E5395]">ZkSync Lite</h2>
                <p>
                    ZkSync Lite uses zero-knowledge proofs to validate state correctness, so
                    it&apos;s not EVM comptatible (unlike ZkSync ERA) and does not support every EVM
                    instruction. There are a few transaction types, such as swap, mintnft, transfer,
                    etc, that have custom functionalities. L2Savings accounts for 21,000 L1 gas for
                    transfers, 50,000 for ERC20 transfers, 105,000 for swaps, and 210,000 for NFT
                    mints. The algorithm for ZkSync Lite is relatively complex, see the{" "}
                    <a
                        href="https://github.com/bbayazit16/l2savings/blob/master/src/app/lib/l2/ZkSyncLite.ts#L24"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline max-w-fit"
                    >
                        diagram
                    </a>{" "}
                    for more details.
                </p>
            </div>

            <div>
                <h2 className="text-4xl text-[#F04623]">Linea</h2>
                <p>
                    Similar to Optimism, savings are relatively accurate since each unit of L2 gas
                    is equivalent to Ethereum&apos;s, thanks to EVM equivalence. However,
                    eth_getTransactionReceipt calls do not return the L1 block number and we have to
                    calculate the average daily gas price during the date of the transaction to
                    estimate the L1 fees.
                </p>
            </div>

            <div>
                <h2 className="text-4xl text-[#1C5BF0]">Base</h2>
                <p>
                    Base is a rollup based on Optimism&apos;s OP stack, so it&apos;s EVM equivalent
                    and the L1 fee during the time of the transaction is available in the response
                    of the eth_getTransactionReceipt call. This means calculations are performed in
                    the same way as Optimism, so savings are highly accurate!
                </p>
            </div>
        </main>
    )
}
