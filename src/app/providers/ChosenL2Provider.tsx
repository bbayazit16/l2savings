import { createContext, useState } from "react"

type AvailableL2s = "all" | "optimism" | "arbitrum" | "zkSyncLite"

interface ChosenL2Context {
    chosenL2: AvailableL2s
    setChosenL2: React.Dispatch<React.SetStateAction<AvailableL2s>>
}

export const ChosenL2Context = createContext<ChosenL2Context | undefined>(undefined)

export default function ChosenL2Provider({ children }: { children: React.ReactNode }) {
    const [chosenL2, setChosenL2] = useState<AvailableL2s>("all")

    return (
        <ChosenL2Context.Provider value={{ chosenL2, setChosenL2 }}>
            {children}
        </ChosenL2Context.Provider>
    )
}
