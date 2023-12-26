"use client"

import { useState } from "react"
import { isAddress } from "ethers"

import Button from "../Button"
import useAccount from "@/app/hooks/useAccount"
import useSavings from "@/app/hooks/useSavings"

const Spinner = () => (
    <div className="animate-spin rounded-full h-6 w-6 border-4 border-t-white border-r-transparent border-b-gray-300 border-l-transparent dark:border-t-gray-900 dark:border-b-gray-600"></div>
)

export default function EnterAddress() {
    const [inputValue, setInputValue] = useState("")
    const [isInvalid, setIsInvalid] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value)
    }

    const { setAddress, account } = useAccount()
    const { savingsStartedFetching } = useSavings()

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()

        if (!inputValue) return

        setIsInvalid(false)
        setIsLoading(true)
        if (isAddress(inputValue)) {
            const address = inputValue.toLowerCase()
            setAddress(address, "address")
                .then(setIsInvalid)
                .finally(() => setIsLoading(false))
        } else {
            setAddress(inputValue, "ens")
                .then(setIsInvalid)
                .finally(() => setIsLoading(false))
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex flex-row space-x-4 justify-center m-auto">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    disabled={isLoading || savingsStartedFetching}
                    className={`md:text-2xl rounded-lg border-2 p-2 py-1 bg-zinc-200 dark:bg-zinc-800 ${
                        isInvalid
                            ? "border-red-500 animate-shake"
                            : "border-zinc-800 dark:border-white"
                    }`}
                    placeholder={account?.displayAddress || "Enter Ethereum address or ENS name"}
                />
                <Button
                    type="submit"
                    disabled={isLoading || savingsStartedFetching}
                    className="text-white dark:text-black bg-zinc-800 dark:bg-zinc-200 border-0 md:border-0 md:py-0"
                >
                    {isLoading || savingsStartedFetching ? <Spinner /> : "Submit"}{" "}
                </Button>
            </div>
        </form>
    )
}
