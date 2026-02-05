"use client";

import React, { useState } from 'react';
import { UserProfile, Profession } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileUp, FileCheck, Loader2, Search, Filter } from 'lucide-react';
import { extractDataFromDocument } from '@/ai/flows/extract-data-from-document';

interface VaultProps {
  user: UserProfile;
  saveUser: (user: UserProfile) => void;
}

export const Vault: React.FC<VaultProps> = ({ user, saveUser }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [processingDoc, setProcessingDoc] = useState<string | null>(null);

  const professionMap: Record<Profession, string[]> = {
    'Student': ['Resume', '10th Marksheet', '12th Marksheet', 'Caste Certificate'],
    'Professional': ['Offer Letter', 'Salary Slips', 'Experience Letter', 'Employee ID'],
    'Founder': ['Pitchdeck', 'GST Certificate', 'Incorporation Certificate', 'DPIIT Recognition'],
    'Researcher': ['Publications', 'PhD Certificate', 'Research Proposal'],
    'Other': ['Birth Certificate', 'Marriage Certificate']
  };

  const getVaultCategories = () => {
    const cats: Record<string, string[]> = {
      'Personal Identity': ['Aadhaar Card', 'PAN Card', 'Voter ID', 'Passport Photo'],
    };

    user.professions.forEach(p => {
      cats[`${p} Documents`] = professionMap[p];
    });

    return cats;
  };

  const categories = getVaultCategories();
  const allCategoryTitles = Object.keys(categories);
  const activeDocs = selectedCategory ? categories[selectedCategory] : Object.values(categories).flat();

  const handleFileUpload = async (docType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessingDoc(docType);
    
    // Convert to base64 for AI processing
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      
      try {
        const result = await extractDataFromDocument({
          base64Data: base64,
          mimeType: file.type,
          docType: docType.toLowerCase().replace(/\s+/g, '_')
        });

        const updatedDocs = {
          ...user.documents,
          [docType]: {
            url: URL.createObjectURL(file),
            aiData: result.extractedData,
            status: 'verified' as const
          }
        };

        saveUser({ ...user, documents: updatedDocs });
      } catch (err) {
        console.error('AI Processing failed:', err);
        // Fallback or show error
      } finally {
        setProcessingDoc(null);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3 space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-primary">Document Vault</h2>
            <p className="text-muted-foreground">Manage and verify your identity credentials</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                placeholder="Search documents..." 
                className="pl-9 pr-4 py-2 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {activeDocs.map(doc => {
            const data = user.documents[doc];
            const isProcessing = processingDoc === doc;
            const isUploaded = !!data;

            return (
              <Card key={doc} className="p-6 relative group border-2 border-transparent hover:border-primary/20 transition-all flex flex-col justify-between min-h-[220px]">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-secondary rounded-lg">
                      <FileUp className="w-5 h-5 text-primary" />
                    </div>
                    {isUploaded && (
                      <div className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase rounded-md flex items-center gap-1">
                        <FileCheck className="w-3 h-3" /> Verified
                      </div>
                    )}
                  </div>
                  <h4 className="font-bold text-primary mb-1">{doc}</h4>
                  <p className="text-xs text-muted-foreground">Required for profile verification</p>
                </div>

                <div className="mt-6">
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-2 text-sm font-medium text-primary">
                      <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
                    </div>
                  ) : isUploaded ? (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 rounded-lg">View</Button>
                      <Button variant="outline" size="sm" className="flex-1 rounded-lg text-destructive hover:text-destructive">Remove</Button>
                    </div>
                  ) : (
                    <label className="block">
                      <input type="file" className="hidden" onChange={(e) => handleFileUpload(doc, e)} />
                      <div className="w-full py-3 bg-secondary/50 border-2 border-dashed border-border rounded-xl text-center cursor-pointer hover:bg-secondary transition-all">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Upload File</span>
                      </div>
                    </label>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <aside className="space-y-6">
        <Card className="p-6">
          <h4 className="text-sm font-black text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
            <Filter className="w-4 h-4" /> Categories
          </h4>
          <div className="space-y-2">
            <button 
              onClick={() => setSelectedCategory(null)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                !selectedCategory ? 'bg-primary text-white' : 'hover:bg-secondary'
              }`}
            >
              All Categories
            </button>
            {allCategoryTitles.map(title => (
              <button 
                key={title}
                onClick={() => setSelectedCategory(title)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  selectedCategory === title ? 'bg-primary text-white' : 'hover:bg-secondary'
                }`}
              >
                {title}
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-primary to-[#2d3f5f] text-white">
          <div className="text-4xl font-black mb-1">
            {Math.round((Object.keys(user.documents).length / activeDocs.length) * 100) || 0}%
          </div>
          <div className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-4">Vault Completion</div>
          <Progress 
            value={(Object.keys(user.documents).length / activeDocs.length) * 100} 
            className="h-1 bg-white/10" 
          />
        </Card>
      </aside>
    </div>
  );
};