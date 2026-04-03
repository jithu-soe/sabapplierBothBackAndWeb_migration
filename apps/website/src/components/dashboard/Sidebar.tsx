"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { ActivitySummary, DashboardTab, UserProfile } from '@/lib/types';
import { getCreditOverview } from '@/lib/credit-plans';
import { LogOut, Home, FileText, Share2, User, Menu, ChevronUp, Activity, Coins, ShieldCheck, MoreHorizontal, Bug, HelpCircle, Mail, Settings, Linkedin, Twitter, Slack, Instagram, Facebook, Youtube } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SettingsDialog } from './SettingsDialog';

interface SidebarProps {
  user: UserProfile;
  summary?: ActivitySummary | null;
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  onLogout: () => void;
  onDeleteAccount?: () => void;
  billingSyncState?: 'idle' | 'polling' | 'success' | 'error';
  billingSyncLabel?: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  summary,
  activeTab,
  setActiveTab,
  onLogout,
  onDeleteAccount,
  billingSyncState = 'idle',
  billingSyncLabel = null,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const userInitial = user.firstName?.[0] || user.fullName?.[0] || 'U';
  const creditOverview = getCreditOverview(user, summary);
  const creditBadgeLabel =
    creditOverview.plan === 'monthly_100'
      ? `${creditOverview.includedRemainingCredits.toFixed(1)} cycle left`
      : `${creditOverview.remainingCredits.toFixed(1)} credits`;

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [user.avatarUrl]);

  const tabs: Array<{
    key: DashboardTab;
    label: string;
    icon: React.ReactNode;
  }> = [
      { key: 'home', label: 'Home', icon: <Home className="w-6 h-6" /> },
      { key: 'documents', label: 'Vault', icon: <FileText className="w-6 h-6" /> },
      { key: 'sharing', label: 'Sharing', icon: <Share2 className="w-6 h-6" /> },
      { key: 'activity', label: 'My Activity', icon: <Activity className="w-6 h-6" /> },
      { key: 'profile', label: 'Profile', icon: <User className="w-6 h-6" /> },
    ];

  /* 
   * X.com style active/idle tab styles 
   */
  const NavItem = ({ tab, mobile = false }: { tab: typeof tabs[0], mobile?: boolean }) => {
    const active = activeTab === tab.key;
    return (
      <button
        onClick={() => {
          setActiveTab(tab.key);
          if (mobile) setIsMobileMenuOpen(false);
        }}
        className={`flex items-center gap-4 py-3 px-4 w-full rounded-full transition-all font-[500] 
          ${active ? 'font-[700] text-white bg-blue-600 shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'} 
          ${mobile ? 'text-lg' : 'text-xl'}`}
      >
        <div className={`transition-transform ${active ? 'scale-105' : ''}`}>
          {tab.icon}
        </div>
        <span className="tracking-tight">{tab.label}</span>
      </button>
    );
  };

  const UserProfileDropdown = ({ isMobile = false }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`flex items-center justify-between w-full p-2.5 rounded-full hover:bg-slate-100 transition-colors ${isMobile ? '' : 'border border-transparent hover:border-slate-200'
            }`}
          title="Account options"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold overflow-hidden shrink-0 border border-slate-300">
              {user.avatarUrl && !avatarLoadFailed ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                  onError={() => setAvatarLoadFailed(true)}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-slate-600">{userInitial}</span>
              )}
            </div>
            <div className="text-left hidden lg:block overflow-hidden">
              <div className="text-sm font-bold text-slate-900 truncate">{user.fullName}</div>
              <div className="text-xs text-slate-500 truncate">
                {user.email || 'Identity User'}
              </div>
            </div>
          </div>
          <ChevronUp className="w-5 h-5 text-slate-400 hidden lg:block mr-1" />
        </button>
      </DropdownMenuTrigger>
      {/* Dropdown renders upwards on desktop */}
      <DropdownMenuContent align="start" alignOffset={-16} side="top" sideOffset={12} className="w-[280px] rounded-[2rem] shadow-2xl border-slate-100 p-2 overflow-hidden bg-white/95 backdrop-blur-sm">
        <DropdownMenuItem
          className="p-3.5 font-bold text-slate-800 rounded-2xl cursor-pointer hover:bg-slate-100/80 transition-colors"
          onClick={() => {
            setActiveTab('profile');
            if (isMobile) setIsMobileMenuOpen(false);
          }}
        >
          <User className="w-5 h-5 mr-3 text-slate-400" />
          View Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1.5 bg-slate-100" />
        <DropdownMenuItem
          className="p-3.5 font-bold text-rose-600 focus:bg-rose-50 rounded-2xl cursor-pointer focus:text-rose-700 hover:bg-rose-50/80 transition-colors"
          onClick={onLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Log out @{user.firstName || 'user'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const MoreMenu = ({ isMobile = false }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`flex items-center gap-4 py-3 px-4 w-full rounded-full transition-all font-[500] text-slate-600 hover:bg-slate-100 hover:text-slate-900 text-xl`}
        >
          <div className="transition-transform">
            <Settings className="w-6 h-6" />
          </div>
          <span className="tracking-tight">More</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        alignOffset={-16}
        side="top"
        sideOffset={12}
        className="w-[280px] rounded-[2.2rem] shadow-2xl border-slate-100 p-3 overflow-hidden bg-white/95 backdrop-blur-sm z-50"
      >
        {/* Social Links Row */}
        <div className="px-3 pt-3 pb-2">
          <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 px-1">Follow Us</div>
          <div className="flex items-center justify-start gap-4">
            {[
              { icon: <Youtube className="w-5 h-5" />, href: "https://www.youtube.com/@sabapplier", color: "hover:bg-red-50 hover:text-red-600" },
              { icon: <Instagram className="w-5 h-5" />, href: "https://www.instagram.com/sabapplier?igsh=MWRwZW9qZ294dmhrdw%3D%3D", color: "hover:bg-pink-50 hover:text-pink-600" },
              { icon: <Linkedin className="w-5 h-5" />, href: "https://www.linkedin.com/company/sabapplier?trk=blended-typeahead", color: "hover:bg-blue-50 hover:text-blue-600" },
            ].map((social, idx) => (
              <a
                key={idx}
                href={social.href}
                target="_blank"
                className={`w-11 h-11 rounded-2xl flex items-center justify-center text-slate-400 transition-all active:scale-95 ${social.color}`}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        <DropdownMenuSeparator className="my-2 bg-slate-100" />

        {/* Support Section */}
        <div className="space-y-1">
          <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest py-2 px-4">Support</DropdownMenuLabel>
          <DropdownMenuItem asChild className="p-3.5 font-bold text-slate-800 rounded-2xl cursor-pointer hover:bg-slate-100/80 transition-colors">
            <a href="https://forms.gle/TCpW3xCkZt6CmUWZ7" target="_blank" rel="noopener noreferrer">
              <Bug className="w-5 h-5 mr-3 text-slate-400" />
              Report Issue
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="p-3.5 font-bold text-slate-800 rounded-2xl cursor-pointer hover:bg-slate-100/80 transition-colors">
            <a href="https://forms.gle/xWbT33jyCftkirBKA" target="_blank" rel="noopener noreferrer">
              <HelpCircle className="w-5 h-5 mr-3 text-slate-400" />
              Get Help
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="p-3.5 font-bold text-slate-800 rounded-2xl cursor-pointer hover:bg-slate-100/80 transition-colors">
            <a href="https://forms.gle/PMhxLy2VKQ9pNxH69" target="_blank" rel="noopener noreferrer">
              <Mail className="w-5 h-5 mr-3 text-slate-400" />
              Contact Us
            </a>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="my-2 bg-slate-100" />

        {/* Settings Button */}
        <DropdownMenuItem
          className="p-3.5 font-black text-slate-900 rounded-2xl cursor-pointer hover:bg-blue-50 transition-colors group"
          onClick={() => setIsSettingsOpen(true)}
        >
          <Settings className="w-5 h-5 mr-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
          Settings
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      {/* ======================= */}
      {/* DESKTOP SIDEBAR (X.com) */}
      {/* ======================= */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-[280px] bg-white border-r border-slate-200 z-40 overflow-y-auto">
        <div className="h-full flex flex-col p-4">

          {/* Logo Brand */}
          <div className="px-3 mb-6 mt-2">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-slate-100 flex-shrink-0">
                <Image
                  src="/logo.jpeg"
                  alt="SabApplier AI"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <div className="text-xl font-black text-slate-900 tracking-tight leading-none pt-1 uppercase">SabApplier</div>
                <div className="text-[10px] text-[#2F56C0] font-bold tracking-widest uppercase mt-0.5">Identity Vault</div>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1 flex-1">
            {tabs.map((tab) => (
              <NavItem key={tab.key} tab={tab} />
            ))}


          </nav>



          {/* More Menu */}
          <div className="mt-2">
            <MoreMenu />
          </div>

          {/* User Profile Footer */}
          <div className="mt-1">
            <UserProfileDropdown />
          </div>
        </div>

        <SettingsDialog
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          onDeleteAccount={onDeleteAccount || (() => { })}
        />
      </aside>

      {/* ======================= */}
      {/* MOBILE TOPBAR & DRAWER  */}
      {/* ======================= */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-16 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-4">
        {/* Mobile Logo */}
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden shadow-sm border border-slate-100">
            <Image src="/logo.jpeg" alt="Logo" fill className="object-cover" />
          </div>
          <div className="text-lg font-black text-slate-900 tracking-tight leading-none">SabApplier</div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Credit Quick View */}
          <div className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold ${creditOverview.isExhausted
            ? 'bg-rose-100 text-rose-700'
            : 'bg-slate-100 text-slate-700'
            }`}>
            <Coins className="h-3.5 w-3.5" />
            <span className="max-w-[80px] truncate">{creditOverview.remainingCredits}</span>
          </div>

          {/* Mobile Menu Trigger */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <button
                className="w-10 h-10 hover:bg-slate-100 rounded-full flex items-center justify-center transition-colors text-slate-700"
                aria-label="Open navigation menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-white px-4 border-slate-200 w-[280px] p-0 flex flex-col">
              <SheetHeader className="p-6 border-b border-slate-100 text-left">
                <SheetTitle className="text-xl font-bold text-slate-900">Menu</SheetTitle>
                <SheetDescription className="text-slate-500">
                  Navigate through your vault.
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                {tabs.map((tab) => (
                  <NavItem key={`mobile-${tab.key}`} tab={tab} mobile />
                ))}
              </div>

              <div className="p-4 border-t border-slate-100">
                <UserProfileDropdown isMobile />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
};
