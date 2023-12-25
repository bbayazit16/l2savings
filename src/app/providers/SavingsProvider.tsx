"use client"

import { createContext, useCallback, useEffect, useState } from "react"
import { noProgress, noSavings } from "../lib/constants"

import SavingsData from "../lib/savingsdata"
import useAccount from "../hooks/useAccount"
import Optimism from "../lib/l2/Optimism"
import Arbitrum from "../lib/l2/Arbitrum"
import ZkSyncLite from "../lib/l2/ZkSyncLite"

interface SavingsContextProps {
    savings: AllSavings | undefined
    resetSavings: () => void
    localizedSavings: AllSavingsLocalized | undefined
    progress: Record<Exclude<AvailableL2s, "all">, CalcProgress>
    savingsStartedFetching: boolean
}

export const SavingsContext = createContext<SavingsContextProps | undefined>(undefined)

export default function SavingsProvider({ children }: { children: React.ReactNode }) {
    const [allSavings, setAllSavings] = useState<AllSavings | undefined>()
    const [savingsStartedFetching, setSavingsStartedFetching] = useState(false)

    // Trigger on each transaction fetched; for UI purposes.
    const [optimismSavingsCalculated, setOptimismSavingsCalculated] =
        useState<CalcProgress>(noProgress)
    const [arbitrumSavingsCalculated, setArbitrumSavingsCalculated] =
        useState<CalcProgress>(noProgress)
    const [zkSyncLiteSavingsCalculated, setZkSyncLiteSavingsCalculated] =
        useState<CalcProgress>(noProgress)

    const { account } = useAccount()

    // useCallback to memoize the function calculateAllSavings
    const calculateAllSavings = useCallback(async () => {
        if (!account) return

        setSavingsStartedFetching(true)

        const [optimismSavings, arbitrumSavings, zkSyncLiteSavings] = await Promise.all([
            new Optimism(account.address, setOptimismSavingsCalculated).calculateSavings(),
            new Arbitrum(account.address, setArbitrumSavingsCalculated).calculateSavings(),
            new ZkSyncLite(account.address, setZkSyncLiteSavingsCalculated).calculateSavings(),
        ]).catch(() => {
            setOptimismSavingsCalculated(noProgress)
            setArbitrumSavingsCalculated(noProgress)
            setZkSyncLiteSavingsCalculated(noProgress)
            return [noSavings, noSavings, noSavings]
        })

        const savings = SavingsData.calculateTotalSavings(
            optimismSavings,
            arbitrumSavings,
            zkSyncLiteSavings
        )

        setAllSavings({
            optimism: optimismSavings,
            arbitrum: arbitrumSavings,
            zkSyncLite: zkSyncLiteSavings,
            all: savings,
        })

        setSavingsStartedFetching(false)
    }, [account])

    useEffect(() => {
        calculateAllSavings()
    }, [calculateAllSavings])

    return (
        <SavingsContext.Provider
            value={{
                savings: allSavings,
                localizedSavings: SavingsData.localize(allSavings),
                resetSavings: () => {
                    setAllSavings(undefined)
                    setSavingsStartedFetching(false)
                    setOptimismSavingsCalculated(noProgress)
                    setArbitrumSavingsCalculated(noProgress)
                    setZkSyncLiteSavingsCalculated(noProgress)
                },
                progress: {
                    optimism: optimismSavingsCalculated,
                    arbitrum: arbitrumSavingsCalculated,
                    zkSyncLite: zkSyncLiteSavingsCalculated,
                },
                savingsStartedFetching,
            }}
        >
            {children}
        </SavingsContext.Provider>
    )
}
