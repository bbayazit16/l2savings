"use client"

import { useTheme } from "next-themes"
import { LuSun } from "react-icons/lu"
import { LuMoon } from "react-icons/lu"
import { LuGhost } from "react-icons/lu"
import { useEffect, useState } from "react"

export default function ThemeSwitch() {
    const [isMounted, setIsMounted] = useState(false)
    const { resolvedTheme, setTheme } = useTheme()

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const switchTheme = () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark")
    }

    if (!isMounted) {
        return <LuGhost className="cursor-pointer" />
    }

    return (
        <div
            onClick={switchTheme}
            aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            role="button"
            tabIndex={0}
            className="select-none"
        >
            {resolvedTheme === "dark" ? (
                <LuMoon className="cursor-pointer hover:scale-110 duration-500 transition-all" />
            ) : (
                <LuSun className="cursor-pointer hover:scale-110 duration-500 transition-all" />
            )}
        </div>
    )
}
