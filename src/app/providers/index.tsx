"use client"

import { ThemeProvider } from "next-themes"

import AccountProvider from "./AccountProvider"
import SavingsProvider from "./SavingsProvider"
import ChosenL2Provider from "./ChosenL2Provider"

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        // defaultTheme is automatically set to user's system preference
        <ThemeProvider attribute="class">
            <AccountProvider>
                <SavingsProvider>
                    <ChosenL2Provider>{children}</ChosenL2Provider>
                </SavingsProvider>
            </AccountProvider>
        </ThemeProvider>
    )
}
