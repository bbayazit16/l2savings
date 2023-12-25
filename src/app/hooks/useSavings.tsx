import { useContext } from "react"
import { SavingsContext } from "../providers/SavingsProvider"

export default function useSavings() {
    const context = useContext(SavingsContext)
    if (!context) {
        throw new Error("useSavings must be used within a SavingsProvider")
    }

    return context
}
