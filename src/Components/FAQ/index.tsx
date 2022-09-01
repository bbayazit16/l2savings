import { Link } from "react-router-dom"

const FAQ = () => {
    return (
        <article className="h-full pb-12 lg:pt-16">
            <div className="flex flex-col space-y-8 ml-[5%] mr-[5%] sm:ml-[10%] sm:mr-[10%] md:ml-[15%] md:mr-[15%] lg:ml-[24%] lg:mr-[24%]">
                <div className="flex flex-row space-x-4 items-center">
                    <h1 className="text-6xl">FAQ</h1>
                    <Link to="/" className="text-4xl text-blue-400 underline">
                        Back
                    </Link>
                </div>
                <div className="flex flex-col space-y-2">
                    <h1 className="text-5xl">How are savings calculated?</h1>
                    <p className="text-2xl leading-6 text-gray-300">
                        To calculate savings, L2Savings goes through each one of your L2
                        transactions to calculate the amount of gas and fees spent. The L2 gas spent
                        is then converted to L1 gas, which is multiplied by the L1 gas price during
                        the time of the transaction to give the amount of L1 fees spent. The
                        difference between the predicted L1 Fee and the L2 Fee paid is your savings!
                        <br className="select-none" />
                        <br className="select-none" />
                        It's worth noting that failed transactions, transactions to the same
                        address, and L2-specific transactions such as bridge deposits /
                        cryptographic changes are not accounted for in calculations.
                    </p>
                </div>
                <div className="flex flex-col space-y-2">
                    <h1 className="text-5xl">How accurate are savings?</h1>
                    <p className="text-2xl leading-6 text-gray-300">
                        The accuracy varies depending on the underlying technology.
                    </p>
                    <br className="select-none" />
                    <br className="select-none" />
                    <h2 className="text-4xl text-[#EA3431]">Optimism</h2>
                    <p className="text-2xl leading-6 text-gray-300">
                        Savings are highly accurate since each unit of L2 gas is equivalent to
                        Ethereum's, thanks to EVM equivalence. Moreover, eth_getTransactionReceipt
                        call on Optimism returns the L1 gas price during the time of the
                        transaction, which makes it even more easier and accurate to calculate!
                    </p>
                    <br className="select-none" />
                    <h2 className="text-4xl text-[#4E9FEA]">Arbitrum</h2>
                    <p className="text-2xl leading-6 text-gray-300">
                        After migrating to Nitro, Arbitrum replaced "arbgas" with L1 equivalent gas
                        that we're all used to. L2Gas is a combination of L1 Calldata Gas + L2 Gas
                        (which is equal to L1 computation!). To calculate the L1 gas price during
                        the time of the transaction, the average daily gas price during the date of
                        the transaction is used. Nitro upgrade not only made transactions cheaper,
                        but it also made it easier and more accurate to calculate savings!
                    </p>
                    <br className="select-none" />
                    <h2 className="text-4xl text-[#4E5395]">ZkSync</h2>
                    <p className="text-2xl leading-6 text-gray-300">
                        ZkSync uses zero-knowledge proofs to validate state correctness. Although ZK
                        proofs can be extremely cheap, they are hard to develop. ZkSync is currently
                        not EVM compatible and does not support every EVM instruction. There are a
                        few transaction types, such as swap, mintnft, and transfer... that have
                        custom functionalities. L2Savings accounts for 21,000 L1 gas for transfers,
                        50,000 for ERC20 transfers, 105,000 for swaps, and 210,000 for NFT mints.
                        For more information on ZkSync calculations, see the L2Savings Github.
                    </p>
                </div>
            </div>
        </article>
    )
}

export default FAQ
