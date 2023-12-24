import twitter from "../../Assets/Image/twitter.svg"
import arrowdown from "../../Assets/Image/arrowdown.svg"

import Button from "../Button"
import SavingsParagraph from "../SavingsParagraph"
import TransactionBox from "../TransactionBox"

import { useState } from "react"
import Utils from "../../Utils"

const Main = ({ savings }: { savings: AllSavings | undefined }) => {
    const [currentlyViewing, setCurrentlyViewing] = useState<AvailableL2s>("all")

    return (
        <main className="h-full pb-12 lg:pt-16">
            <div className="flex flex-col space-y-8 ml-[5%] mr-[5%] sm:ml-[10%] sm:mr-[10%] md:ml-[15%] md:mr-[15%] lg:ml-[24%] lg:mr-[24%]">
                <div className="flex flex-col bg-[#0d1521] h-full w-full rounded-2xl pb-8">
                    <div className="flex flex-row justify-evenly h-16 md:h-20 xl:h-[5.5rem] 2xl:h-32 2xl:pt-8 border-b-[#182131] border-b-4 w-full gap-4 sm:gap-0 p-2 md:p-3">
                        <Button
                            text="All L2's"
                            gradient={Utils.chainToAsset("all")}
                            rotate={true}
                            showCircularBorder={true}
                            onClick={() => setCurrentlyViewing("all")}
                        />
                        <Button
                            text="Optimism"
                            image={Utils.chainToAsset("optimism")}
                            rotate={true}
                            showCircularBorder={true}
                            onClick={() => setCurrentlyViewing("optimism")}
                        />
                        <Button
                            text="Arbitrum"
                            image={Utils.chainToAsset("arbitrum")}
                            rotate={true}
                            onClick={() => setCurrentlyViewing("arbitrum")}
                        />
                        <Button
                            text="ZkSync"
                            image={Utils.chainToAsset("zkSync")}
                            rotate={true}
                            onClick={() => setCurrentlyViewing("zkSync")}
                        />
                    </div>
                    <div className="flex flex-col h-full">
                        <SavingsParagraph savings={savings} viewing={currentlyViewing} />
                        {savings ? (
                            <div className="flex flex-row justify-center p-5 space-x-8">
                                <Button
                                    text="Tweet stats"
                                    image={twitter}
                                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                                        `I have saved a total of $${parseInt(
                                            savings.all.saved.usd.toString()
                                        ).toLocaleString()} using L2s. That's ${parseFloat(
                                            savings.all.saved.timesCheaper.toString()
                                        )
                                            .toFixed(1)
                                            .toLocaleString()}x cheaper than L1 costs. See how much you've saved at @L2Savings`
                                    )}`}
                                    imageProperties="p-[0.15rem]"
                                />
                                <Button
                                    text="Download details"
                                    image={arrowdown}
                                    href={`data:text/json;charset=utf-8,${Utils.prepareDownload(
                                        savings
                                    )}`}
                                    download={`l2savings-${new Date().toISOString()}.json`}
                                />
                            </div>
                        ) : null}
                    </div>
                </div>
                {savings ? (
                    <div className="flex flex-col bg-[#0d1521] overflow-y-scroll h-64 w-full rounded-xl">
                        <TransactionBox savings={savings} viewing={currentlyViewing} />
                    </div>
                ) : null}
            </div>
        </main>
    )
}

export default Main
