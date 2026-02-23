"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { UserProfile, Profession } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  FileUp, 
  FileCheck, 
  Loader2, 
  Search, 
  Filter, 
  Eye, 
  Trash2,
  ExternalLink,
  Plus,
  FolderPlus,
  FilePlus,
  Folder
} from 'lucide-react';
import { processVaultDocument } from '@/lib/api';
import { uploadUserDocument } from '@/firebase/storage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface VaultProps {
  userId: string;
  authToken: string;
  user: UserProfile;
  saveUser: (user: UserProfile) => void;
}

export const Vault: React.FC<VaultProps> = ({ userId, authToken, user, saveUser }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingDoc, setProcessingDoc] = useState<string | null>(null);
  const [viewingDoc, setViewingDoc] = useState<string | null>(null);
  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [customFolders, setCustomFolders] = useState<string[]>([]);
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocFolder, setNewDocFolder] = useState('');

  const professionMap: Record<Profession, string[]> = {
    'Student': ['Resume', '10th Marksheet', '12th Marksheet', 'University Degree', 'University Marksheet', 'Caste Certificate'],
    'Professional': ['Offer Letter', 'Salary Slips', 'Experience Letter', 'Employee ID'],
    'Founder': ['Pitchdeck', 'GST Certificate', 'Incorporation Certificate', 'DPIIT Recognition'],
    'Researcher': ['Publications', 'PhD Certificate', 'Research Proposal'],
    'Other': ['Birth Certificate', 'Marriage Certificate']
  };

  const getStudentDocuments = (): string[] => {
    const baseDocuments = ['Resume', 'Caste Certificate'];
    const qualification = user.highestQualification?.toLowerCase() || '';
    
    // Add documents based on qualification level
    if (qualification.includes('10') || qualification === '10th' || qualification === 'tenth') {
      return [...baseDocuments, '10th Marksheet'];
    }
    if (qualification.includes('12') || qualification === '12th' || qualification === 'twelfth') {
      return [...baseDocuments, '10th Marksheet', '12th Marksheet'];
    }
    // Graduate, Post Graduate, or any higher qualification
    if (qualification.includes('graduate') || qualification.includes('degree') || qualification.includes('bachelor') || qualification.includes('master') || qualification.includes('phd')) {
      return [...baseDocuments, '10th Marksheet', '12th Marksheet', 'University Degree', 'University Marksheet'];
    }
    // Default to full list if qualification not set
    return professionMap['Student'];
  };

  const getVaultCategories = () => {
    const cats: Record<string, string[]> = {
      'Personal Identity': ['Aadhaar Card', 'PAN Card', 'Voter ID', 'Driving Licence', 'Passport Photo', 'Signature'],
    };

    user.professions.forEach(p => {
      if (p === 'Student') {
        cats[`${p} Documents`] = getStudentDocuments();
      } else {
        cats[`${p} Documents`] = professionMap[p];
      }
    });

    // Add documents that have a 'folder' property
    if (user.documents) {
      Object.entries(user.documents).forEach(([docName, docData]) => {
        if (docData.folder) {
          if (!cats[docData.folder]) {
            cats[docData.folder] = [];
          }
          if (!cats[docData.folder].includes(docName)) {
            cats[docData.folder].push(docName);
          }
        }
      });
    }
    
    // Add empty custom folders
    customFolders.forEach(folder => {
        if (!cats[folder]) {
            cats[folder] = [];
        }
    });

    return cats;
  };

  const categories = getVaultCategories();
  const allCategoryTitles = Object.keys(categories);
  const activeDocs = selectedCategory ? categories[selectedCategory] : Object.values(categories).flat();
  
  // Filter duplicates in activeDocs if any
  const uniqueActiveDocs = Array.from(new Set(activeDocs));

  // Vault completion: count only docs in CURRENT view (activeDocs) that are actually uploaded (have fileUrl)
  const completedInActive = uniqueActiveDocs.filter(
    (doc) => user.documents?.[doc]?.fileUrl
  ).length;
  const totalInActive = uniqueActiveDocs.length;
  const vaultCompletionPercent = totalInActive > 0
    ? Math.round((completedInActive / totalInActive) * 100)
    : 0;

  const filteredDocs = uniqueActiveDocs.filter((doc) =>
    doc.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const handleCreateFolder = () => {
    if (newFolderName && !allCategoryTitles.includes(newFolderName)) {
        setCustomFolders([...customFolders, newFolderName]);
        setNewFolderName('');
        setIsAddFolderOpen(false);
    }
  };

  const handleCreateCustomDoc = () => {
      if (newDocName && newDocFolder) {
          // We don't actually create the doc until upload, but we need to track it in UI?
          // For now, let's just add it to the 'user.documents' with a placeholder status if needed, 
          // OR, simpler: We just need to know it exists.
          // BUT, our current architecture relies on 'user.documents' keys for upload status.
          // The issue is: The 'placeholders' are derived from categories.
          // So if we add it to a category (folder), it will show up.
          
          // Wait, 'categories' is derived function. We need to persist this new document placeholder.
          // Since we don't have a separate 'placeholders' DB table, we can add a 'dummy' entry to user.documents
          // with status 'idle' and the folder tag.
          
          const updatedDocs = {
              ...user.documents,
              [newDocName]: {
                  fileUrl: '',
                  status: 'idle' as const, // Cast strictly
                  uploadedAt: new Date().toISOString(),
                  folder: newDocFolder
              }
          };
          saveUser({ ...user, documents: updatedDocs });
          setNewDocName('');
          setNewDocFolder('');
          setIsAddDocOpen(false);
          setSelectedCategory(newDocFolder);
      }
  };


  const handleFileUpload = async (docType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessingDoc(docType);
    
    // Check if this doc has a folder
    const currentDoc = user.documents?.[docType];
    const folder = currentDoc?.folder;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUri = reader.result as string;
      
      try {
        const normalizedDocType = docType.toLowerCase().replace(/\s+/g, '_');
        const { fileUrl, storagePath } = await uploadUserDocument(userId, file, normalizedDocType);
        const processed = await processVaultDocument(authToken, {
          dataUri,
          docType: normalizedDocType,
          fileUrl,
          storagePath,
        });

        const updatedDocs = {
          ...user.documents,
          [docType]: {
            fileUrl,
            storagePath,
            extractedData: processed.user.documents?.[normalizedDocType]?.extractedData || null,
            status: processed.user.documents?.[normalizedDocType]?.status || 'verified',
            uploadedAt: processed.user.documents?.[normalizedDocType]?.uploadedAt || new Date().toISOString(),
            processedAt: processed.user.documents?.[normalizedDocType]?.processedAt,
            folder: folder // Preserve the folder!
          }
        };

        saveUser({ ...user, documents: updatedDocs });
      } catch (err) {
        console.error('AI Processing failed:', err);
      } finally {
        setProcessingDoc(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (docType: string) => {
    const updatedDocs = { ...user.documents };
    // Instead of deleting, if it's a custom doc (has folder), we might want to keep it as idle?
    // Or just delete it. If user deletes a custom doc, it's gone.
    delete updatedDocs[docType];
    saveUser({ ...user, documents: updatedDocs });
  };

  const currentDocData = viewingDoc ? user.documents[viewingDoc] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3 space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-primary">Document Vault</h2>
            <p className="text-muted-foreground">Manage and verify your identity credentials</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5c75b8]" />
              <input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/95 border border-[#c5d3f7] rounded-2xl text-sm text-[#1f3f87] placeholder:text-[#90a0c8] focus:outline-none focus:ring-2 focus:ring-[#2F56C0]/30 focus:border-[#6a84c7] transition-all shadow-sm hover:shadow"
              />
            </div>
          </div>
        </header>

        <div className="flex gap-4">
            <Dialog open={isAddFolderOpen} onOpenChange={setIsAddFolderOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2 rounded-xl border-[#c5d3f7] text-[#2F56C0] hover:bg-[#eef2ff]">
                        <FolderPlus className="w-4 h-4" /> Create Folder
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Folder</DialogTitle>
                        <DialogDescription>Organize your documents into custom categories.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>Folder Name</Label>
                        <Input 
                            value={newFolderName} 
                            onChange={(e) => setNewFolderName(e.target.value)} 
                            placeholder="e.g., Medical Records"
                        />
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreateFolder} disabled={!newFolderName}>Create Folder</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isAddDocOpen} onOpenChange={setIsAddDocOpen}>
                <DialogTrigger asChild>
                    <Button className="gap-2 rounded-xl bg-[#2F56C0] hover:bg-[#284aa8]">
                        <FilePlus className="w-4 h-4" /> Add Custom Document
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Custom Document</DialogTitle>
                        <DialogDescription>Create a placeholder for a new document.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Document Name</Label>
                            <Input 
                                value={newDocName} 
                                onChange={(e) => setNewDocName(e.target.value)} 
                                placeholder="e.g., MRI Scan Report"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Folder / Category</Label>
                            <Select value={newDocFolder} onValueChange={setNewDocFolder}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a folder" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allCategoryTitles.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                    {customFolders.filter(f => !allCategoryTitles.includes(f)).map(f => (
                                        <SelectItem key={f} value={f}>{f}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreateCustomDoc} disabled={!newDocName || !newDocFolder}>Add Document</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDocs.map(doc => {
            const data = user.documents?.[doc];
            const isProcessing = processingDoc === doc;
            const isUploaded = !!data?.fileUrl; // Check fileUrl specifically

            return (
              <Card
                key={doc}
                className="p-6 relative group dashboard-card border-2 border-transparent hover:border-[#c5d3f7] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col justify-between min-h-[220px] rounded-2xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-gradient-to-br from-[#eef2ff] to-[#dfe7ff] rounded-xl border border-[#c5d3f7] shadow-sm">
                      <FileUp className="w-5 h-5 text-[#2F56C0]" />
                    </div>
                    {isUploaded && (
                      <div className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase rounded-md flex items-center gap-1 border border-emerald-100">
                        <FileCheck className="w-3 h-3" /> Verified
                      </div>
                    )}
                  </div>
                  <h4 className="font-bold text-primary mb-1">{doc}</h4>
                  <p className="text-xs text-muted-foreground">
                      {data?.folder ? `In ${data.folder}` : 'Required for profile verification'}
                  </p>
                </div>

                <div className="mt-6">
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-2 text-sm font-medium text-primary">
                      <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
                    </div>
                  ) : isUploaded ? (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 rounded-xl gap-2"
                        onClick={() => setViewingDoc(doc)}
                      >
                        <Eye className="w-4 h-4" /> View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 rounded-xl text-destructive hover:text-destructive gap-2 border-rose-200/70 hover:bg-rose-50"
                        onClick={() => handleRemove(doc)}
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </Button>
                    </div>
                  ) : (
                    <label className="block">
                      <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(doc, e)} />
                      <div className="w-full py-3 bg-[#eef2ff] border-2 border-dashed border-[#c5d3f7] rounded-xl text-center cursor-pointer hover:bg-[#dfe7ff] hover:border-[#aebfe9] transition-all duration-300 group-hover:shadow-sm">
                        <span className="text-xs font-bold text-[#2F56C0] uppercase tracking-widest">Upload File</span>
                      </div>
                    </label>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
        {filteredDocs.length === 0 && (
          <Card className="dashboard-card rounded-2xl p-10 text-center">
            <p className="text-sm font-semibold text-primary">
              No documents found for "{searchQuery}".
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Try another name or clear search to see all documents.
            </p>
          </Card>
        )}
      </div>

      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <Card className="p-6 dashboard-card rounded-2xl">
          <h4 className="text-sm font-black text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
            <Filter className="w-4 h-4" /> Categories
          </h4>
          <div className="space-y-2">
            <button 
              onClick={() => setSelectedCategory(null)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                !selectedCategory
                  ? 'bg-[#2F56C0] text-white shadow-[0_8px_18px_rgba(47,86,192,0.32)]'
                  : 'hover:bg-[#eef2ff] hover:text-[#2F56C0] hover:translate-x-1'
              }`}
            >
              All Categories
            </button>
            {allCategoryTitles.map(title => (
              <button 
                key={title}
                onClick={() => setSelectedCategory(title)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                  selectedCategory === title
                    ? 'bg-[#2F56C0] text-white shadow-[0_8px_18px_rgba(47,86,192,0.32)]'
                    : 'hover:bg-[#eef2ff] hover:text-[#2F56C0] hover:translate-x-1'
                }`}
              >
                {title}
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-[#3f67d1] via-[#2F56C0] to-[#284aa8] text-white border-none rounded-2xl shadow-[0_14px_30px_rgba(47,86,192,0.35)] relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-white/15 blur-md" />
          <div className="absolute -left-10 -bottom-10 w-28 h-28 rounded-full bg-white/10 blur-md" />
          <div className="relative flex items-start justify-between mb-2">
            <div className="text-4xl font-black">
              {vaultCompletionPercent}%
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center overflow-hidden shadow-sm">
              <div className="relative w-5 h-5 rounded-md overflow-hidden">
                <Image
                  src="/logo.jpeg"
                  alt="SabApplier"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
          <div className="text-[10px] font-bold opacity-85 uppercase tracking-widest mb-4">
            Vault Completion {selectedCategory ? `· ${selectedCategory}` : '· All'}
          </div>
          <Progress
            value={vaultCompletionPercent}
            className="h-1.5 bg-white/25 [&>div]:bg-gradient-to-r [&>div]:from-emerald-300 [&>div]:to-green-500"
          />
        </Card>
      </aside>

      <Dialog open={!!viewingDoc} onOpenChange={(open: boolean) => !open && setViewingDoc(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-none rounded-[2rem]">
          <DialogHeader className="p-8 border-b bg-white">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-3xl font-black text-primary tracking-tight">{viewingDoc}</DialogTitle>
                <DialogDescription className="font-medium">Verification details and AI-extracted metadata</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-auto bg-slate-50">
            <div className="grid grid-cols-1 md:grid-cols-2 h-full">
              <div className="p-8 flex items-center justify-center border-b md:border-b-0 md:border-r bg-slate-100">
                {currentDocData?.fileUrl && (
                  <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-white p-2">
                    <img 
                      src={currentDocData.fileUrl} 
                      alt={viewingDoc || ''} 
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>
                )}
              </div>
              
              <div className="p-8 space-y-8 bg-white">
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Extracted Metadata</h5>
                  <div className="border rounded-2xl overflow-hidden shadow-sm">
                    <Table>
                      <TableHeader className="bg-secondary/30">
                        <TableRow className="hover:bg-transparent border-none">
                          <TableHead className="text-[10px] font-black uppercase tracking-widest h-10">Field</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest h-10">Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentDocData?.extractedData && Object.entries(currentDocData.extractedData).map(([key, value]) => (
                          <TableRow key={key} className="border-secondary/50">
                            <TableCell className="font-bold text-xs py-3 text-primary">{key}</TableCell>
                            <TableCell className="text-xs py-3 font-medium text-muted-foreground">{String(value)}</TableCell>
                          </TableRow>
                        ))}
                        {(!currentDocData?.extractedData || Object.keys(currentDocData.extractedData).length === 0) && (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center py-10 text-muted-foreground italic text-xs">
                              No data fields extracted
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="p-6 bg-[#eef2ff]/70 rounded-2xl border border-[#c5d3f7]">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm text-[#2F56C0]">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-black text-[#1f3f87]">Verified by Sabapplier AI</div>
                      <p className="text-xs text-[#4d67a6] font-medium leading-relaxed">
                        This document has been securely scanned and verified against your core identity profile.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-8 border-t flex justify-end gap-4 bg-white">
            <Button variant="outline" onClick={() => setViewingDoc(null)} className="rounded-xl h-12 px-8 font-bold">
              Close
            </Button>
            <Button className="rounded-xl h-12 px-8 font-bold gap-2 shadow-lg shadow-primary/20">
              <ExternalLink className="w-4 h-4" /> Use for Application
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
