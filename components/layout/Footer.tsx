import Link from "next/link"
import Image from "next/image"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { FaGithub, FaInstagram, FaYoutube } from "react-icons/fa"
import { RiMastercardFill, RiVisaLine } from "react-icons/ri"
import { GrAmex } from "react-icons/gr"

const Footer = () => {
    return (
        <footer className="mt-10">
            <div className="bg-secondary py-10">
                <div className="max-w-[1536px] mx-auto px-5 sm:px-10 xl:px-20 flex flex-col md:flex-row gap-5 items-center md:justify-between">
                    <div className="flex flex-col items-center sm:items-start gap-3">
                        <h5 className="text-[#878A92] text-sm">NEWSLETTER</h5>
                        <h3 className="text-xl sm:text-2xl font-bold text-primary">Be First to the Drop</h3>
                        <p className="text-center sm:text-start text-grey sm:w-[75%]">Join 10,000+ insiders and get first access to limited merch, restocks and discounts</p>
                    </div>

                    <form className="flex flex-row gap-2 items-center">
                        <Input
                            placeholder="Your email address"
                            className="md:w-full"
                        >
                        </Input>
                        <Button>Subscribe</Button>
                    </form>
                </div>
            </div>

            <div className="bg-[#121212] text-white">
                <div className="max-w-[1536px] mx-auto px-5 sm:px-10 xl:px-20 flex flex-col md:flex-row gap-6 md:justify-between py-10">

                <div className="space-y-5">
                    <div>
                        <Link href="/">
                            <Image
                                src="/assets/thebiblesays_logo.png"
                                alt="The Bible Says Logo"
                                className="w-32"
                                width={1000}
                                height={1000}
                            />
                        </Link>
                    </div>

                    <p>Our collections are made to remind you that grace <br className="hidden md:flex" /> isn't just spoken - it's lived, worn, and shared</p>

                    <div className="flex flex-row gap-5">
                        <Link href="www.github.com" target="_blank" >
                            <FaGithub className="w-6 h-6 sm:w-8 sm:h-8" />
                        </Link>
                        <Link href="www.instagram.com" target="_blank">
                            <FaInstagram className="w-6 h-6 sm:w-8 sm:h-8" />
                        </Link>
                        <Link href="www.youtube.com" target="_blank">
                            <FaYoutube className="w-6 h-6 sm:w-8 sm:h-8" />
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-10 xl:gap-16">
                    <div className="flex flex-col gap-3">
                        <h5 className="uppercase mb-2 sm:mb-5 font-bold">Support</h5>
                        <Link href="/faq">FAQ</Link>
                        <Link href="/terms">Terms of use</Link>
                        <Link href="/privacy">Privacy Policy</Link>
                    </div>
                    <div className="flex flex-col gap-3">
                        <h5 className="uppercase mb-2 sm:mb-5 font-bold">Company</h5>
                        <Link href="/about">About us</Link>
                        <Link href="/contact">Contact</Link>
                    </div>
                    <div className="flex flex-col gap-3">
                        <h5 className="uppercase mb-2 sm:mb-5 font-bold">Shop</h5>
                        <Link href="/shop">Shop</Link>
                        <Link href="/cart">Cart</Link>
                    </div>
                </div>

                <div className="hidden xl:flex flex-col">
                    <h5 className="uppercase mb-5 font-bold text-grey">Accepted payments</h5>
                    <div className="flex flex-row items-center gap-5">
                        <div>
                            <RiMastercardFill className="text-grey w-10 h-10" />
                        </div>
                        <div>
                            <GrAmex className="text-grey w-10 h-10" />
                        </div>
                        <div>
                            <RiVisaLine className="text-grey w-10 h-10" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-10 border-t border-t-white max-w-[1536px] mx-auto px-5 sm:px-10 xl:px-20 text-center">
                <p>&#169; {new Date().getFullYear()} TheBibleSays. All rights reserved.</p>
            </div>
            </div>
        </footer>
    )
}

export default Footer