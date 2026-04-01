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
  Download, Clock, CheckCircle2, ChevronRight, FileText, ArrowLeft, Mail, AlertCircle
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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header & Tabs Control - Precision Canvas Style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Data Sharing</h1>
          <p className="text-slate-500 font-medium mt-2 max-w-xl leading-relaxed">
            Manage incoming data streams and external documentation requests. Securely fulfill data sharing protocols without OTPs using our verified Vault-to-Wallet trust mechanism.
          </p>
        </div>

        {/* Segmented Control Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner self-start flex-shrink-0">
          <button
            onClick={() => { setActiveTab('send'); setSelectedIncomingShare(null); }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'send' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            <Send className="w-4 h-4" /> Send Data
          </button>
          <button
            onClick={() => setActiveTab('received')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'received' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            <Inbox className="w-4 h-4" /> Received
            {shares.filter(s => s.direction === 'incoming' && s.status === 'sent').length > 0 && (
              <span className="w-2 h-2 bg-rose-500 rounded-full ml-1" />
            )}
          </button>
          <button
            onClick={() => { setActiveTab('history'); setSelectedIncomingShare(null); }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'history' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
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
        <div className="max-w-3xl mx-auto mt-10">
          {!sendSuccess ? (
            <Card className="overflow-hidden border-slate-200 shadow-xl shadow-slate-200/50 rounded-3xl bg-white">
              {/* Progress visualizer */}
              <div className="flex items-center justify-between px-8 pt-8 pb-4">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex flex-col items-center gap-2 relative z-10 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${sendStep === step ? 'bg-blue-600 text-white shadow-md ring-4 ring-blue-50' :
                      sendStep > step ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                      }`}>
                      {sendStep > step ? <CheckCircle2 className="w-6 h-6" /> : step}
                    </div>
                  </div>
                ))}
                {/* Connecting lines */}
                <div className="absolute top-[3.25rem] left-20 right-20 h-[3px] bg-slate-100 -z-0">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500 ease-out"
                    style={{ width: `${((sendStep - 1) / 3) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-8 pb-10">
                {/* STEP 1 */}
                {sendStep === 1 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <div className="space-y-2 text-center">
                      <h2 className="text-2xl font-black text-slate-900">Who are you sending to?</h2>
                      <p className="text-slate-500">Enter the recipient's authenticated identifier or email.</p>
                    </div>
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="relative">
                        <Mail className="w-5 h-5 absolute left-4 top-4 text-slate-400" />
                        <Input
                          placeholder="recipient@example.com"
                          className="pl-12 h-14 rounded-2xl text-lg bg-slate-50 border-slate-200 focus:bg-white focus:ring-blue-500"
                          value={targetEmail}
                          onChange={(e) => setTargetEmail(e.target.value)}
                          autoFocus
                          type="email"
                        />
                      </div>
                      <Button
                        className="w-full h-14 rounded-2xl text-lg font-bold shadow-md"
                        disabled={!targetEmail.includes('@')}
                        onClick={() => setSendStep(2)}
                      >
                        Continue <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 2 */}
                {sendStep === 2 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <div className="space-y-2 text-center">
                      <h2 className="text-2xl font-black text-slate-900">Basic Details</h2>
                      <p className="text-slate-500">Your core identity will be securely attached.</p>
                    </div>
                    <div className="max-w-md mx-auto">
                      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50" />
                        <div className="flex items-start gap-4 relative z-10">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                            <ShieldCheck className="w-6 h-6 text-emerald-500" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900">Verified Profile Payload</h3>
                            <p className="text-sm text-slate-600 mt-1">
                              Name, Email, Date of Birth, Phone, and Address will be securely packaged.
                            </p>
                            <div className="mt-4 flex items-center gap-2 text-sm font-bold text-blue-700">
                              <CheckCircle2 className="w-4 h-4" /> Ready to share
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-6">
                        <Button variant="outline" className="flex-1 h-14 rounded-2xl font-bold" onClick={() => setSendStep(1)}>Back</Button>
                        <Button className="flex-1 h-14 rounded-2xl font-bold shadow-md" onClick={() => setSendStep(3)}>Continue <ChevronRight className="w-5 h-5 ml-2" /></Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3 */}
                {sendStep === 3 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <div className="space-y-2 text-center">
                      <h2 className="text-2xl font-black text-slate-900">Select Documents</h2>
                      <p className="text-slate-500">Choose verified files from your vault to append.</p>
                    </div>
                    <div className="max-w-md mx-auto space-y-6">
                      <div className="space-y-3 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                        {availableDocs.map(doc => (
                          <Label
                            key={doc}
                            className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${selectedDocs.includes(doc) ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500' : 'bg-white border-slate-200 hover:border-slate-300'
                              }`}
                          >
                            <Checkbox
                              checked={selectedDocs.includes(doc)}
                              onCheckedChange={() => handleDocToggle(doc)}
                              className="w-5 h-5 rounded-md border-slate-300 data-[state=checked]:bg-blue-600"
                            />
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-slate-600" />
                              </div>
                              <span className="font-bold text-slate-800 text-base">{doc}</span>
                            </div>
                          </Label>
                        ))}
                      </div>
                      <div className="flex gap-3 mt-8">
                        <Button variant="outline" className="flex-1 h-14 rounded-2xl font-bold" onClick={() => setSendStep(2)}>Back</Button>
                        <Button className="flex-[2] h-14 rounded-2xl font-bold shadow-md bg-blue-600 hover:bg-blue-700" onClick={() => setSendStep(4)}>
                          Review Package <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4 */}
                {sendStep === 4 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <div className="space-y-2 text-center">
                      <h2 className="text-3xl font-black text-slate-900">Review & Send</h2>
                      <p className="text-slate-500">Confirm payload structure before transmitting.</p>
                    </div>
                    <div className="max-w-md mx-auto space-y-6">

                      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden divide-y divide-slate-100">
                        <div className="p-5 flex items-center justify-between bg-slate-50/50">
                          <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Recipient</span>
                          <span className="font-black text-slate-900">{targetEmail}</span>
                        </div>
                        <div className="p-5">
                          <span className="text-sm font-bold text-slate-500 uppercase tracking-widest block mb-4">Included Payload</span>
                          <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-slate-700 font-bold">
                              <ShieldCheck className="w-5 h-5 text-emerald-500" /> Basic Details (Verified)
                            </li>
                            {selectedDocs.map(doc => (
                              <li key={doc} className="flex items-center gap-3 text-slate-700 font-bold">
                                <FileText className="w-5 h-5 text-blue-500" /> {doc}
                              </li>
                            ))}
                            {selectedDocs.length === 0 && (
                              <li className="text-sm text-slate-400 italic">No external documents appended.</li>
                            )}
                          </ul>
                        </div>
                      </div>

                      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3 text-sm text-emerald-800">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
                        <p><strong>Trust System Active:</strong> The receiver will be notified via email and will access this data via the secure SabApplier Vault protocol.</p>
                      </div>

                      <div className="flex gap-3">
                        <Button variant="outline" className="h-14 px-6 rounded-2xl font-bold" onClick={() => setSendStep(3)} disabled={isSending}>Back</Button>
                        <Button
                          className="flex-1 h-14 rounded-2xl font-black text-lg bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20"
                          onClick={handleSend}
                          disabled={isSending}
                        >
                          {isSending ? 'Transmitting...' : 'Share Securely'}
                          {!isSending && <Send className="w-5 h-5 ml-2" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
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
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900">Incoming Shares</h2>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 font-bold px-3 py-1">
                  {shares.filter(s => s.direction === 'incoming').length} Requests
                </Badge>
              </div>

              {shares.filter(s => s.direction === 'incoming').length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                  <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-500">No incoming data</h3>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {shares.filter(s => s.direction === 'incoming').map((record) => (
                    <button
                      key={record.id}
                      onClick={() => {
                        setSelectedIncomingShare(record);
                        if (record.status === 'sent') updateShareStatus(record.id, 'opened');
                      }}
                      className={`text-left border rounded-3xl p-6 transition-all hover:-translate-y-1 hover:shadow-xl ${record.status === 'sent'
                        ? 'bg-white border-blue-200 shadow-md ring-1 ring-blue-50'
                        : 'bg-slate-50 border-slate-200 opacity-80 shadow-sm'
                        }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${record.status === 'sent' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                            }`}>
                            {record.senderName[0]}
                          </div>
                          <div>
                            <h3 className={`font-black tracking-tight ${record.status === 'sent' ? 'text-slate-900' : 'text-slate-700'}`}>
                              {record.senderName}
                            </h3>
                            <div className="text-sm font-medium text-slate-500 truncate max-w-[180px]">{record.senderEmail}</div>
                          </div>
                        </div>
                        {record.status === 'sent' && (
                          <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.5)]" />
                        )}
                      </div>

                      <div className="pt-4 border-t border-slate-100/50 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                          <FileText className="w-4 h-4" /> {record.documents.length} Docs
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          {Math.round((Date.now() - record.sharedAt) / 60000)} min ago
                        </div>
                      </div>
                    </button>
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
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900">Outbound History</h2>
          </div>

          <Card className="overflow-hidden border-slate-200 shadow-sm rounded-3xl">
            {shares.filter(s => s.direction === 'outgoing').length === 0 ? (
              <div className="py-20 text-center bg-slate-50">
                <HistoryIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-500">No data sent yet</h3>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {shares.filter(s => s.direction === 'outgoing').map((record) => (
                  <div key={record.id} className="p-6 md:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50 transition-colors">

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Send className="w-5 h-5 text-blue-500 ml-1" />
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Sent To</div>
                        <div className="font-black text-slate-900 text-lg">{record.recipientEmail}</div>
                        <div className="text-sm font-medium text-slate-500 mt-0.5">
                          {record.documents.length} linked documents
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 justify-between md:justify-end md:w-[300px]">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Time</div>
                        <div className="text-sm font-bold text-slate-700">
                          {new Date(record.sharedAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="min-w-[120px] text-right">
                        <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Network Status</div>
                        {record.status === 'viewed' || record.status === 'opened' ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <Eye className="w-3.5 h-3.5 mr-1.5" /> Opened
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-800 border border-amber-200">
                            Delivered
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

    </div>
  );
};
