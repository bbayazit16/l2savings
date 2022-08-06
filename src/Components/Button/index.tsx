import { Link } from "react-router-dom"

interface IButton {
    text: string
    href?: string
    path?: string
    image?: string
    rotate?: boolean
    download?: string
    gradient?: string
    onClick?: () => void
    imageProperties?: string
    showCircularBorder?: boolean
}

const Button = ({
    text,
    href,
    path,
    image,
    gradient,
    download,
    imageProperties,
    onClick,
    showCircularBorder = false,
    rotate = false,
}: IButton) => {
    if (
        (onClick && href) ||
        (onClick && path) ||
        (onClick && download) ||
        (onClick && path) ||
        (href && path) ||
        (path && download)
    ) {
        throw new Error(
            "href, path, download, and onClick are mutually exclusive. Only href and download is allowed"
        )
    }

    return path ? (
        <Link
            className="flex flex-row-reverse justify-center items-center bg-[#111824]
            rounded-2xl cursor-pointer border-[#1e2c42] border-[0.15rem] hover:scale-110 duration-500 select-none
            hover:bg-[#172e57] hover:border-[#1e2c42] w-auto h-auto"
            to={path}
        >
            {image ? (
                <div
                    className={[
                        "rounded-full",
                        "h-4",
                        "w-4",
                        "mr-1",
                        "overflow-hidden",
                        "md:h-8",
                        "md:w-8",
                    ]
                        .concat(
                            showCircularBorder
                                ? ["border-black", "border-2", "md:border-[3px]"]
                                : []
                        )
                        .concat(rotate ? ["hover:rotate-360", "duration-1000"] : [])
                        .concat(imageProperties || [])
                        .join(" ")}
                >
                    <img className="h-full w-full" src={image} alt="Button image" />
                </div>
            ) : gradient ? (
                <div
                    className={[
                        "rounded-full",
                        "h-4",
                        "w-4",
                        "mr-1",
                        "overflow-hidden",
                        "md:h-8",
                        "md:w-8",
                    ]
                        .concat(
                            showCircularBorder
                                ? ["border-black", "border-2", "md:border-[3px]"]
                                : []
                        )
                        .concat(rotate ? ["hover:rotate-360", "duration-1000"] : [])
                        .concat(imageProperties || [])
                        .join(" ")}
                >
                    <svg className={gradient} />
                </div>
            ) : null}
            <div className="flex pt-[0.1rem] md:pt-0 m-auto">
                <span className="font-bold select-none m-auto text-sm md:text-xl lg:text-2xl pr-1 pl-1 md:pr-3 md:pl-3">
                    {text}
                </span>
            </div>
        </Link>
    ) : onClick ? (
        <div
            className="flex flex-row-reverse justify-center items-center bg-[#111824]
            rounded-2xl cursor-pointer border-[#1e2c42] border-[0.15rem] hover:scale-110 duration-500 select-none
            hover:bg-[#172e57] hover:border-[#1e2c42] w-auto h-auto"
            onClick={onClick}
        >
            {image ? (
                <div
                    className={[
                        "rounded-full",
                        "h-4",
                        "w-4",
                        "mr-1",
                        "overflow-hidden",
                        "md:h-8",
                        "md:w-8",
                    ]
                        .concat(
                            showCircularBorder
                                ? ["border-black", "border-2", "md:border-[3px]"]
                                : []
                        )
                        .concat(rotate ? ["hover:rotate-360", "duration-1000"] : [])
                        .concat(imageProperties || [])
                        .join(" ")}
                >
                    <img className="h-full w-full" src={image} alt="Button image" />
                </div>
            ) : gradient ? (
                <div
                    className={[
                        "rounded-full",
                        "h-4",
                        "w-4",
                        "mr-1",
                        "overflow-hidden",
                        "md:h-8",
                        "md:w-8",
                    ]
                        .concat(
                            showCircularBorder
                                ? ["border-black", "border-2", "md:border-[3px]"]
                                : []
                        )
                        .concat(rotate ? ["hover:rotate-360", "duration-1000"] : [])
                        .concat(imageProperties || [])
                        .join(" ")}
                >
                    <svg className={gradient} />
                </div>
            ) : null}
            <div className="flex pt-[0.1rem] md:pt-0 m-auto">
                <span className="font-bold select-none m-auto text-sm md:text-xl lg:text-2xl pr-1 pl-1 md:pr-3 md:pl-3">
                    {text}
                </span>
            </div>
        </div>
    ) : (
        <a
            className="flex flex-row-reverse justify-center items-center bg-[#111824]
            rounded-2xl cursor-pointer border-[#1e2c42] border-[0.15rem] hover:scale-110 duration-500 select-none
            hover:bg-[#172e57] hover:border-[#1e2c42] w-auto h-auto"
            target="_blank"
            rel="noopener noreferrer"
            download={download}
            href={href}
        >
            {image ? (
                <div
                    className={[
                        "rounded-full",
                        "h-4",
                        "w-4",
                        "mr-1",
                        "overflow-hidden",
                        "md:h-8",
                        "md:w-8",
                    ]
                        .concat(
                            showCircularBorder
                                ? ["border-black", "border-2", "md:border-[3px]"]
                                : []
                        )
                        .concat(rotate ? ["hover:rotate-360", "duration-1000"] : [])
                        .concat(imageProperties || [])
                        .join(" ")}
                >
                    <img className="h-full w-full" src={image} alt="Button image" />
                </div>
            ) : gradient ? (
                <div
                    className={[
                        "rounded-full",
                        "h-4",
                        "w-4",
                        "mr-1",
                        "overflow-hidden",
                        "md:h-8",
                        "md:w-8",
                    ]
                        .concat(
                            showCircularBorder
                                ? ["border-black", "border-2", "md:border-[3px]"]
                                : []
                        )
                        .concat(rotate ? ["hover:rotate-360", "duration-1000"] : [])
                        .concat(imageProperties || [])
                        .join(" ")}
                >
                    <svg className={gradient} />
                </div>
            ) : null}
            <div className="flex pt-[0.1rem] md:pt-0 m-auto">
                <span className="font-bold select-none m-auto text-sm md:text-xl lg:text-2xl pr-1 pl-1 md:pr-3 md:pl-3">
                    {text}
                </span>
            </div>
        </a>
    )
}

export default Button
