import clsx from "clsx"

type ButtonProps = {
    children: React.ReactNode
    link?: string
    download?: string
    type?: "submit" | "button" | "reset"
    disabled?: boolean
    onClick?: () => void
    onMouseEnter?: () => void
    onMouseLeave?: () => void
    className?: string
}

export default function Button({
    children,
    link,
    download,
    onClick,
    disabled,
    onMouseEnter,
    onMouseLeave,
    type,
    className,
}: ButtonProps) {
    if (link) {
        return (
            <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                download={download}
                className={clsx(
                    className,
                    "border-zinc-800 dark:border-white border-2 flex items-center px-2 py-1 md:px-3 md:py-2 rounded-lg gap-1 md:gap-2 hover:scale-105 duration-300 transition-all"
                )}
            >
                {children}
            </a>
        )
    }

    return (
        <button
            type={type || "button"}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            disabled={disabled}
            className={clsx(
                className,
                "border-zinc-800 dark:border-white border-2 flex items-center px-2 py-1 md:px-3 md:py-2 rounded-lg gap-1 md:gap-2 hover:scale-105 duration-300 transition-all"
            )}
            onClick={onClick}
        >
            {children}
        </button>
    )
}
