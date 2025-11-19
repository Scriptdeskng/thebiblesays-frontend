import { MoveRight } from "lucide-react"
import Image from "next/image"
import { Button } from "../ui/Button"
import Link from "next/link"

const Hero = () => {
    return (
        <div className="bg-accent-1">
            <div className="max-w-[1536px] mx-auto px-5 sm:px-10 lg:px-20 w-full pt-20 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
                <div className="w-full lg:w-1/2 xl:pb-10">
                    <h1 className="text-primary text-3xl sm:text-4xl font-bold mb-2">Build Your Own Merch!</h1>
                    <p className="mb-5 text-lg sm:w-[70%]">Customize your merch with your favorite verses, phrases, or designs. From hoodie to hat - turn your faith into fashion that's uniquely you</p>
                    <Link href="/byom" className="h-10 w-fit sm:h-12 px-8 flex items-center gap-2 bg-primary text-white rounded-lg xl:px-12">Explore Now <span><MoveRight /></span></Link>
                </div>

                <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
                    <Image
                        src="/assets/featuredImage.png"
                        alt="Hero Image"
                        className="w-[255px]"
                        width={1000}
                        height={1000}
                    ></Image>
                </div>
            </div>
        </div>
    )
}

export default Hero