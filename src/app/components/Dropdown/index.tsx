import Link from "next/link"

interface IDropper {
    text: string
    items: { display: string; url?: string; to?: string }[]
}

const Dropdown = ({ text, items }: IDropper) => {
    items.some(item => {
        if (item.to && item.url) {
            throw new Error("items.to and items.url are mutually exclusive.")
        }

        if (!item.to && !item.url) {
            throw new Error("at least one of items.to and items.url is required.")
        }
    })

    return (
        <div className="flex justify-center group">
            <div
                className="flex flex-row-reverse justify-center items-center bg-[#111824]
            rounded-2xl cursor-pointer border-[#1e2c42] border-[0.15rem] hover:scale-110 duration-500 select-none
            hover:bg-[#172e57] hover:border-[#1e2c42] w-auto h-auto group"
            >
                <div className="flex pt-[0.1rem] md:pt-0 m-auto">
                    <span className="font-bold select-none m-auto text-sm md:text-2xl pr-1 pl-1 md:pr-3 md:pl-3">
                        {text}
                    </span>
                </div>
                <div className="absolute top-10 hidden group-hover:flex w-full h-auto mt-4 2xl:top-28">
                    <ul className="flex flex-col w-full">
                        {items.map((dropperItem, index) => {
                            return (
                                <li
                                    key={index}
                                    className="flex flex-row justify-start items-start bg-[#111824]
                                rounded-2xl cursor-pointer border-[#1e2c42] border-[0.15rem] hover:scale-110 duration-500 select-none
                                hover:bg-[#172e57] hover:border-[#1e2c42] w-full min-w-fit pl-2 pr-2 h-auto"
                                >
                                    {dropperItem.url ? (
                                        <a
                                            href={dropperItem.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full h-full font-bold z-10"
                                        >
                                            {dropperItem.display}
                                        </a>
                                    ) : (
                                        <Link
                                            href={dropperItem.to!}
                                            className="w-full h-full font-bold z-10"
                                        >
                                            {dropperItem.display}
                                        </Link>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default Dropdown
