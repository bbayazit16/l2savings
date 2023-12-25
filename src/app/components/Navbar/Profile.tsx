"use client"

import useAccount from "@/app/hooks/useAccount"
import Button from "../Button"
import ButtonImage from "../ButtonImage"

import { useEffect, useState } from "react"
import useSavings from "@/app/hooks/useSavings"

export default function Profile() {
    const { account, setAccount } = useAccount()
    const { resetSavings } = useSavings()

    const [displayText, setDisplayText] = useState<string | null>(null)

    useEffect(() => {
        if (!account) return
        setDisplayText(account.displayAddress)
    }, [account])

    if (!account) return null

    return (
        <Button
            onClick={() => {
                localStorage.removeItem("account")
                setAccount(null)
                resetSavings()
            }}
            onMouseEnter={() => setDisplayText("Log Out")}
            onMouseLeave={() => setDisplayText(account.displayAddress)}
        >
            <span>{displayText}</span>
            <ButtonImage rounded border animate src={account.profilePhoto} alt="Address avatar" />
        </Button>
    )
}
