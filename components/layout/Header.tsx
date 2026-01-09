"use client";

import Image from 'next/image';
import Link from 'next/link';
import { CircleUserRound, ShoppingCart, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { NavLink } from '../ui/Nav-Link';
import { SearchInput } from '../ui/Search-Input';
import { MobileSearchButton } from '../ui/Mobile-search';
import { MobileSearchModal } from '../ui/MobileSearchModal';
import { CurrencySelector } from '../ui/Currency-selector';
import { useState } from 'react';
import { RiMenu2Fill } from 'react-icons/ri';
import { useCartStore } from '@/store/useCartStore';
import { CartModal } from '@/components/cart/CartModal';

const Header = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    const { items } = useCartStore();
    const cartCount = items.reduce((t, i) => t + i.quantity, 0);

    return (
        <div className="">
            <div className="text-white px-5 py-2 w-full bg-primary text-center flex flex-row justify-center text-sm sm:text-base items-center gap-5">
                <span>Get 25% OFF on your first order.</span>
                <span className="hidden sm:block"><Link href="/shop">Order Now</Link></span>
            </div>

            <div className="hidden xl:flex flex-row py-5 px-10 justify-between items-center w-full max-w-[1536px] mx-auto">
                <div className="flex flex-row items-center gap-20">
                    <Link href="/">
                        <Image
                            src="/assets/thebiblesays_logo.png"
                            alt="The Bible Says Logo"
                            className="w-32"
                            width={1000}
                            height={1000}
                        />
                    </Link>

                    <ul className="flex flex-row gap-10 text-lg">
                        <li><NavLink href="/shop">Shop</NavLink></li>
                        <li><NavLink href="/about">About us</NavLink></li>
                        <li><NavLink href="/byom">B.Y.O.M</NavLink></li>
                        <li><NavLink href="/faq">FAQs</NavLink></li>
                        <li><NavLink href="/contact">Contact us</NavLink></li>
                    </ul>
                </div>

                <div className="flex flex-row gap-5 items-center">
                    <SearchInput placeholder="Search products" />

                    <div className="relative">
                        <Button
                            variant="ghost"
                            onClick={() => setCartOpen(true)}
                            className="relative p-0"
                        >
                            <ShoppingCart className="w-6 h-6 text-grey" />
                        </Button>

                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 text-primary text-xs 
                               w-5 h-5 flex items-center justify-center rounded-full font-medium">
                                {cartCount}
                            </span>
                        )}
                    </div>

                    <Link href="/profile">
                        <Button variant="ghost" leftIcon={<CircleUserRound className="w-6 h-6 text-grey" />} />
                    </Link>
                </div>
            </div>

            {/* MOBILE NAV */}
            <div className="xl:hidden w-full">
                <div className="flex py-3 px-5 sm:px-10 flex-row items-center justify-between w-full">
                    <div className="flex flex-row items-center gap-2">
                        <Button
                            variant="ghost"
                            leftIcon={<RiMenu2Fill className="w-6 h-6" />}
                            onClick={() => setMobileOpen(true)}
                            className="px-0"
                        />

                        <Link href="/">
                            <Image
                                src="/assets/thebiblesays_logo.png"
                                alt="The Bible Says Logo"
                                className="w-20 sm:w-24"
                                width={1000}
                                height={1000}
                            />
                        </Link>
                    </div>

                    <div className="flex flex-row items-center gap-5">
                        <MobileSearchButton
                            className="border-none p-0"
                            onClick={() => setSearchOpen(true)}
                        />

                        <div className="relative">
                            <Button
                                variant="ghost"
                                onClick={() => setCartOpen(true)}
                                className="p-0"
                            >
                                <ShoppingCart className="w-6 h-6 text-grey" />
                            </Button>

                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-3 text-primary text-xs 
                                 w-5 h-5 flex items-center justify-center rounded-full font-medium">
                                    {cartCount}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {mobileOpen && (
                    <div className="fixed bg-white inset-0 z-50 m-6 flex flex-col shadow">
                        <div className="bg-secondary flex w-full items-center justify-between py-5">
                            <Link href="/">
                                <Image
                                    src="/assets/thebiblesays_logo.png"
                                    alt="The Bible Says Logo"
                                    className="w-20"
                                    width={1000}
                                    height={1000}
                                />
                            </Link>
                            <Button
                                variant="ghost"
                                leftIcon={<X className="w-7 h-7" />}
                                onClick={() => setMobileOpen(false)}
                            />
                        </div>

                        <ul className="flex flex-col gap-4 font-medium px-5 py-10 bg-white text-lg">
                            <li><Link href="/shop" onClick={() => setMobileOpen(false)}>Shop</Link></li>
                            <li><Link href="/about" onClick={() => setMobileOpen(false)}>About us</Link></li>
                            <li><Link href="/byom" onClick={() => setMobileOpen(false)}>B.Y.O.M</Link></li>
                            <li><Link href="/faq" onClick={() => setMobileOpen(false)}>FAQs</Link></li>
                            <li><Link href="/contact" onClick={() => setMobileOpen(false)}>Contact us</Link></li>
                            <li><Link href="/profile"><Button variant="ghost" className="p-0">My Account</Button></Link></li>
                        </ul>
                    </div>
                )}
            </div>

            <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />
            <MobileSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </div>
    );
};

export default Header;