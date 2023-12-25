import clsx from "clsx"
import Image from "next/image"

type ButtonImageProps = {
    src: string
    alt: string
    rounded?: boolean
    border?: boolean
    animate?: boolean
}

export default function ButtonImage({
    src,
    alt,
    border = false,
    animate = false,
}: ButtonImageProps) {
    return (
        <div
            className={clsx(
                "inline-flex justify-center items-center m-auto rounded-full overflow-hidden align-middle",
                "h-6 w-6 md:w-8 md:h-8 select-none",
                animate && "transition-all duration-1000 hover:rotate-360",
                border && "border-black border-2 md:border-[3px]"
            )}
            style={{ contain: "layout" }}
        >
            <Image src={src} alt={alt} fill />
        </div>
    )
}
