import Image from "next/image"
import Link from "next/link"

const Story = () => {
    return (
        <div className="p-5 sm:p-10 xl:p-20 w-full">
            <div className="bg-secondary pt-5 px-5 flex flex-col-reverse xl:flex-row xl:justify-between gap-10 w-full max-w-[1536px] mx-auto sm:px-10 sm:items-center">
                <div className="w-full xl:w-1/2 flex items-center justify-center">
                    <Image
                        src="/assets/aboutImage.png"
                        alt="Story Image"
                        className="w-[483px]"
                        width={1000}
                        height={1000}
                    ></Image>
                </div>

                <div className="w-full xl:w-1/2">
                    <h5 className="text-[#878A92] text-sm mb-2">OUR STORY</h5>
                    <h3 className="text-primary text-2xl sm:text-3xl font-bold mb-2">"The Bible Says..."</h3>
                    <p className="mb-5 xl:text-lg text-grey"><span className="font-bold">TheBibleSays</span> began with one simple idea: faith should be seen, not just spoken. What started as a few statement tees quickly grew into a movement - a community of believers expressing purpose through everyday fashion. <br /><br />
                        Every collection is crafted with excellence, intention, and prayer. We design for the everyday believer - the student, the creative, the parent, the pastor, the dreamer - anyone ready to let their light shine through what they wear</p>
                    <Link href="/shop" className="h-10 w-fit sm:h-12 px-8 flex items-center gap-2 border border-primary text-primary rounded-lg xl:px-12">Explore Collections</Link>
                </div>

            </div>
        </div>
    )
}

export default Story