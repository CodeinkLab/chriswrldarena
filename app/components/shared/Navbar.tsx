/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown, User, Loader2, User2, LogIn, Home, UserCheck2, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { FaAccusoft } from 'react-icons/fa';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const { user, loading, signOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const menuItems = [
        { label: 'Home', href: '/', icon: <Home size={18} /> },
        { label: 'About', href: '/about', icon: <User2 size={18} /> },
        { label: 'VIP Page', href: '/pricing', icon: <FaAccusoft size={18} /> },
        { label: 'Contact', href: '/contact', icon: <EnvelopeIcon className="w-[18px]" /> },
    ];

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSignOut = async () => {
        try {
            await signOut();
            router.push('/');
            router.refresh();
        } catch (error) {
            console.error('Sign out failed:', error);
        }
    };

    return (
        <nav className={`fixed w-full py-2 z-50 transition-all duration-300 ${isScrolled ? 'bg-black shadow-lg' : 'bg-black'
            }`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0">
                        <img
                            src="/img.png"
                            alt="ChrisWrldArena Logo"
                            className="h-10 w-auto"
                        />
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {menuItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${isScrolled
                                    ? `text-gray-700 ${pathname === item.href ? 'bg-gray-100/20 text-teal-500' : 'text-white hover:bg-teal-500/40'}`
                                    : `text-white ${pathname === item.href ? 'bg-white/20 text-teal-500' : 'hover:bg-white/10'}`
                                    } transition-colors duration-200`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Auth Buttons/Profile */}
                    <div className="hidden lg:flex items-center space-x-4">
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setDropdownVisible(!dropdownVisible)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-full ${isScrolled
                                        ? 'bg-gray-100/50 text-gray-100'
                                        : 'bg-white/10 text-white'
                                        }`}
                                >
                                    <User size={18} />
                                    <span className="text-sm">{user.username}</span>
                                    <ChevronDown size={16} />
                                </button>

                                {dropdownVisible && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2">
                                        <Link href="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-teal-50 transition-colors cursor-default">
                                            <UserCheck2 className='size-4' />
                                            Profile
                                        </Link>
                                        {user.role === 'ADMIN' && (
                                            <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 hover:bg-teal-50 transition-colors cursor-default">
                                                <LayoutDashboard className='size-4' />
                                                Dashboard
                                            </Link>
                                        )}
                                        <div className="flex items-center gap-2 px-4 py-2 hover:bg-teal-50 transition-colors cursor-default">
                                            <User2 className='size-4' />
                                            <p className=" text-neutral-700">  {user.username} </p>
                                        </div>

                                        <div className="flex items-center gap-2 px-4 py-2 hover:bg-teal-50 transition-colors cursor-default">
                                            <EnvelopeIcon className='size-4' />
                                            <p className=" text-neutral-700 truncate">  {user.email} </p>
                                        </div>

                                        <div className="flex items-center gap-2 px-4 py-2 hover:bg-teal-50 transition-colors cursor-default">
                                            <Home className='size-4' />
                                            <p className=" text-neutral-700">  {user.location?.country} ({user.location?.currencycode})</p>
                                        </div>
                                        <button
                                            onClick={handleSignOut}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/signin"
                                    className={`px-4 py-2 rounded-full text-sm ${isScrolled
                                        ? 'text-gray-700 hover:bg-gray-100'
                                        : 'text-white hover:bg-white/10'
                                        }`}
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/signup"
                                    className="px-4 py-2 rounded-full text-sm bg-teal-500 text-white hover:bg-teal-600"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className={`md:hidden rounded-md p-2 ${isScrolled ? 'text-white/90' : 'text-white'
                            }`}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden bg-white shadow-xl">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {menuItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${pathname === item.href
                                    ? 'text-teal-500 bg-gray-100'
                                    : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        ))}
                        <hr className='w-full border border-neutral-100' />
                        {user && <div className="my-2">
                            <Link href="/profile" className="flex items-center gap-2 p-2 hover:bg-teal-50 transition-colors cursor-default">
                                <UserCheck2 className='size-4' />
                                Profile
                            </Link>
                            {user.role === 'ADMIN' && (
                                <Link href="/dashboard" className="flex items-center gap-2 p-2 hover:bg-teal-50 transition-colors cursor-default">
                                    <LayoutDashboard className='size-4' />
                                    Dashboard
                                </Link>
                            )}
                            <div className="flex items-center gap-2 p-2 hover:bg-teal-50 transition-colors cursor-default">
                                <User2 className='size-4' />
                                <p className=" text-neutral-700">  {user.username} </p>
                            </div>

                            <div className="flex items-center gap-2 p-2 hover:bg-teal-50 transition-colors cursor-default">
                                <EnvelopeIcon className='size-4' />
                                <p className=" text-neutral-700 truncate">  {user.email} </p>
                            </div>

                            <div className="flex items-center gap-2 p-2 hover:bg-teal-50 transition-colors cursor-default">
                                <Home className='size-4' />
                                <p className=" text-neutral-700">  {user.location?.country} ({user.location?.currencycode})</p>
                            </div>
                            <hr className='w-full border border-neutral-100 my-2' />
                            <button
                                onClick={handleSignOut}
                                className="block w-full text-left p-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                                Sign Out
                            </button>
                        </div>}
                        {!user && (
                            <div className="pt-4 space-y-2">
                                <Link
                                    href="/signin"
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/signup"
                                    className="block px-3 py-2 rounded-md text-base font-medium bg-teal-500 text-white hover:bg-teal-600"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
