import twitter from "../../Assets/Image/twitter.svg"
import github from "../../Assets/Image/github.svg"

import Button from "../Button"

const Footer = () => {
    return (
        <footer className="flex h-14 md:mt-16 md:h-24 2xl:h-32 select-none">
            <div className="flex flex-row h-full w-full">
                <div className="w-[35%] sm:w-[25%] h-full md:p-2 pl-2">
                    <p className="text-xs mt-2 xl:mt-4 2xl:mt-8 leading-[0.5rem] md:text-sm md:text-gray-300 text-gray-400 font-normal pt-1">
                        Data provided as is, with no guarantee of accuracy. Projects featured are
                        not sponsored, do your own research.
                    </p>
                </div>

                <div className="hidden lg:flex flex-row-reverse gap-4 w-[65%] sm:w-[75%] pt-1 pb-1 md:pr-8 md:pt-5 md:pb-5 lg:pt-4 lg:pb-4">
                    <Button
                        text="Twitter"
                        href="https://twitter.com/L2savings/"
                        image={twitter}
                        imageProperties="p-[0.15rem]"
                    />
                    <Button
                        text="Github"
                        href="https://github.com/bbayazit16/l2savings/"
                        showCircularBorder={true}
                        rotate={true}
                        image={github}
                    />
                </div>

                {/* <= MD Devices */}
                <div className="flex lg:hidden flex-row-reverse gap-4 w-[65%] sm:w-[75%] pt-1 pb-1 md:pr-8 md:pt-5 md:pb-5 lg:pt-4 lg:pb-4">
                    <Button
                        text="Twitter"
                        href="https://twitter.com/L2savings/"
                        image={twitter}
                        imageProperties="p-[0.15rem]"
                    />
                    <Button
                        text="Github"
                        href="https://github.com/bbayazit16/l2savings/"
                        showCircularBorder={true}
                        rotate={true}
                        image={github}
                    />
                    <Button text="FAQ" path="faq" />
                </div>
            </div>
        </footer>
    )
}

export default Footer
