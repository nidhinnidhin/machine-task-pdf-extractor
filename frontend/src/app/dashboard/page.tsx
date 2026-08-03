"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import { ProtectedRoute } from "@/components/guards";
import { PdfActions } from "@/actions/pdf.action";
import type { PdfDocument } from "@/types/pdf";
import { usePdfDocument } from "@/hooks/usePdfDocument";
import { PdfPageCanvas } from "@/components/PdfPageCanvas";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [pdfs, setPdfs] = useState<PdfDocument[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<PdfDocument | null>(null);
  
  // Selected page indices in their current extraction order (0-indexed)
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  
  // UI States
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [generationSuccess, setGenerationSuccess] = useState<PdfDocument | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [loggingOut, setLoggingOut] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load the selected PDF via pdfjs for real page thumbnails
  const { pdfDoc, loading: pdfLoading } = usePdfDocument(selectedPdf?.id ?? null);

  // Load PDF list
  const loadPdfs = async () => {
    try {
      setLoadingList(true);
      const list = await PdfActions.listPdfs();
      setPdfs(list);
    } catch (err: unknown) {
      console.error("Failed to load PDFs:", err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadPdfs();
  }, []);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  // Reusable PDF Upload Logic
  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      setUploadError(null);
      const newPdf = await PdfActions.uploadPdf(file);
      setPdfs((prev) => [newPdf, ...prev]);
      setSelectedPdf(newPdf);
      setSelectedPages([]);
      setGenerationSuccess(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setUploadError(err.message);
      } else {
        setUploadError("Failed to upload PDF file.");
      }
    } finally {
      setUploading(false);
    }
  };

  // Handle PDF Upload via file selector
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setUploadError("Only PDF files are allowed.");
      return;
    }

    await uploadFile(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setUploadError("Only PDF files are allowed.");
      return;
    }

    await uploadFile(file);
  };

  // Select/Deselect a page
  const togglePageSelection = (pageIndex: number) => {
    if (selectedPages.includes(pageIndex)) {
      setSelectedPages(selectedPages.filter((p) => p !== pageIndex));
    } else {
      setSelectedPages([...selectedPages, pageIndex]);
    }
    setGenerationSuccess(null);
  };

  // Move selected page left (earlier in order)
  const movePageLeft = (idx: number) => {
    if (idx === 0) return;
    const updated = [...selectedPages];
    const temp = updated[idx];
    updated[idx] = updated[idx - 1];
    updated[idx - 1] = temp;
    setSelectedPages(updated);
  };

  // Move selected page right (later in order)
  const movePageRight = (idx: number) => {
    if (idx === selectedPages.length - 1) return;
    const updated = [...selectedPages];
    const temp = updated[idx];
    updated[idx] = updated[idx + 1];
    updated[idx + 1] = temp;
    setSelectedPages(updated);
  };

  // Handle PDF extraction
  const handleGeneratePdf = async () => {
    if (!selectedPdf || selectedPages.length === 0) return;

    try {
      setGenerating(true);
      const result = await PdfActions.extractPages(selectedPdf.id, selectedPages);
      setGenerationSuccess(result);
      // Reload PDFs to show the generated one in the sidebar
      await loadPdfs();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to generate PDF.");
    } finally {
      setGenerating(false);
    }
  };

  // Trigger Download
  const handleDownload = (pdfId: string) => {
    PdfActions.downloadPdf(pdfId);
  };

  // Format File Size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (!user) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#030014] text-slate-100 font-sans relative overflow-hidden flex flex-col">
        {/* Ambient background glows */}
        <div className="absolute top-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

        {/* Header Bar */}
        <header className="border-b border-white/10 bg-[#030014]/60 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-md">
                <span className="text-white font-black text-lg">P</span>
              </div>
              <span className="text-lg font-extrabold tracking-wider text-white">PDF EXTRACTOR</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-full px-3 py-1.5">
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                    {user.name.charAt(0)}
                  </div>
                )}
                <span className="text-sm font-medium text-slate-200">{user.name}</span>
              </div>

              <button
                onClick={() => setShowLogoutModal(true)}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-semibold transition-all duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content split layout */}
        <div className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          
          {/* Left panel: PDF Upload & List (4 cols) */}
          <div className="lg:col-span-4 space-y-6 flex flex-col h-auto lg:h-[calc(100vh-140px)] min-h-[500px] lg:min-h-0">
            
            {/* Upload Zone Card */}
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 flex flex-col space-y-4 font-sans">
              <h3 className="text-base font-bold text-white">Upload New PDF</h3>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition duration-300 ${
                  isDragging 
                    ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10 scale-[1.02]" 
                    : "border-white/10 hover:border-indigo-500/50 bg-white/[0.01] hover:bg-white/[0.03]"
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="application/pdf"
                  className="hidden"
                />
                
                {uploading ? (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <svg className="animate-spin h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-xs text-slate-400 font-mono">Uploading PDF...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-center text-slate-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-slate-200">Click to browse or drop PDF here</p>
                    <p className="text-xs text-slate-500">Only PDF formats supported</p>
                  </div>
                )}
              </div>
              
              {uploadError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-2.5 rounded-lg font-mono">
                  {uploadError}
                </div>
              )}
            </div>

            {/* Document List Card */}
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 flex flex-col flex-1 min-h-[300px] lg:min-h-0">
              <h3 className="text-base font-bold text-white mb-4">My Documents</h3>
              
              {loadingList ? (
                <div className="flex-1 flex items-center justify-center">
                  <svg className="animate-spin h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              ) : pdfs.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                  <p className="text-slate-500 text-sm">No PDF files uploaded yet.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  {pdfs.map((pdf) => (
                    <div 
                      key={pdf.id}
                      onClick={() => {
                        setSelectedPdf(pdf);
                        setSelectedPages([]);
                        setGenerationSuccess(null);
                      }}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-300 ${
                        selectedPdf?.id === pdf.id 
                          ? "bg-indigo-600/10 border-indigo-500 shadow-md shadow-indigo-500/5" 
                          : "bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-sm font-bold text-slate-200 line-clamp-1 break-all flex-1">
                          {pdf.originalName}
                        </h4>
                        {pdf.isGenerated && (
                          <span className="text-[9px] uppercase font-mono tracking-widest text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
                            Split
                          </span>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center text-xs text-slate-500 mt-2 font-mono">
                        <span>{pdf.pageCount} {pdf.pageCount === 1 ? "page" : "pages"}</span>
                        <span>{formatFileSize(pdf.fileSize)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Active workspace (8 cols) */}
          <div className="lg:col-span-8 flex flex-col h-auto lg:h-[calc(100vh-140px)] min-h-[500px] lg:min-h-0">
            
            {/* If no PDF is selected */}
            {!selectedPdf ? (
              <div className="bg-white/[0.01] border border-white/5 rounded-2xl flex-1 flex flex-col items-center justify-center text-center p-8 min-h-[300px] lg:min-h-0">
                <div className="bg-indigo-500/5 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-slate-200">No PDF Document Selected</h2>
                <p className="text-sm text-slate-500 mt-1 max-w-sm">
                  Upload a new PDF document or select one from the "My Documents" list to start extracting pages.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0 space-y-6 overflow-y-auto pr-1">
                
                {/* Active PDF info header */}
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-scale-in">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-lg font-extrabold text-white break-all">{selectedPdf.originalName}</h2>
                      <button 
                        onClick={() => handleDownload(selectedPdf.id)}
                        className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition"
                        title="Download Document"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
                      <span>Size: {formatFileSize(selectedPdf.fileSize)}</span>
                      <span>•</span>
                      <span>Total Pages: {selectedPdf.pageCount}</span>
                    </div>
                  </div>
                  
                  {/* Select all pages shortcut */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const allIndices = Array.from({ length: selectedPdf.pageCount }, (_, i) => i);
                        setSelectedPages(allIndices);
                      }}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold transition"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => setSelectedPages([])}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold transition"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                {/* PDF Page Selection Grid */}
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 flex-1 flex flex-col min-h-[350px] lg:min-h-0">
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 font-mono">
                    Step 1: Choose Pages to Extract
                  </h3>

                  {/* PDF Page Preview Grid */}
                  {pdfLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 py-10">
                      <svg className="animate-spin h-7 w-7 text-indigo-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-xs text-slate-400 font-mono">Rendering PDF pages...</span>
                    </div>
                  ) : (
                  <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pr-1">
                    {Array.from({ length: selectedPdf.pageCount }).map((_, index) => {
                      const isChecked = selectedPages.includes(index);
                      const sequenceIndex = selectedPages.indexOf(index);
                      
                      return (
                        <div 
                          key={index}
                          onClick={() => togglePageSelection(index)}
                          className={`relative border rounded-xl overflow-hidden flex flex-col items-center gap-0 cursor-pointer transition select-none group ${
                            isChecked 
                              ? "border-indigo-500 shadow-lg shadow-indigo-500/20" 
                              : "border-white/5 hover:border-white/15"
                          }`}
                        >
                          {/* Top Controls Overlay */}
                          <div className="absolute top-2 left-2 right-2 z-10 flex justify-between items-center pointer-events-none">
                            {/* Checkbox indicator */}
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                              isChecked 
                                ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/40" 
                                : "bg-black/50 border-white/20 text-transparent group-hover:border-white/40"
                            }`}>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>

                            {/* Selected order sequence bubble */}
                            {isChecked && (
                              <span className="flex items-center justify-center px-1.5 py-0.5 rounded-md bg-indigo-500 text-white font-mono text-[10px] font-bold shadow-md">
                                #{sequenceIndex + 1}
                              </span>
                            )}
                          </div>

                          {/* Actual PDF page thumbnail */}
                          <div className={`w-full transition duration-200 ${
                            isChecked ? "opacity-100 ring-2 ring-indigo-500/50" : "opacity-75 group-hover:opacity-100"
                          }`}>
                            {pdfDoc ? (
                              <PdfPageCanvas pdfDoc={pdfDoc} pageNumber={index + 1} targetWidth={160} />
                            ) : (
                              <div className="w-full aspect-[3/4] bg-white/5 flex items-center justify-center">
                                <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>

                          {/* Page label bar */}
                          <div className={`w-full text-center py-1.5 text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                            isChecked
                              ? "bg-indigo-600 text-white"
                              : "bg-white/[0.02] text-slate-400 group-hover:text-slate-200"
                          }`}>
                            <span>Page {index + 1}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  )}
                </div>

                {/* Selected Sequence Panel with Move controls & Remove button */}
                {selectedPages.length > 0 && (
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider font-mono">
                        Step 2: Rearrange Sequence ({selectedPages.length} selected)
                      </h3>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Use arrows to reorder or click ✕ to remove
                      </span>
                    </div>

                    {/* Horizontal scroll flow of selected order */}
                    <div className="flex gap-3 overflow-x-auto pb-2 pr-1">
                      {selectedPages.map((pageIdx, idx) => (
                        <div 
                          key={`${pageIdx}-${idx}`}
                          className="bg-white/[0.03] border border-white/10 rounded-xl p-3 min-w-[130px] flex flex-col items-center gap-2 relative shadow-md group"
                        >
                          {/* Remove Page Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePageSelection(pageIdx);
                            }}
                            className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white flex items-center justify-center transition text-xs"
                            title="Remove Page"
                          >
                            ✕
                          </button>

                          <span className="text-[10px] font-mono text-indigo-400 font-bold">
                            Order #{idx + 1}
                          </span>
                          
                          <span className="text-sm font-semibold text-white">
                            Page {pageIdx + 1}
                          </span>

                          <div className="flex items-center gap-1.5 mt-1 border-t border-white/5 pt-2 w-full justify-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                movePageLeft(idx);
                              }}
                              disabled={idx === 0}
                              className="p-1 hover:bg-white/10 disabled:opacity-30 rounded text-slate-300 disabled:pointer-events-none transition"
                              title="Move Left"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                movePageRight(idx);
                              }}
                              disabled={idx === selectedPages.length - 1}
                              className="p-1 hover:bg-white/10 disabled:opacity-30 rounded text-slate-300 disabled:pointer-events-none transition"
                              title="Move Right"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Generate PDF Trigger Block */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-white/5 pt-4">
                      <p className="text-xs text-slate-400">
                        New PDF will contain pages in the sequence above:{" "}
                        <span className="font-mono text-indigo-300">
                          {selectedPages.map((p) => p + 1).join(" → ")}
                        </span>
                      </p>

                      <button
                        onClick={handleGeneratePdf}
                        disabled={generating}
                        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-sm font-semibold transition active:scale-95 disabled:opacity-75 disabled:pointer-events-none flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-500/20"
                      >
                        {generating ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Generating PDF...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 10.742a3 3 0 11-2.203 2.203 1.378 1.378 0 00-1.803-1.662m15.906-2.202a3 3 0 11-2.202 2.202 1.378 1.378 0 00-1.803-1.662M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Generate PDF</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Generation Success Panel */}
                {generationSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-scale-in">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">New PDF Extracted Successfully!</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{generationSuccess.originalName}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownload(generationSuccess.id)}
                      className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Download Split PDF</span>
                    </button>
                  </div>
                )}

              </div>
            )}

          </div>
        </div>

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#0b081e] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-scale-in">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Sign Out Confirmation</h3>
                  <p className="text-sm text-slate-400 mt-0.5">Are you sure you want to log out of your session?</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
                <button
                  type="button"
                  disabled={loggingOut}
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-semibold transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={loggingOut}
                  onClick={handleLogout}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition flex items-center gap-2 shadow-lg shadow-red-600/20 disabled:opacity-50"
                >
                  {loggingOut ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Signing out...</span>
                    </>
                  ) : (
                    <span>Yes, Sign Out</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
