import Image from "next/image"
import Link from "next/link"

export default function Logo() {
    return (
        <Link
            href="/"
            role="button"
            aria-label="Home"
            className="w-full max-w-12 md:max-w-20 lg:max-w-24 select-none"
        >
            <Image src="/l2savings.svg" alt="L2Savings Logo" width={88} height={88} />
        </Link>
        // <Link href="/" role="button" aria-label="Home">
        //     <Image src="/l2savings.svg" alt="L2Savings Logo" width={96} height={96} />
        // </Link>
    )
}
