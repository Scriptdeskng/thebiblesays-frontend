import Image from "next/image"
import Link from "next/link"

const Movement = () => {
    return (
        <div className="py-10">
            <div
                className="
                    w-full h-100 sm:h-120 xl:h-180 
                    bg-[url('/assets/image2.avif')]
                    bg-cover 
                    bg-top-right
                    "
            ></div>

            <div className="flex flex-col items-center justify-center py-5 px-5 sm:px-10 xl:px-20 gap-5">
                <p className="text-center sm:w-[75%] sm:text-lg xl:w-[50%]">"We're more than a clothing brand: we're a family of believers. Every purchase supports our outreach efforts - from youth empowerment projects to faith-based creative programs. When you wear MerchBrand, you're joinin a community that believes in purpose, hope, and impact"</p>
                <Link href="/shop" className="h-10 w-fit sm:h-12 px-8 flex items-center gap-2 border border-primary text-primary rounded-lg xl:px-12">Join the Movement</Link>
            </div>
        </div>
    )
}

export default Movement