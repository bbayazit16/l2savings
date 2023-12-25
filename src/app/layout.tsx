import "./globals.css"

import type { Metadata } from "next"
import { Dongle } from "next/font/google"

import clsx from "clsx"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import Providers from "./providers"

const dongle = Dongle({ weight: ["400", "700"], subsets: ["latin"] })

export const metadata: Metadata = {
    title: "L2Savings",
    description: "How much in fees have you saved by using Ethereum L2s?",
    icons: {
        shortcut: "/favicon.svg",
    },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        // Note on suppressHydrationWarning:
        // If you do not add suppressHydrationWarning to your <html> you will get warnings
        // because next-themes updates that element. This property only applies one level deep,
        // so it won't block hydration warnings on other elements.
        // Source: https://github.com/pacocoursey/next-themes
        <html lang="en" suppressHydrationWarning>
            <head />
            <body
                className={clsx(dongle.className, "flex flex-col space-y-8 min-h-screen text-lg md:text-2xl")}
            >
                <Providers>
                    <Navbar />
                    {children}
                    <Footer />
                </Providers>
            </body>
        </html>
    )
}
