"use client"

import { createContext, useCallback, useEffect, useRef, useState } from "react"
import { noProgress, noSavings } from "../lib/constants"

import SavingsData from "../lib/savingsdata"
import useAccount from "../hooks/useAccount"
import Optimism from "../lib/l2/Optimism"
import Arbitrum from "../lib/l2/Arbitrum"
import ZkSyncLite from "../lib/l2/ZkSyncLite"
import Linea from "../lib/l2/Linea"

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
    const [lineaSavingsCalculated, setLineaSavingsCalculated] = useState<CalcProgress>(noProgress)

    const { account } = useAccount()

    const resetSavings = () => {
        setAllSavings(undefined)
        setSavingsStartedFetching(false)
        setOptimismSavingsCalculated(noProgress)
        setArbitrumSavingsCalculated(noProgress)
        setZkSyncLiteSavingsCalculated(noProgress)
        setLineaSavingsCalculated(noProgress)
    }

    const calculateAllSavings = useCallback(
        async (signal: AbortSignal) => {
            if (!account) return

            const promises = [
                new Optimism(
                    account.address,
                    setOptimismSavingsCalculated,
                    signal
                ).calculateSavings(),
                new Arbitrum(
                    account.address,
                    setArbitrumSavingsCalculated,
                    signal
                ).calculateSavings(),
                new ZkSyncLite(
                    account.address,
                    setZkSyncLiteSavingsCalculated,
                    signal
                ).calculateSavings(),
                new Linea(account.address, setLineaSavingsCalculated, signal).calculateSavings(),
            ]

            const results = await Promise.allSettled(promises)

            const [optimismSavings, arbitrumSavings, zkSyncLiteSavings, lineaSavings] = results.map(
                result => {
                    if (result.status === "fulfilled") {
                        return result.value
                    } else {
                        console.error("Error calculating savings for a service:", result.reason)
                        return JSON.parse(JSON.stringify(noSavings)) as Savings
                    }
                }
            )

            if (signal.aborted) return

            const savings = SavingsData.calculateTotalSavings(
                optimismSavings,
                arbitrumSavings,
                zkSyncLiteSavings,
                lineaSavings
            )

            if (signal.aborted) return

            return {
                optimism: optimismSavings,
                arbitrum: arbitrumSavings,
                zkSyncLite: zkSyncLiteSavings,
                linea: lineaSavings,
                all: savings,
            }
        },
        [account]
    )

    useEffect(() => {
        const abortController = new AbortController()

        const fetchSavings = async () => {
            if (!account) {
                abortController.abort()
                resetSavings()
                return
            }

            setSavingsStartedFetching(true)
            const savings = await calculateAllSavings(abortController.signal)

            setAllSavings(savings)
            setSavingsStartedFetching(false)
        }

        fetchSavings()

        return () => {
            abortController.abort()
            resetSavings()
        }
    }, [calculateAllSavings, account])

    return (
        <SavingsContext.Provider
            value={{
                savings: allSavings,
                localizedSavings: SavingsData.localize(allSavings),
                resetSavings,
                progress: {
                    optimism: optimismSavingsCalculated,
                    arbitrum: arbitrumSavingsCalculated,
                    zkSyncLite: zkSyncLiteSavingsCalculated,
                    linea: lineaSavingsCalculated,
                },
                savingsStartedFetching,
            }}
        >
            {children}
        </SavingsContext.Provider>
    )
}
