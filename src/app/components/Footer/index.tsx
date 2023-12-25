import { LuGithub } from "react-icons/lu"
import { LuTwitter } from "react-icons/lu"

import Button from "../Button"

export default function Footer() {
    return (
        <footer className="flex flex-col sm:flex-row justify-between items-center p-4">
            <p className="text-sm sm:text-base mb-4 sm:mb-0">
                Data provided by L2Savings is as is, with no guarantee of accuracy.
            </p>
            <div className="flex flex-row space-x-2 items-center">
                <Button link="https://github.com/bbayazit16/l2savings">
                    <span>Github</span>
                    <LuGithub />
                </Button>

                <Button link="https://x.com/l2savings">
                    <span>Twitter</span>
                    <LuTwitter />
                </Button>
            </div>
        </footer>
    )
}
