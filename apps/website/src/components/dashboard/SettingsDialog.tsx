"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Trash2, ShieldCheck, ExternalLink } from 'lucide-react';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteAccount: () => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  onOpenChange,
  onDeleteAccount,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 rounded-[2.2rem] border-none shadow-2xl overflow-hidden focus:outline-none">
        <DialogHeader className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight">Settings</DialogTitle>
            <DialogDescription className="text-slate-500 font-bold text-sm">
              Manage your account preferences and data security.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-8 pt-6">
          {/* Privacy Section */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Legal & Privacy</h4>
            <a 
              href="/privacy-policy" 
              target="_blank" 
              className="flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-300 group shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">Privacy Policy</div>
                  <div className="text-xs text-slate-500 font-medium">Read our data protection terms</div>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-all" />
            </a>
          </div>

          {/* Danger Zone */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase text-rose-400 tracking-widest px-1">Danger Zone</h4>
            <div className="p-6 rounded-[1.8rem] bg-rose-50/50 border border-rose-100 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <div className="font-extrabold text-rose-900">Deactivate Account</div>
                  <p className="text-xs text-rose-700/80 leading-relaxed font-semibold">
                    Your account will be permanently deleted after 60 days of inactivity. 
                    You can cancel this by logging in within 60 days.
                  </p>
                </div>
              </div>
              
              <Button
                variant="destructive"
                className="w-full h-14 rounded-2xl font-black text-sm bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-200 transition-all active:scale-[0.98] uppercase tracking-wider"
                onClick={() => {
                  const confirmed = window.confirm('Are you absolutely sure you want to deactivate your account? Your data will be permanently deleted after 60 days of inactivity.');
                  if (confirmed) {
                    onDeleteAccount();
                    onOpenChange(false);
                  }
                }}
              >
                Deactivate Now
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
