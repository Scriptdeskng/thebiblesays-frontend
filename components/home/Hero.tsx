import { MoveRight } from "lucide-react"
import Image from "next/image"
import { Button } from "../ui/Button"
import Link from "next/link"

const Hero = () => {
    return (
        <div className="bg-accent-1">
            <div className="max-w-[1536px] mx-auto px-5 sm:px-10 lg:px-20 w-full pt-20 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between xl:pt-32">
                <div className="w-full lg:w-1/2 xl:pb-10">
                    <h1 className="text-primary text-3xl sm:text-4xl font-bold mb-2">Faith Woven Into Every Thread</h1>
                    <p className="mb-5 text-lg sm:w-[70%]">Inspired by the Gospel. Crafted with intention. Our collections are made to remind you that grace isn't just spoken - it's lived, worn, and shared</p>
                    <Link href="/shop" className="h-10 w-fit sm:h-12 px-8 flex items-center gap-2 bg-primary text-white rounded-lg xl:px-12">Shop Now <span><MoveRight /></span></Link>
                </div>

                <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
                    <div className="bg-accent-2 w-[340px] h-[340px] rounded-full flex justify-center relative">
                        <Image
                            src="/assets/Burst-pucker.png"
                            alt="Star"
                            className="w-16 h-16 sm:w-24 sm:h-24 absolute -left-2 -top-5 sm:-left-10 sm:-top-10"
                            width={1000}
                            height={1000}
                        />
                        <Image
                            src="/assets/heroImage.png"
                            alt="Hero Image"
                            className="w-[255px]"
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