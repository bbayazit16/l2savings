import spinner from "../../Assets/Image/spinner.svg"

import { useEffect, useRef } from "react"

interface IInfo {
    title: string
    text: string
    subtitle: string
    completionTitle?: string
    disappear: boolean
}

const Info = ({ title, subtitle, text, disappear, completionTitle }: IInfo) => {
    const boxRef = useRef() as React.MutableRefObject<HTMLDivElement>
    const spinnerRef = useRef() as React.MutableRefObject<HTMLDivElement>

    useEffect(() => {
        if (disappear) {
            boxRef.current.classList.remove("bg-[#151b2d]")
            boxRef.current.classList.add("bg-green-900")
            spinnerRef.current.classList.add("hidden")

            new Promise(p => setTimeout(p, 1000)).then(() => {
                boxRef.current.classList.add("duration-1000")
                boxRef.current.style.opacity = "0"
                new Promise(p => setTimeout(p, 1000)).then(() => boxRef.current.remove())
            })
        }
    }, [disappear])

    return (
        <div
            ref={boxRef}
            className="relative flex flex-col border-2 p-2 border-gray-800
            opacity-80 hover:opacity-100 transition-opacity ease-out duration-500 w-full
            bg-[#151b2d] select-none"
        >
            <span className="text-lg md:text-xl">{disappear ? completionTitle : title}</span>
            <div ref={spinnerRef} className="flex flex-row space-x-2">
                <div className="flex flex-col">
                    <span className="text-md md:text-lg">{subtitle}</span>
                    <div className="flex flex-row">
                        <span className="text-md md:text-lg">{text}</span>
                        <img
                            src={spinner}
                            alt="Fetching transactions"
                            className="animate-spin ml-1 mr-3 h-6 w-6 m-auto"
                        />
                    </div>
                </div>
            </div>
            <div className="flex absolute -top-2 -right-2 opacity-100 rounded-full h-4 w-4 bg-red-500 cursor-pointer">
                <span
                    className="m-auto border-4 rounded-full animate-ping"
                    onClick={() => boxRef.current.classList.add("hidden")}
                ></span>
            </div>
        </div>
    )
}

export default Info
