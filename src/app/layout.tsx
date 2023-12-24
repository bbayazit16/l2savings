import type { Metadata } from "next"
import { Dongle } from "next/font/google"

import "./globals.css"

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
        <html lang="en">
            <body className={dongle.className}>
                {/* <div className="flex flex-col min-h-screen"> */}
                {children}
                {/* <div/> */}
            </body>
        </html>
    )
}
