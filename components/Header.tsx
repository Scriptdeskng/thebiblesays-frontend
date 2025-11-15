"use client"

import Image from 'next/image'
import Link from 'next/link'
import { CircleUserRound, ShoppingCart, X } from 'lucide-react';
import { Button } from './ui/Button';
import { NavLink } from './ui/Nav-Link';
import { SearchInput } from './ui/Search-Input';
import { MobileSearchButton } from './ui/Mobile-search';
import { CurrencySelector } from './ui/Currency-selector';
import { useState } from 'react';
import { RiMenu2Fill } from 'react-icons/ri';

const Header = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className=''>
            <div className='text-white px-5 py-2 w-full bg-primary text-center
        flex flex-row justify-center text-sm sm:text-base items-center gap-5'>
                <span>Get 25% OFF on your first order.</span>
                <span className='hidden sm:block'><Link href="/shop">Order Now</Link></span>
            </div>

            <div className='hidden lg:flex flex-row py-5 px-5 sm:px-10 lg:px-20 justify-between items-center w-full max-w-[1536px] mx-auto'>
                <div className='flex flex-row items-center gap-20'>
                    <Link href="/">
                        <Image
                            src="/assets/thebiblesays_logo.png"
                            alt="The Bible Says Logo"
                            className='w-32'
                            width={1000}
                            height={1000}
                        >
                        </Image>
                    </Link>

                    <ul className="flex flex-row gap-10 text-lg">
                        <li><NavLink href="/shop">Shop</NavLink></li>
                        <li><NavLink href="/about">About us</NavLink></li>
                        <li><NavLink href="/byom">B.Y.O.M</NavLink></li>
                        <li><NavLink href="/faq">FAQs</NavLink></li>
                        <li><NavLink href="/contact">Contact us</NavLink></li>
                    </ul>
                </div>

                <div className='flex flex-row gap-5'>
                    <SearchInput placeholder="Search products" />

                    <Button variant="ghost" leftIcon={<ShoppingCart className='w-6 h-6 text-grey p-0' />} />

                    <Button variant="ghost" leftIcon={<CircleUserRound className='w-6 h-6 text-grey p-0' />} />

                    <CurrencySelector
                        value="NGN"
                        onChange={(c) => console.log("Selected currency:", c)}
                    />
                </div>
            </div>

            {/* Mobile */}
            <div className='lg:hidden fixed w-full'>

                <div className='flex py-3 px-5 sm:px-10 flex-row items-center justify-between w-full'>
                    <div className='flex flex-row items-center gap-1 sm:gap-2'>
                        <Button
                            variant="ghost"
                            leftIcon={<RiMenu2Fill className='w-6 h-6' />}
                            onClick={() => setMobileOpen(true)}
                            className='px-0'
                        />

                        <Link href="/">
                            <Image
                                src="/assets/thebiblesays_logo.png"
                                alt="The Bible Says Logo"
                                className='w-20 sm:w-24'
                                width={1000}
                                height={1000}
                            >
                            </Image>
                        </Link>
                    </div>

                    <div className='flex flex-row items-center gap-1 sm:gap-2'>
                        <MobileSearchButton className="border-none p-0" />

                        <Button variant="ghost" leftIcon={<ShoppingCart className='w-6 h-6 text-grey p-0' />} />
                    </div>
                </div>

                {mobileOpen && (
                    <div className="fixed bg-white inset-0 z-50 m-6 flex flex-col shadow">
                        <div className='bg-secondary flex w-full items-center justify-between py-5'>
                            <Link href="/">
                                <Image
                                    src="/assets/thebiblesays_logo.png"
                                    alt="The Bible Says Logo"
                                    className='w-20'
                                    width={1000}
                                    height={1000}
                                >
                                </Image>
                            </Link>
                            <Button
                                variant="ghost"
                                leftIcon={<X className='w-7 h-7' />}
                                onClick={() => setMobileOpen(false)}
                            />
                        </div>


                        <ul className='flex flex-col gap-4 font-medium px-5 py-10 bg-white text-lg'>
                                                    <CurrencySelector
                            value="NGN"
                            onChange={(c) => console.log("Selected currency:", c)}
                        />
                            <li><Link href="/shop">Shop</Link></li>
                            <li><Link href="/about">About us</Link></li>
                            <li><Link href="/byom">B.Y.O.M</Link></li>
                            <li><Link href="/faq">FAQs</Link></li>
                            <li><Link href="/contact">Contact us</Link></li>
                            <li><Button variant="ghost" className='p-0'>My Account</Button></li>
                        </ul>
                    </div>
                )}

            </div>
        </div>
    )
}

export default Header