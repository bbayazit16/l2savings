import Image from "next/image"
import Button from "../Button"
import ButtonImage from "../ButtonImage"
import Logo from "../Logo"
import ThemeSwitch from "./ThemeSwitch"
import Link from "next/link"
import Profile from "./Profile"

export default function Navbar() {
    return (
        <nav className="flex justify-between items-center px-4 pt-4">
            <div className="flex items-center text-3xl pl-4">
                <Logo />
                <Link role="button" aria-label="Home" href="/" className="text-xl md:text-3xl">
                    L2Savings
                </Link>
            </div>
            <div className="flex flex-row space-x-4 items-center pr-4">
                <ThemeSwitch />
                <Link
                    href="/faq"
                    className="border-zinc-800 dark:border-white border-2 flex items-center px-2 py-1 md:px-3 md:py-1 rounded-lg gap-1 md:gap-2 hover:scale-105 duration-300 transition-all"
                >
                    FAQ
                </Link>
                <Profile />
            </div>
        </nav>
    )
}
