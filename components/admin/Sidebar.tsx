'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
    LogOut,
    X,
} from 'lucide-react';
import { MdDashboard } from 'react-icons/md';
import { RiGiftFill, RiSettings5Fill, RiTShirtFill, RiUserSettingsFill } from "react-icons/ri";
import { BiSolidCoinStack } from 'react-icons/bi';
import { BsFillBagHeartFill } from 'react-icons/bs';
import { FaPalette } from 'react-icons/fa';
import { FaFileLines } from 'react-icons/fa6';


interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const menuItems = [
    { icon: MdDashboard, label: 'Dashboard', href: '/admin/dashboard' },
    { icon: RiTShirtFill, label: 'Product Management', href: '/admin/dashboard/products' },
    { icon: BsFillBagHeartFill, label: 'Order Management', href: '/admin/dashboard/orders' },
    { icon: RiUserSettingsFill, label: 'User Management', href: '/admin/dashboard/users' },
    { icon: BiSolidCoinStack, label: 'Finance Management', href: '/admin/dashboard/finance' },
    { icon: FaPalette, label: 'Custom Merch', href: '/admin/dashboard/custom-merch' },
    { icon: FaFileLines, label: 'Content Management', href: '/admin/dashboard/content' },
    { icon: RiGiftFill, label: 'Loyalty Program', href: '/admin/dashboard/loyalty' },
    { icon: RiSettings5Fill, label: 'Settings', href: '/admin/dashboard/settings' },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        window.location.href = '/admin/auth/login';
    };

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`
                    fixed top-0 left-0 h-full bg-white z-50
                    transition-transform duration-300 ease-in-out p-5
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0
                `}
            >
                <div className='w-60 flex flex-col bg-admin-primary/4 h-full rounded-lg shadow-lg'>
                    <div className="h-16 flex items-center justify-between pr-4">
                        <Link href="/admin/dashboard">
                            <Image
                                src="/assets/thebiblesays_logo.png"
                                alt="The Bible Says Logo"
                                className="w-24"
                                width={1000}
                                height={1000}
                            />
                        </Link>
                        <button
                            onClick={onClose}
                            className="lg:hidden text-grey hover:text-primary transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <nav className="flex-1 overflow-y-auto py-6 px-4">
                        <ul className="space-y-3">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            onClick={() => {
                                                if (window.innerWidth < 1024) {
                                                    onClose();
                                                }
                                            }}
                                            className={`
                                                    flex items-center space-x-3 px-4 py-3 rounded-md transition-all
                                                    ${isActive
                                                    ? 'bg-admin-primary text-white'
                                                    : 'text-admin-primary/50 hover:bg-accent-1 hover:text-admin-primary'
                                                }
                                    `}
                                        >
                                            <Icon size={20}/>
                                            <span className="text-sm">{item.label}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    <div className="p-4 border-t border-accent-2">
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all w-full"
                        >
                            <LogOut size={20} />
                            <span className="text-sm font-medium">Logout</span>
                        </button>
                    </div>

                </div>
            </aside>
        </>
    );
}
