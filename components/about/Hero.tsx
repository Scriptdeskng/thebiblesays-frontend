import { MoveRight } from "lucide-react"
import Image from "next/image"
import { Button } from "../ui/Button"
import Link from "next/link"

const Hero = () => {
    return (
        <div className="bg-accent-1">
            <div className="max-w-[1536px] mx-auto px-5 sm:px-10 lg:px-20 w-full pt-20 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between xl:pt-32">
                <div className="w-full lg:w-1/2 xl:pb-10">
                    <h5 className="text-[#878A92] text-sm mb-2">ABOUT US</h5>
                    <h1 className="text-primary text-3xl sm:text-4xl font-bold mb-2">More Than Merch - It's a Movement of Faith</h1>
                    <p className="mb-5 text-lg sm:w-[70%]">We believe what you wear should speak life. Every piece we create carries a message of hope, curage, and truth - designed to inspire you to live boldly in your faith</p>
                    <Link href="/shop" className="h-10 w-fit sm:h-12 px-8 flex items-center gap-2 border border-primary text-primary rounded-lg xl:px-12">Explore Collections</Link>
                </div>

                <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
                    <div className="bg-transparent w-[400px] h-[400px] rounded-full flex justify-center relative">
                        <Image
                            src="/assets/Burst-pucker.png"
                            alt="Star"
                            className="w-16 h-16 sm:w-20 sm:h-20 absolute left-10 top-5 sm:left-5 sm:top-5"
                            width={1000}
                            height={1000}
                        />
                        <Image
                            src="/assets/featuredImage.png"
                            alt="Hero Image"
                            className="w-[384px]"
                            width={1000}
                            height={1000}
                        ></Image>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Hero