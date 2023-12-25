import { useContext } from "react"
import { ChosenL2Context } from "../providers/ChosenL2Provider"

export default function useChosenL2() {
    const context = useContext(ChosenL2Context)
    if (!context) {
        throw new Error("useChosenL2 must be used within a ChosenL2Provider")
    }

    return context
}
