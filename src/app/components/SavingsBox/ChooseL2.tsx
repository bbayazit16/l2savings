"use client"

import useChosenL2 from "@/app/hooks/useChosenL2"
import Button from "../Button"
import ButtonImage from "../ButtonImage"

export default function ChooseL2() {
    const { setChosenL2 } = useChosenL2()

    return (
        <div className="flex flex-row justify-evenly space-x-2 flex-wrap">
            <Button onClick={() => setChosenL2("all")}>
                <span>All L2s</span>
                <svg className="rounded-full h-4 w-4 md:h-8 md:w-8 overflow-hidden border-black border-[3px] hover:rotate-360 bg-gradient-to-r from-green-700 via-cyan-600 to-blue-400" />
            </Button>
            <Button onClick={() => setChosenL2("optimism")}>
                <span>Optimism</span>
                <ButtonImage src="/optimism.svg" alt="Optimism logo" animate border rounded />
            </Button>
            <Button onClick={() => setChosenL2("arbitrum")}>
                <span>Arbitrum</span>
                <ButtonImage src="/arbitrum.svg" alt="Arbitrum logo" animate />
            </Button>
            <Button onClick={() => setChosenL2("zkSyncLite")}>
                <span>ZkSync Lite</span>
                <ButtonImage src="/zksync.svg" alt="ZkSync logo" animate />
            </Button>
            <Button onClick={() => setChosenL2("linea")}>
                <span>Linea</span>
                <ButtonImage src="/linea.svg" alt="Linea logo" className="dark:invert" animate />
            </Button>
        </div>
    )
}
