import Image from "next/image"
import Link from "next/link"
import { Button } from "../ui/Button"

const Explore = () => {
    return (
        <div className="py-10 max-w-[1536px] mx-auto px-5 sm:px-10 xl:px-20">
            <div className="flex flex-col md:flex-row gap-6 xl:gap-16">
                <div>
                    <div className="bg-accent-1 flex items-center justify-center px-4">
                        <Image
                            src="/assets/aboutImage.png"
                            alt="Explore Image"
                            className="w-[450px]"
                            width={1000}
                            height={1000}>
                        </Image>
                    </div>

                    <p className="mt-2">Made to speak without saying a word. Our T-shirts carry timeless messages of faith, strength, and purpose - designed for everyday comfort and effortless style</p>
                </div>

                <div className="hidden md:block">
                    <div className="bg-accent-1 flex items-center justify-center px-4">
                        <Image
                            src="/assets/heroImage.png"
                            alt="Explore Image"
                            className="w-[450px]"
                            width={1000}
                            height={1000}>
                        </Image>
                    </div>

                    <p className="mt-2">Made to speak without saying a word. Our T-shirts carry timeless messages of faith, strength, and purpose - designed for everyday comfort and effortless style</p>
                </div>
            </div>


            <div className="flex items-center justify-center mt-5 md:mt-10">
            <Link href="/shop">
                <Button variant="outline">Explore Collections</Button>
            </Link>
            </div>
        </div>
    )
}

export default Explore