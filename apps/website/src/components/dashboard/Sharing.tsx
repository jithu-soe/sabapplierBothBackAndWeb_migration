"use client";

import React, { useState, useEffect } from 'react';
import { UserProfile } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Send, Inbox, History as HistoryIcon, ShieldCheck, User, Eye,
  Download, Clock, CheckCircle2, ChevronRight, FileText, ArrowLeft, Mail, AlertCircle, Edit, FileEdit,
  Search, Filter, ChevronLeft
} from 'lucide-react';

interface SharingProps {
  user: UserProfile;
}

type TabType = 'send' | 'received' | 'history';

interface ShareRecord {
  id: string;
  senderName: string;
  senderEmail: string;
  recipientEmail: string;
  documents: string[];
  sharedAt: number;
  status: 'sent' | 'viewed' | 'opened';
  direction: 'incoming' | 'outgoing';
  accessLevel?: 'view' | 'download' | 'edit';
}

const STORAGE_KEY = 'sabapplier_mock_shares';

export const Sharing: React.FC<SharingProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<TabType>('send');
  const [shares, setShares] = useState<ShareRecord[]>([]);

  // Send Flow State
  const [sendStep, setSendStep] = useState(1);
  const [targetEmail, setTargetEmail] = useState('');
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [accessLevel, setAccessLevel] = useState<'view' | 'download' | 'edit'>('view');

  // History Flow State
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const [historyPage, setHistoryPage] = useState(1);
  const HISTORY_ITEMS_PER_PAGE = 5;

  // Received Flow State
  const [selectedIncomingShare, setSelectedIncomingShare] = useState<ShareRecord | null>(null);

  // Initialize Mock Data
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setShares(JSON.parse(stored));
    } else {
      // Seed some initial data for demo
      const initialShares: ShareRecord[] = [
        {
          id: '1',
          senderName: 'Anirudh Pal',
          senderEmail: 'palanirudh82995@gmail.com',
          recipientEmail: user.email,
          documents: ['Aadhaar Card', 'Resume'],
          sharedAt: Date.now() - 1000 * 60 * 5, // 5 mins ago
          status: 'sent',
          direction: 'incoming',
          accessLevel: 'download'
        },
        {
          id: '2',
          senderName: 'Y Combinator Admissions',
          senderEmail: 'apply@ycombinator.com',
          recipientEmail: user.email,
          documents: ['Pitch Deck', 'Incorporation Certificate'],
          sharedAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
          status: 'viewed',
          direction: 'incoming',
          accessLevel: 'view'
        },
        {
          id: '3',
          senderName: user.fullName || "SabApplier User",
          senderEmail: user.email,
          recipientEmail: 'hr@google.com',
          documents: ['Resume', 'Cover Letter'],
          sharedAt: Date.now() - 1000 * 60 * 60 * 48, // 2 days ago
          status: 'viewed',
          direction: 'outgoing',
          accessLevel: 'download'
        },
        {
          id: '4',
          senderName: user.fullName || "SabApplier User",
          senderEmail: user.email,
          recipientEmail: 'kyc@binance.com',
          documents: ['PAN Card', 'Bank Statement', 'Aadhaar Card'],
          sharedAt: Date.now() - 1000 * 60 * 60 * 72, // 3 days ago
          status: 'sent',
          direction: 'outgoing',
          accessLevel: 'view'
        }
      ];
      setShares(initialShares);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialShares));
    }
  }, [user.email]);

  const saveShare = (record: ShareRecord) => {
    const updated = [record, ...shares];
    setShares(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      const newShare: ShareRecord = {
        id: Math.random().toString(36).substring(7),
        senderName: user.fullName || `${user.firstName} ${user.lastName}` || "SabApplier User",
        senderEmail: user.email,
        recipientEmail: targetEmail,
        documents: selectedDocs,
        sharedAt: Date.now(),
        status: 'sent',
        direction: 'outgoing',
        accessLevel: accessLevel,
      };
      saveShare(newShare);
      setIsSending(false);
      setSendSuccess(true);
    }, 1500);
  };

  const resetSendFlow = () => {
    setSendStep(1);
    setTargetEmail('');
    setSelectedDocs([]);
    setSendSuccess(false);
  };

  // Build the available documents list from user Vault (or mock if empty)
  const availableDocs = Object.keys(user.documents || {}).length > 0
    ? Object.keys(user.documents).filter(key => user.documents[key].fileUrl)
    : ['Aadhaar Card', 'PAN Card', 'Resume', 'Degree Certificate'];

  const handleDocToggle = (docName: string) => {
    setSelectedDocs(prev =>
      prev.includes(docName) ? prev.filter(d => d !== docName) : [...prev, docName]
    );
  };

  const updateShareStatus = (id: string, newStatus: ShareRecord['status']) => {
    const updated = shares.map(s => s.id === id ? { ...s, status: newStatus } : s);
    setShares(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // Calculated History Data (Fuzzy Search + Filtering + Pagination)
  const filteredHistory = shares.filter(record => {
    // Direction Filter
    if (historyFilter !== 'all' && record.direction !== historyFilter) return false;

    // Fuzzy Search mapping (sender or recipient email/name)
    if (historySearchQuery.trim()) {
      const q = historySearchQuery.toLowerCase();
      const targetName = record.direction === 'incoming' ? record.senderName.toLowerCase() : record.recipientEmail.toLowerCase();
      const targetEmail = record.direction === 'incoming' ? record.senderEmail.toLowerCase() : record.recipientEmail.toLowerCase();

      if (!targetName.includes(q) && !targetEmail.includes(q)) return false;
    }
    return true;
  });

  const totalHistoryPages = Math.max(1, Math.ceil(filteredHistory.length / HISTORY_ITEMS_PER_PAGE));
  const paginatedHistory = filteredHistory.slice((historyPage - 1) * HISTORY_ITEMS_PER_PAGE, historyPage * HISTORY_ITEMS_PER_PAGE);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header & Tabs Control - Precision Canvas Style */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {activeTab === 'send' && 'Send Data'}
            {activeTab === 'received' && 'Active User Files'}
            {activeTab === 'history' && 'Activity History'}
          </h1>
          <p className="text-slate-500 font-medium mt-2 max-w-xl leading-relaxed">
            {activeTab === 'send' && 'Securely fulfill data sharing protocols without OTPs using our verified Vault-to-Wallet trust mechanism.'}
            {activeTab === 'received' && 'Review incoming data streams & access the identity vault for your active user connections.'}
            {activeTab === 'history' && 'Track securely transmitted and received document payloads, monitoring access levels and statuses.'}
          </p>
        </div>

        {/* Segmented Control Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner self-start flex-shrink-0">
          <button
            onClick={() => { setActiveTab('send'); setSelectedIncomingShare(null); }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'send' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            <Send className="w-4 h-4" /> Send Data
          </button>
          <button
            onClick={() => setActiveTab('received')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'received' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            <Inbox className="w-4 h-4" /> Received
            {shares.filter(s => s.direction === 'incoming' && s.status === 'sent').length > 0 && (
              <span className={`w-2 h-2 rounded-full ml-1 ${activeTab === 'received' ? 'bg-white' : 'bg-rose-500'}`} />
            )}
          </button>
          <button
            onClick={() => { setActiveTab('history'); setSelectedIncomingShare(null); }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            <HistoryIcon className="w-4 h-4" /> History
          </button>
        </div>
      </div>

      {/* =========================================
          TAB 1: SEND DATA FLOW
          ========================================= */}
      {activeTab === 'send' && (
        <div className="w-full max-w-6xl mx-auto mt-2">
          {!sendSuccess ? (
            <Card className="overflow-hidden border-slate-200 shadow-xl shadow-slate-200/50 rounded-[2rem] bg-white p-6 md:px-8 md:py-6">

              <div className="flex flex-col mb-6 pb-4 border-b border-slate-100">
                <h2 className="text-2xl font-black text-slate-900">Share Your Data</h2>
                <p className="text-slate-500 text-sm mt-1">Configure your secure data payload and send it instantly.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* COLUMN 1: Config */}
                <div className="space-y-6">
                  {/* 1. Recipient */}
                  <div className="space-y-2.5">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs text-center">1</span>
                      Recipient
                    </h3>
                    <div className="relative">
                      <Mail className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                      <Input
                        placeholder="recipient@example.com"
                        className="pl-11 h-12 rounded-xl text-base bg-slate-50 border-slate-200 focus:bg-white focus:ring-blue-500 transition-all text-slate-900 shadow-sm"
                        value={targetEmail}
                        onChange={(e) => setTargetEmail(e.target.value)}
                        type="email"
                      />
                    </div>
                  </div>

                  {/* 2. Basic Details Payload */}
                  <div className="space-y-2.5">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs text-center">2</span>
                      Identity Payload
                    </h3>
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 relative overflow-hidden group hover:border-blue-200 transition-colors">
                      <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-100 rounded-full blur-2xl opacity-50 group-hover:bg-blue-200 transition-all" />
                      <div className="flex items-start gap-4 relative z-10">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0 border border-slate-100">
                          <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-base tracking-tight">Verified Profile Included</h4>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            Name, Email, Date of Birth, Phone, and Address will be securely attached to this transmission.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Access Level */}
                  <div className="pt-2">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900 mb-3 ml-1">
                      ACCESS LEVEL
                    </h3>
                    <div className="flex gap-2">
                      <button
                        className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl border-2 transition-all ${accessLevel === 'view' ? 'border-blue-600 bg-white shadow-sm ring-1 ring-blue-600' : 'border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200'}`}
                        onClick={() => setAccessLevel('view')}
                      >
                        <Eye strokeWidth={2.5} className={`w-4 h-4 mb-1.5 ${accessLevel === 'view' ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-wider ${accessLevel === 'view' ? 'text-blue-700' : 'text-slate-500'}`}>View</span>
                      </button>
                      <button
                        className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl border-2 transition-all ${accessLevel === 'download' ? 'border-blue-600 bg-white shadow-sm ring-1 ring-blue-600' : 'border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200'}`}
                        onClick={() => setAccessLevel('download')}
                      >
                        <Download strokeWidth={2.5} className={`w-4 h-4 mb-1.5 ${accessLevel === 'download' ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-wider ${accessLevel === 'download' ? 'text-blue-700' : 'text-slate-500'}`}>Download</span>
                      </button>
                      <button
                        className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl border-2 transition-all ${accessLevel === 'edit' ? 'border-blue-600 bg-white shadow-sm ring-1 ring-blue-600' : 'border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200'}`}
                        onClick={() => setAccessLevel('edit')}
                      >
                        <Edit strokeWidth={2.5} className={`w-4 h-4 mb-1.5 ${accessLevel === 'edit' ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-wider ${accessLevel === 'edit' ? 'text-blue-700' : 'text-slate-500'}`}>Edit</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* COLUMN 2: Documents & Submission */}
                <div className="flex flex-col h-full">
                  {/* 3. Documents */}
                  <div className="space-y-2.5 flex-1">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs text-center">3</span>
                      Vault Documents (Optional)
                    </h3>

                    {/* Increased height to fit at least 4 documents (approx ~50px each) */}
                    <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-2 h-[260px] relative">
                      {/* Fade overlay at bottom of scroll area for polish */}
                      <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-slate-50 pointer-events-none z-10 rounded-b-2xl" />
                      <ScrollArea className="h-full px-1 pb-2">
                        <div className="grid grid-cols-1 gap-2 pt-1">
                          {availableDocs.map(doc => (
                            <Label
                              key={doc}
                              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedDocs.includes(doc)
                                  ? 'bg-white border-blue-500 shadow-[0_2px_8px_rgba(59,130,246,0.15)] ring-1 ring-blue-500'
                                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md hover:-translate-y-[1px]'
                                }`}
                            >
                              <Checkbox
                                checked={selectedDocs.includes(doc)}
                                onCheckedChange={() => handleDocToggle(doc)}
                                className="w-4 h-4 rounded-md border-slate-300 data-[state=checked]:bg-blue-600"
                              />
                              <div className="flex items-center gap-2.5 flex-1 overflow-hidden">
                                <div className={`p-1.5 rounded-md flex-shrink-0 transition-colors ${selectedDocs.includes(doc) ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                                  <FileText className="w-3.5 h-3.5" />
                                </div>
                                <span className={`font-bold text-sm truncate transition-colors ${selectedDocs.includes(doc) ? 'text-blue-900' : 'text-slate-700'}`}>
                                  {doc}
                                </span>
                              </div>
                            </Label>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="pt-5 mt-2">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-start gap-3 mb-4">
                      <div className="bg-emerald-100 p-1.5 rounded-full flex-shrink-0">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      </div>
                      <p className="text-xs font-semibold text-emerald-900 leading-snug mt-1">
                        The receiver will be notified via email and access your data via SabApplier Vault protocol.
                      </p>
                    </div>

                    <Button
                      className="w-full h-12 rounded-xl font-black text-lg bg-blue-600 hover:bg-blue-700 shadow-[0_6px_16px_rgba(59,130,246,0.25)] hover:shadow-[0_8px_20px_rgba(59,130,246,0.35)] transition-all"
                      onClick={handleSend}
                      disabled={isSending || !targetEmail.includes('@')}
                    >
                      {isSending ? 'Transmitting Securely...' : 'Share Securely'}
                      {!isSending && <Send className="w-4 h-4 ml-2" />}
                    </Button>
                  </div>
                </div>
              </div>

            </Card>
          ) : (
            /* SUCCESS STATE */
            <div className="py-20 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-100/50 relative">
                <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20" />
                <CheckCircle2 className="w-12 h-12 text-emerald-600 relative z-10" />
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-4">Data Shared Successfully</h2>
              <p className="text-lg text-slate-600 max-w-md mx-auto mb-10 leading-relaxed">
                An encrypted notification token has been dispatched to <strong className="text-slate-900 break-all">{targetEmail}</strong>. They can access the payload via their vault dashboard.
              </p>
              <Button onClick={resetSendFlow} className="h-14 px-8 rounded-2xl font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/20 text-lg">
                Send Another File
              </Button>
            </div>
          )}
        </div>
      )}


      {/* =========================================
          TAB 2: RECEIVED DATA (TRUST UX)
          ========================================= */}
      {activeTab === 'received' && (
        <div className="mt-8">
          {!selectedIncomingShare ? (
            /* LIST VIEW */
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900">Active User Files</h2>
              </div>

              {shares.filter(s => s.direction === 'incoming').length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                  <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-500">No active files</h3>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {shares.filter(s => s.direction === 'incoming').map((record) => (
                    <Card
                      key={record.id}
                      className="p-6 rounded-[1.5rem] bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col group h-full"
                      onClick={() => {
                        setSelectedIncomingShare(record);
                        if (record.status === 'sent') updateShareStatus(record.id, 'opened');
                      }}
                    >
                      {/* Top Row: User Profile & Badge */}
                      <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-sm">
                            {record.senderName[0]}
                          </div>
                          <div>
                            <h3 className="font-black text-slate-900 text-base leading-tight tracking-tight">{record.senderName}</h3>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-wider">ID: #{record.id.substring(0, 4).toUpperCase()}-X</p>
                          </div>
                        </div>
                        <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${record.status === 'sent' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                          {record.status === 'sent' ? 'New' : 'Viewed'}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="space-y-4 mb-8 flex-1">
                        <div className="flex items-center gap-3 text-sm">
                          <span className="flex items-center gap-2 font-bold text-slate-500 w-32"><FileText className="w-4 h-4" /> Documents</span>
                          <span className="font-bold text-slate-900 ml-auto">{record.documents.length} Files</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="flex items-center gap-2 font-bold text-slate-500 w-32"><Clock className="w-4 h-4" /> Last Updated</span>
                          <span className="font-bold text-slate-900 ml-auto">{Math.round((Date.now() - record.sharedAt) / 60000)} mins ago</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-3 gap-2 mt-auto">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIncomingShare(record);
                            if (record.status === 'sent') updateShareStatus(record.id, 'opened');
                          }}
                          className="flex flex-col items-center justify-center py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-slate-600"
                        >
                          <Eye className="w-4 h-4 mb-1.5 opacity-70" />
                          <span className="text-[9px] font-black uppercase tracking-widest">View</span>
                        </button>
                        <button className="flex flex-col items-center justify-center py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-slate-600">
                          <Edit className="w-4 h-4 mb-1.5 opacity-70" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Edit</span>
                        </button>
                        <button className="flex flex-col items-center justify-center py-2.5 rounded-lg bg-[#0047FF] hover:bg-blue-700 transition-colors text-white shadow-[0_4px_12px_rgba(0,71,255,0.25)]">
                          <FileEdit className="w-4 h-4 mb-1.5" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Fill</span>
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* DETAIL VIEW (THE TRUST SCREEN) */
            <div className="animate-in slide-in-from-right-8 duration-500">
              <button
                onClick={() => setSelectedIncomingShare(null)}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-6 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" /> Back to List
              </button>

              <div className="max-w-4xl mx-auto space-y-6">

                {/* TRUST BANNER - MOST IMPORTANT */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-1 shadow-lg shadow-emerald-500/20">
                  <div className="bg-emerald-50 rounded-[1.35rem] p-4 flex items-center justify-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center border border-emerald-200">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="font-black text-emerald-800 text-lg uppercase tracking-widest">Shared via Sabapplier Identity Vault</span>
                  </div>
                </div>

                {/* SENDER IDENTITY */}
                <Card className="p-8 rounded-3xl border-slate-200 shadow-md">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-black text-blue-700 shadow-inner">
                      {selectedIncomingShare.senderName[0]}
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedIncomingShare.senderName}</h2>
                      <div className="flex items-center gap-2 text-slate-500 font-medium mt-1">
                        <Mail className="w-4 h-4" /> {selectedIncomingShare.senderEmail}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* PAYLOAD GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Details Box */}
                  <Card className="p-6 rounded-3xl border-slate-200 shadow-sm bg-blue-50/30">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                      <User className="w-4 h-4 text-blue-500" /> Essential ID Record
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200/50 pb-3">
                        <span className="text-sm text-slate-500 font-bold">Full Name</span>
                        <span className="font-black text-slate-900">{selectedIncomingShare.senderName}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-200/50 pb-3">
                        <span className="text-sm text-slate-500 font-bold">Email Address</span>
                        <span className="font-bold text-slate-900">{selectedIncomingShare.senderEmail}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-200/50 pb-3">
                        <span className="text-sm text-slate-500 font-bold">Phone Number</span>
                        <span className="font-bold text-slate-900">+91 ***** ****</span>
                      </div>
                      <div className="flex items-center justify-between pb-1">
                        <span className="text-sm text-slate-500 font-bold">Verification</span>
                        <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-100">
                          System Verified
                        </Badge>
                      </div>
                    </div>
                  </Card>

                  {/* Documents Vault */}
                  <Card className="p-6 rounded-3xl border-slate-200 shadow-sm">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                      <FileText className="w-4 h-4 text-slate-500" /> Vault Documents
                    </h3>
                    <div className="space-y-3">
                      {selectedIncomingShare.documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50 group hover:border-slate-300 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100">
                              <FileText className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                            </div>
                            <span className="font-bold text-slate-800">{doc}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-slate-400 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 shadow-sm transition-all" title="Preview">
                              <Eye className="w-5 h-5" />
                            </Button>
                            <Button size="icon" className="h-10 w-10 text-white rounded-full bg-blue-600 hover:bg-blue-700 shadow-md transition-all" title="Download secure copy">
                              <Download className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {selectedIncomingShare.documents.length === 0 && (
                        <p className="text-slate-500 text-sm italic text-center py-6">No extra documents attached.</p>
                      )}
                    </div>
                  </Card>
                </div>

              </div>
            </div>
          )}
        </div>
      )}


      {/* =========================================
          TAB 3: HISTORY (OUTGOING SHARES)
          ========================================= */}
      {activeTab === 'history' && (
        <div className="mt-8 space-y-6 max-w-6xl mx-auto animate-in fade-in zoom-in-95 duration-300">
          {/* History Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
              <Input
                placeholder="Search names or emails..."
                className="pl-11 h-12 rounded-xl bg-white border-slate-200 focus:bg-white focus:ring-blue-500 shadow-sm transition-all text-slate-900"
                value={historySearchQuery}
                onChange={(e) => { setHistorySearchQuery(e.target.value); setHistoryPage(1); }}
              />
            </div>

            {/* Filter Checkboxes / Segment Control */}
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <button
                onClick={() => { setHistoryFilter('all'); setHistoryPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${historyFilter === 'all' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >All</button>
              <button
                onClick={() => { setHistoryFilter('outgoing'); setHistoryPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${historyFilter === 'outgoing' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
              >Sent</button>
              <button
                onClick={() => { setHistoryFilter('incoming'); setHistoryPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${historyFilter === 'incoming' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
              >Received</button>
            </div>
          </div>

          <Card className="overflow-hidden border-slate-200 shadow-sm rounded-[1.5rem] bg-white">
            {paginatedHistory.length === 0 ? (
              <div className="py-24 text-center">
                <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">No history found</h3>
                <p className="text-slate-500 mt-2 text-sm max-w-[200px] mx-auto">Try adjusting your search criteria or review filters.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100/80">
                {paginatedHistory.map((record) => (
                  <div key={record.id} className="p-5 md:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">

                    {/* Direction & Identity Profile */}
                    <div className="flex items-center gap-4 min-w-[320px]">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${record.direction === 'outgoing' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {record.direction === 'outgoing' ? <Send className="w-5 h-5 ml-1" /> : <Inbox className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {record.direction === 'outgoing' ? 'Sent To' : 'Received From'}
                          </div>
                        </div>
                        <div className="font-black text-slate-900 text-base leading-tight">
                          {record.direction === 'outgoing' ? record.recipientEmail : record.senderName}
                        </div>
                        {record.direction === 'incoming' && (
                          <div className="text-[11px] font-bold text-slate-500 truncate mt-0.5">{record.senderEmail}</div>
                        )}
                      </div>
                    </div>

                    {/* Quick Stats: Documents & Access Level */}
                    <div className="flex items-center gap-8 text-sm md:ml-4 flex-1">
                      <div className="hidden lg:block">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Payload</div>
                        <div className="font-bold text-slate-700 flex items-center gap-1.5 whitespace-nowrap"><FileText className="w-4 h-4 text-slate-400" /> {record.documents.length} Files attached</div>
                      </div>

                      <div className="hidden lg:block w-32 border-l border-slate-200 pl-8">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Access</div>
                        <div className="font-bold text-slate-700 capitalize flex items-center gap-1.5">
                          {record.accessLevel === 'view' && <Eye className="w-4 h-4 text-slate-400" />}
                          {record.accessLevel === 'edit' && <Edit className="w-4 h-4 text-slate-400" />}
                          {record.accessLevel === 'download' && <Download className="w-4 h-4 text-slate-400" />}
                          {!record.accessLevel && <FileText className="w-4 h-4 text-slate-400" />}
                          {record.accessLevel || 'Full'}
                        </div>
                      </div>
                    </div>

                    {/* Status & Time */}
                    <div className="flex items-center gap-6 justify-between md:justify-end min-w-[200px]">
                      <div className="hidden md:block">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 text-right">Time</div>
                        <div className="text-xs font-bold text-slate-600 text-right whitespace-nowrap">
                          {new Date(record.sharedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      <div className="text-right">
                        {record.status === 'viewed' || record.status === 'opened' ? (
                          <Badge className="bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 font-bold shadow-xs">
                            <Eye className="w-3 h-3 mr-1.5 opacity-50" /> Opened
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 font-bold shadow-xs">
                            Delivered
                          </Badge>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalHistoryPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-zinc-50/50">
                <p className="text-xs font-bold text-slate-500 pl-4 hidden sm:block">
                  Showing {((historyPage - 1) * HISTORY_ITEMS_PER_PAGE) + 1} to {Math.min(historyPage * HISTORY_ITEMS_PER_PAGE, filteredHistory.length)} of {filteredHistory.length}
                </p>
                <div className="flex items-center gap-2 sm:ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 border-slate-200 text-slate-600 font-bold hover:bg-white"
                    disabled={historyPage === 1}
                    onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                  </Button>
                  <div className="text-sm font-black text-slate-700 px-3 flex items-center gap-1 hidden sm:flex">
                    {Array.from({ length: totalHistoryPages }).map((_, i) => (
                      <span key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${i + 1 === historyPage ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`} onClick={() => setHistoryPage(i + 1)}>
                        {i + 1}
                      </span>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 border-slate-200 text-slate-600 font-bold hover:bg-white"
                    disabled={historyPage === totalHistoryPages}
                    onClick={() => setHistoryPage(p => Math.min(totalHistoryPages, p + 1))}
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

    </div>
  );
};
