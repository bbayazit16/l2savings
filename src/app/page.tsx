"use client"

import { useEffect, useState } from "react"

import Utils from "./lib/Utils"
import Arbitrum from "./lib/Arbitrum"
import Optimism from "./lib/Optimism"
import ZkSync from "./lib/ZkSync"
import FetchingInfo from "./components/FetchingContainer"
import Footer from "./components/Footer"
import Navbar from "./components/Navbar"

export default function Home() {
    // return (
    //    <main className="flex-grow">

    //    </main>
    // )
    const [account, setAccount] = useState<Account>({ address: undefined })

    const [optimismSavingsCalculated, setOptimismSavingsCalculated] = useState<CalcProgress>(
        Utils.noProgress
    )

    const [arbitrumSavingsCalculated, setArbitrumSavingsCalculated] = useState<CalcProgress>(
        Utils.noProgress
    )

    const [zkSyncSavingsCalculated, setZkSyncSavingsCalculated] = useState<CalcProgress>(
        Utils.noProgress
    )

    const [allSavings, setAllSavings] = useState<AllSavings | undefined>()

    const resetSavings = () => {
        setOptimismSavingsCalculated(Utils.noProgress)
        setArbitrumSavingsCalculated(Utils.noProgress)
        setZkSyncSavingsCalculated(Utils.noProgress)
        setAllSavings(undefined)
    }

    const calculateAllSavings = async (address: string) => {
        const [optimismSavings, arbitrumSavings, zkSyncSavings] = await Promise.all([
            new Optimism(address, setOptimismSavingsCalculated).calculateSavings(),
            new Arbitrum(address, setArbitrumSavingsCalculated).calculateSavings(),
            new ZkSync(address, setZkSyncSavingsCalculated).calculateSavings(),
        ]).catch(() => {
            setOptimismSavingsCalculated(Utils.noProgress)
            setArbitrumSavingsCalculated(Utils.noProgress)
            setZkSyncSavingsCalculated(Utils.noProgress)
            return [Utils.noSavings, Utils.noSavings, Utils.noSavings]
        })

        if (!Utils.connected) {
            return
        }

        const savings = Utils.calculateTotalSavings(optimismSavings, arbitrumSavings, zkSyncSavings)

        setAllSavings({
            optimism: optimismSavings,
            arbitrum: arbitrumSavings,
            zkSync: zkSyncSavings,
            all: savings,
        })
    }

    useEffect(() => {
        if (account.address) calculateAllSavings(account.address)
    }, [account.address])

    useEffect(() => {
        Utils.safeConnect(setAccount)
    }, [])

    useEffect(() => {
        Utils.listenAccountChanges(setAccount, resetSavings)
    }, [window.ethereum])

    return (
        <div className="flex flex-grow flex-col min-h-screen justify-between">
            <Navbar account={account} setAccount={setAccount} resetSavings={resetSavings} />

            {/* <Routes>
                <Route path="faq" element={<FAQ />} />
                <Route path="*" element={<Main savings={allSavings} />} />
            </Routes> */}

            {account.address && (
                <FetchingInfo
                    progress={[
                        { progress: optimismSavingsCalculated, displayName: "Optimism" },
                        { progress: arbitrumSavingsCalculated, displayName: "Arbitrum" },
                        { progress: zkSyncSavingsCalculated, displayName: "ZkSync" },
                    ]}
                />
            )}

            <Footer />
        </div>
    )
}
