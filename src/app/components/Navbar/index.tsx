import Link from "next/link"
import Button from "../Button"
import Dropdown from "../Dropdown"

import { useState } from "react"
import Utils from "@/app/lib/Utils"

const DISCOVER_L2S = [
    { display: "L2Beat", url: "https://l2beat.com/" },
    { display: "L2Fees", url: "https://l2fees.info/" },
]

const BRIDGE_TO_L2S = [
    { display: "Optimistic Gateway", url: "https://gateway.optimism.io/" },
    { display: "Arbitrum Bridge", url: "https://bridge.arbitrum.io/" },
    { display: "ZkSync Wallet", url: "https://wallet.zksync.io/" },
    { display: "Hop Bridge", url: "https://hop.exchange/" },
    { display: "Argent", url: "https://www.argent.xyz" },
    { display: "Bungee", url: "https://bungee.exchange" },
]

interface INavbar {
    account: Account
    setAccount: (account: Account) => void
    resetSavings: () => void
}

const Navbar = ({ account, setAccount, resetSavings }: INavbar) => {
    const [expandConnectWallet, setExpandConnectWallet] = useState<boolean>(false)

    return (
        <nav className="h-28 md:h-32 2xl:h-56 p-4 grow-0 select-none">
            <div className="flex h-full w-full pr-1 md:pr-4">
                <div className="flex h-full w-16 md:w-1/6 md:flex 2xl:p-8">
                    <Link href="/" className="hidden md:flex w-[40%]">
                        <img className="m-auto h-full" src="/icons/l2savings.svg" alt="L2Savings" />
                    </Link>
                    <Link href="/" className="flex h-full w-full md:w-[60%]">
                        <span className="font-bold text-md m-auto ml-1 md:text-2xl lg:ml-1 2xl:text-4xl">
                            L2Savings
                        </span>
                    </Link>
                </div>
                <div className="hidden lg:flex flex-row-reverse h-full w-5/6 gap-4 pt-4 pb-4 2xl:p-12">
                    {account.displayAddress ? (
                        <Button
                            text={account.displayAddress}
                            image={account.profilePhoto}
                            showCircularBorder={true}
                            hover={[
                                {
                                    display: "Disconnect",
                                    onClick: () => Utils.disconnectWallet(setAccount, resetSavings),
                                },
                            ]}
                            rotate={true}
                        />
                    ) : expandConnectWallet ? (
                        <>
                            <Button
                                text="Metamask"
                                onClick={() => {
                                    Utils.connectWallet("metamask", setAccount).then(() => {
                                        setExpandConnectWallet(false)
                                    })
                                }}
                                image="/icons/metamask.svg"
                                showCircularBorder={false}
                                rotate={true}
                            />
                            <Button
                                text="WalletConnect"
                                onClick={() => {
                                    Utils.connectWallet("walletconnect", setAccount).then(() => {
                                        setExpandConnectWallet(false)
                                    })
                                }}
                                image="/icons/walletconnect.svg"
                                showCircularBorder={false}
                                rotate={true}
                            />
                        </>
                    ) : (
                        <Button
                            text="Connect Wallet"
                            onClick={() => setExpandConnectWallet(true)}
                            gradient="bg-gradient-to-r from-green-700 via-cyan-600 to-blue-400"
                            showCircularBorder={true}
                        />
                    )}

                    <Button text="FAQ" path="faq" />

                    <div className="flex gap-4 md:hidden">
                        <div className="flex flex-row grow-0 gap-4 max-h-full">
                            <Dropdown text="Discover" items={DISCOVER_L2S} />
                            <Dropdown text="Bridges" items={BRIDGE_TO_L2S} />
                        </div>
                    </div>

                    <div className="hidden gap-4 md:flex">
                        <div className="flex flex-row grow-0 gap-4 max-h-full">
                            <Dropdown text="Discover L2's" items={DISCOVER_L2S} />
                            <Dropdown text="Bridge to L2's" items={BRIDGE_TO_L2S} />
                        </div>
                    </div>
                </div>

                {/* MD devices */}
                <div className="hidden md:flex lg:hidden flex-row-reverse h-full w-5/6 gap-4 pt-4 pb-4 2xl:p-12">
                    {account.displayAddress ? (
                        <Button
                            text={account.displayAddress}
                            image={account.profilePhoto}
                            showCircularBorder={true}
                            hover={[
                                {
                                    display: "Disconnect",
                                    onClick: () => Utils.disconnectWallet(setAccount, resetSavings),
                                },
                            ]}
                            rotate={true}
                        />
                    ) : expandConnectWallet ? (
                        <>
                            <Button
                                text="Metamask"
                                onClick={() => {
                                    Utils.connectWallet("metamask", setAccount).then(() => {
                                        setExpandConnectWallet(false)
                                    })
                                }}
                                image="/icons/metamask.svg"
                                showCircularBorder={false}
                                rotate={true}
                            />
                            <Button
                                text="WalletConnect"
                                onClick={() => {
                                    Utils.connectWallet("walletconnect", setAccount).then(() => {
                                        setExpandConnectWallet(false)
                                    })
                                }}
                                image="/icons/walletconnect.svg"
                                showCircularBorder={false}
                                rotate={true}
                            />
                        </>
                    ) : (
                        <Button
                            text="Connect Wallet"
                            onClick={() => setExpandConnectWallet(true)}
                            gradient="bg-gradient-to-r from-green-700 via-cyan-600 to-blue-400"
                            showCircularBorder={true}
                        />
                    )}

                    <div className="flex gap-4 md:hidden">
                        <div className="flex flex-row grow-0 gap-4 max-h-full">
                            <Dropdown text="Discover" items={DISCOVER_L2S} />
                            <Dropdown text="Bridges" items={BRIDGE_TO_L2S} />
                        </div>
                    </div>

                    <div className="hidden gap-4 md:flex">
                        <div className="flex flex-row grow-0 gap-4 max-h-full">
                            <Dropdown text="Discover L2's" items={DISCOVER_L2S} />
                            <Dropdown text="Bridge to L2's" items={BRIDGE_TO_L2S} />
                        </div>
                    </div>
                </div>

                {/* <= SM devices */}
                <div className="flex md:hidden flex-row-reverse h-full w-5/6 gap-4 pt-4 pb-4 2xl:p-12">
                    {account.displayAddress ? (
                        <Button
                            text={account.displayAddress}
                            image={account.profilePhoto}
                            showCircularBorder={true}
                            hover={[
                                {
                                    display: "Disconnect",
                                    onClick: () => Utils.disconnectWallet(setAccount, resetSavings),
                                },
                            ]}
                            rotate={true}
                        />
                    ) : expandConnectWallet ? (
                        <>
                            <Button
                                text="Metamask"
                                onClick={() => {
                                    Utils.connectWallet("metamask", setAccount).then(() => {
                                        setExpandConnectWallet(false)
                                    })
                                }}
                                image="/icons/metamask.svg"
                                showCircularBorder={false}
                                rotate={true}
                            />
                            <Button
                                text="WC"
                                onClick={() => {
                                    Utils.connectWallet("walletconnect", setAccount).then(() => {
                                        setExpandConnectWallet(false)
                                    })
                                }}
                                image="/icons/walletconnect.svg"
                                showCircularBorder={false}
                                rotate={true}
                            />
                        </>
                    ) : (
                        <Button
                            text="Connect Wallet"
                            onClick={() => setExpandConnectWallet(true)}
                            gradient="bg-gradient-to-r from-green-700 via-cyan-600 to-blue-400"
                            showCircularBorder={true}
                        />
                    )}

                    <div className="flex gap-4 md:hidden">
                        <div className="flex flex-row grow-0 gap-4 max-h-full">
                            <Dropdown text="Discover" items={DISCOVER_L2S} />
                            <Dropdown text="Bridges" items={BRIDGE_TO_L2S} />
                        </div>
                    </div>

                    <div className="hidden gap-4 md:flex">
                        <div className="flex flex-row grow-0 gap-4 max-h-full">
                            <Dropdown text="Discover L2's" items={DISCOVER_L2S} />
                            <Dropdown text="Bridge to L2's" items={BRIDGE_TO_L2S} />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
