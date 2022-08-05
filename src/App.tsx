import FetchingInfo from "./Components/FetchingContainer"
import Footer from "./Components/Footer"
import Navbar from "./Components/Navbar"
import Main from "./Components/Main"
import FAQ from "./Components/FAQ"

import Utils from "./Utils"

import Optimism from "./Savings/Optimism"
import Arbitrum from "./Savings/Arbitrum"
import ZkSync from "./Savings/ZkSync"

import { Route, Routes } from "react-router-dom"
import { useEffect, useState } from "react"

/**
 * The logic for web app has not been documented.
 *
 * The code for savings calculations has been strictly documented.
 * @see Savings folder for the calculation documentations.
 * For any concerns, requests, or questions, open an issue at
 * @link https://github.com/bbayazit16/l2savings/issues
 */
const App = () => {
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
        if (account.address) {
            calculateAllSavings(account.address)
        } else {
            setOptimismSavingsCalculated(Utils.noProgress)
            setArbitrumSavingsCalculated(Utils.noProgress)
            setZkSyncSavingsCalculated(Utils.noProgress)
            setAllSavings(undefined)
        }
    }, [account.address])

    useEffect(() => {
        Utils.safeConnect(setAccount)
    }, [])

    useEffect(() => {
        Utils.listenAccountChanges(setAccount)
    }, [window.ethereum])

    return (
        <div className="flex flex-col min-h-screen justify-between">
            <Navbar account={account} setAccount={setAccount} />

            <Routes>
                <Route path="faq" element={<FAQ />} />
                <Route path="*" element={<Main savings={allSavings} />} />
            </Routes>

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

export default App
