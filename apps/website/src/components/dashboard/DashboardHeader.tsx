"use client";

import React from 'react';
import { Coins, HelpCircle, Sparkles } from 'lucide-react';
import { DashboardTab, UserProfile, ActivitySummary } from '@/lib/types';
import { getCreditOverview } from '@/lib/credit-plans';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  user: UserProfile;
  summary?: ActivitySummary | null;
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  summary,
  activeTab,
  setActiveTab,
}) => {
  const creditOverview = getCreditOverview(user, summary);

  // Format the label based on the plan type
  const creditBadgeLabel =
    creditOverview.plan === 'monthly_100'
      ? `${creditOverview.includedRemainingCredits.toFixed(1)} credits left`
      : `${creditOverview.remainingCredits.toFixed(1)} credits left`;

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[280px] h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-30 flex items-center justify-between px-6 lg:px-10 transition-all duration-300">
      {/* Left side: Empty placeholder to maintain justify-between layout if needed */}
      <div />

      {/* Right side: Credits and Pricing */}
      <div className="flex items-center gap-6">
        {/* Credits Status */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full hover:bg-slate-50 transition-colors cursor-default">
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-50 text-blue-600">
            <Coins className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-medium text-slate-600">
            <span className="font-bold text-slate-900">{creditBadgeLabel.split(' ')[0]}</span>
            {" "}credits left
          </span>
          <HelpCircle className="w-4 h-4 text-slate-300 hover:text-slate-400 cursor-help" />
        </div>

        {/* Upgrade/Pricing Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setActiveTab('pricing')}
          className={`h-9 px-4 rounded-full font-bold transition-all duration-200 
            ${activeTab === 'pricing'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'text-blue-600 border-blue-100 hover:bg-blue-50 hover:border-blue-200'
            }`}
        >
          <Sparkles className="w-3.5 h-3.5 mr-2" />
          Upgrade
        </Button>
      </div>
    </header>
  );
};
