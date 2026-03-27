'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Menu, X, ChevronDown } from 'lucide-react';

interface LandingNavbarProps {
    onLogin: () => void;
    onSignup: () => void;
}

const LandingNavbar: React.FC<LandingNavbarProps> = ({ onLogin, onSignup }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isSupportOpen, setIsSupportOpen] = useState(false);
    const supportRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (supportRef.current && !supportRef.current.contains(event.target as Node)) {
                setIsSupportOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const scrollToSection = (sectionId: string) => {
        if (pathname !== '/') {
            router.push(`/#${sectionId}`);
            setIsMenuOpen(false);
            return;
        }

        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
        setIsMenuOpen(false);
    };

    return (
        <header
            className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled
                ? 'bg-gray-900/95 backdrop-blur-md shadow-lg py-2 border-b border-white/10'
                : 'bg-gray-900 py-2 border-b border-white/10'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 lg:px-6">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo Section */}
                    <Link href="/" className="flex items-center gap-3 group transition-all duration-300 hover:scale-105">
                        <div className="relative w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-lg border-2 border-[#c5d3f7]/60 group-hover:border-[#d4dfff]/80 transition-all duration-300 overflow-hidden">
                            <Image
                                src="/logo.jpeg"
                                alt="SabApplier AI"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="hidden sm:block">
                            <span className="text-xl md:text-2xl font-bold text-white tracking-tight">
                                SabApplier
                                <span className="text-[#d2ddff] ml-1 font-extrabold">AI</span>
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8 overflow-visible">
                        <button
                            onClick={() => scrollToSection('how-it-works')}
                            className="text-white/90 hover:text-[#d2ddff] font-medium transition-all duration-300 hover:scale-105 relative group"
                        >
                            How it Works
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#d2ddff] transition-all duration-300 group-hover:w-full"></span>
                        </button>
                        <button
                            onClick={() => scrollToSection('features')}
                            className="text-white/90 hover:text-[#d2ddff] font-medium transition-all duration-300 hover:scale-105 relative group"
                        >
                            Features
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#d2ddff] transition-all duration-300 group-hover:w-full"></span>
                        </button>
                        <button
                            onClick={() => scrollToSection('testimonials')}
                            className="text-white/90 hover:text-[#d2ddff] font-medium transition-all duration-300 hover:scale-105 relative group"
                        >
                            Reviews
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#d2ddff] transition-all duration-300 group-hover:w-full"></span>
                        </button>
                        {/* Support Dropdown */}
                        <div className="relative" ref={supportRef}>
                            <button
                                onClick={() => setIsSupportOpen(!isSupportOpen)}
                                className="flex items-center gap-1 text-white/90 hover:text-[#d2ddff] font-medium transition-all duration-300 hover:scale-105 relative group"
                            >
                                Support
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSupportOpen ? 'rotate-180' : ''}`} />
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#d2ddff] transition-all duration-300 group-hover:w-full"></span>
                            </button>
                            {isSupportOpen && (
                                <div className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 z-[9999]" style={{filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))'}}>
                                    {/* Caret */}
                                    <div className="flex justify-center mb-0">
                                        <div className="w-3 h-3 bg-[#1a2540] border-t border-l border-white/20 rotate-45 translate-y-1/2 relative z-10"></div>
                                    </div>
                                    {/* Panel */}
                                    <div className="w-64 bg-[#1a2540] border border-white/15 rounded-2xl overflow-hidden">
                                        {/* Header label */}
                                        <div className="px-4 pt-3 pb-2">
                                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">Support Center</p>
                                        </div>
                                        <div className="border-t border-white/8 mx-3"></div>
                                        {/* Items */}
                                        <div className="p-2 space-y-0.5">
                                            {/* Contact Us */}
                                            <a
                                                href="https://forms.gle/PMhxLy2VKQ9pNxH69"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={() => setIsSupportOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#2F56C0]/30 group/item transition-all duration-200"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-400/25 flex items-center justify-center flex-shrink-0 group-hover/item:bg-blue-500/25 group-hover/item:border-blue-400/40 transition-all duration-200">
                                                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-white/85 group-hover/item:text-white transition-colors leading-tight">Contact Us</p>
                                                    <p className="text-[11px] text-white/35 group-hover/item:text-white/55 transition-colors mt-0.5">Send us a message</p>
                                                </div>
                                                <svg className="w-3.5 h-3.5 text-white/20 group-hover/item:text-[#d2ddff]/60 flex-shrink-0 transition-all duration-200 group-hover/item:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </a>
                                            {/* Get Help */}
                                            <a
                                                href="https://forms.gle/xWbT33jyCftkirBKA"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={() => setIsSupportOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-900/20 group/item transition-all duration-200"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-400/25 flex items-center justify-center flex-shrink-0 group-hover/item:bg-emerald-500/25 group-hover/item:border-emerald-400/40 transition-all duration-200">
                                                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-white/85 group-hover/item:text-white transition-colors leading-tight">Get Help</p>
                                                    <p className="text-[11px] text-white/35 group-hover/item:text-white/55 transition-colors mt-0.5">Browse FAQs &amp; guides</p>
                                                </div>
                                                <svg className="w-3.5 h-3.5 text-white/20 group-hover/item:text-emerald-400/60 flex-shrink-0 transition-all duration-200 group-hover/item:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </a>
                                            {/* Report Issue */}
                                            <a
                                                href="https://forms.gle/TCpW3xCkZt6CmUWZ7"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={() => setIsSupportOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-900/20 group/item transition-all duration-200"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-400/25 flex items-center justify-center flex-shrink-0 group-hover/item:bg-rose-500/25 group-hover/item:border-rose-400/40 transition-all duration-200">
                                                    <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-white/85 group-hover/item:text-white transition-colors leading-tight">Report Issue</p>
                                                    <p className="text-[11px] text-white/35 group-hover/item:text-white/55 transition-colors mt-0.5">Tell us what went wrong</p>
                                                </div>
                                                <svg className="w-3.5 h-3.5 text-white/20 group-hover/item:text-rose-400/60 flex-shrink-0 transition-all duration-200 group-hover/item:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </a>
                                        </div>
                                        <div className="h-2"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </nav>

                    {/* Desktop CTA Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        <button
                            onClick={onLogin}
                            className="px-5 py-2.5 text-white border border-white/30 rounded-lg font-semibold text-sm transition-all duration-300 hover:bg-white/10 hover:border-[#d2ddff]/60 hover:shadow-md backdrop-blur-sm"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={onSignup}
                            className="px-6 py-2.5 bg-gradient-to-r from-[#3f67d1] to-[#2F56C0] text-white rounded-lg font-semibold text-sm transition-all duration-300 hover:from-[#345fcf] hover:to-[#284aa8] hover:scale-105 hover:shadow-lg hover:shadow-[#2F56C0]/30 border border-[#7b98de]/40"
                        >
                            Get Started Free
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="fixed top-20 right-4 w-64 bg-[#2F56C0]/95 border border-white/15 shadow-xl backdrop-blur-md rounded-2xl z-50 overflow-hidden transform origin-top-right transition-all duration-300">
                        <div className="px-4 py-6 space-y-4">
                            <button
                                onClick={() => scrollToSection('features')}
                                className="block text-white/90 hover:text-[#d2ddff] font-medium py-2 transition-colors duration-300 w-full text-left"
                            >
                                Features
                            </button>
                            <button
                                onClick={() => scrollToSection('how-it-works')}
                                className="block text-white/90 hover:text-[#d2ddff] font-medium py-2 transition-colors duration-300 w-full text-left"
                            >
                                How it Works
                            </button>
                            <button
                                onClick={() => scrollToSection('testimonials')}
                                className="block text-white/90 hover:text-[#d2ddff] font-medium py-2 transition-colors duration-300 w-full text-left"
                            >
                                Reviews
                            </button>
                            {/* Mobile Support Links */}
                            <div className="border-t border-white/10 pt-2">
                                <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Support</p>
                                <a
                                    href="https://forms.gle/PMhxLy2VKQ9pNxH69"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block text-white/80 hover:text-[#d2ddff] py-2 text-sm transition-colors duration-200"
                                >
                                    📬 Contact Us
                                </a>
                                <a
                                    href="https://forms.gle/xWbT33jyCftkirBKA"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block text-white/80 hover:text-[#d2ddff] py-2 text-sm transition-colors duration-200"
                                >
                                    🙋 Get Help
                                </a>
                                <a
                                    href="https://forms.gle/TCpW3xCkZt6CmUWZ7"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block text-white/80 hover:text-[#d2ddff] py-2 text-sm transition-colors duration-200"
                                >
                                    🚩 Report Issue
                                </a>
                            </div>

                            <div className="pt-4 border-t border-white/10 space-y-3">
                                <button
                                    onClick={() => { setIsMenuOpen(false); onLogin(); }}
                                    className="block w-full text-center px-4 py-3 text-white border border-white/30 rounded-lg font-semibold text-sm transition-all duration-300 hover:bg-white/10"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => { setIsMenuOpen(false); onSignup(); }}
                                    className="block w-full text-center px-4 py-3 bg-gradient-to-r from-[#3f67d1] to-[#2F56C0] text-white rounded-lg font-semibold text-sm transition-all duration-300 hover:from-[#345fcf] hover:to-[#284aa8]"
                                >
                                    Get Started Free
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default LandingNavbar;
