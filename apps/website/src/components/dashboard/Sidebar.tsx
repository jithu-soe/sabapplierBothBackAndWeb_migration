"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { ActivitySummary, DashboardTab, UserProfile } from '@/lib/types';
import { getCreditOverview } from '@/lib/credit-plans';
import { LogOut, Home, FileText, Share2, User, Menu, ChevronUp, Activity, Coins, ShieldCheck } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface SidebarProps {
  user: UserProfile;
  summary?: ActivitySummary | null;
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  onLogout: () => void;
  billingSyncState?: 'idle' | 'polling' | 'success' | 'error';
  billingSyncLabel?: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  summary,
  activeTab,
  setActiveTab,
  onLogout,
  billingSyncState = 'idle',
  billingSyncLabel = null,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      { key: 'activity', label: 'My Activity', icon: <Activity className="w-6 h-6" /> },
      { key: 'documents', label: 'Vault', icon: <FileText className="w-6 h-6" /> },
      { key: 'sharing', label: 'Sharing', icon: <Share2 className="w-6 h-6" /> },
      { key: 'pricing', label: 'Pricing', icon: <Coins className="w-6 h-6" /> },
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
      <DropdownMenuContent align="start" side="top" sideOffset={12} className="w-[260px] rounded-2xl shadow-xl border-slate-200 p-2">
        <DropdownMenuItem
          className="p-3 font-semibold text-slate-800 rounded-xl cursor-pointer"
          onClick={() => {
            setActiveTab('profile');
            if (isMobile) setIsMobileMenuOpen(false);
          }}
        >
          <User className="w-5 h-5 mr-3" />
          View Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1 bg-slate-100" />
        <DropdownMenuItem
          className="p-3 font-semibold text-rose-600 focus:bg-rose-50 rounded-xl cursor-pointer focus:text-rose-700"
          onClick={onLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Log out @{user.firstName || 'user'}
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

            {/* Billing Status Badge embedded in menu rhythm */}
            <div className="mt-8 px-4">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Status</div>
              <div
                className={`flex items-center gap-2 rounded-xl p-3 text-sm font-semibold border ${creditOverview.isExhausted
                  ? 'border-rose-200 bg-rose-50 text-rose-700'
                  : creditOverview.isLow
                    ? 'border-amber-200 bg-amber-50 text-amber-800'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
              >
                <Coins className="h-5 w-5" />
                <span>{creditBadgeLabel}</span>
              </div>
              {billingSyncState !== 'idle' && billingSyncLabel && (
                <div
                  className={`mt-2 flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold border ${billingSyncState === 'error'
                    ? 'border-rose-200 bg-rose-50 text-rose-700'
                    : billingSyncState === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-slate-50 text-[#1f3f87]'
                    }`}
                >
                  <span>{billingSyncState === 'polling' ? 'Syncing...' : billingSyncLabel}</span>
                </div>
              )}
            </div>
          </nav>

          {/* Bottom App/Extension Call to Action */}
          <div className="mt-auto mb-4 px-2">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 p-4 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 font-bold text-blue-900 mb-1">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                AI Extension
              </div>
              <p className="text-xs text-blue-800/80 font-medium mb-3 leading-tight">
                Autofill applications using your secure vault.
              </p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold text-sm py-2 rounded-xl transition-all">
                Install Now
              </button>
            </div>
          </div>

          {/* User Profile Footer */}
          <div className="mt-2">
            <UserProfileDropdown />
          </div>
        </div>
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
