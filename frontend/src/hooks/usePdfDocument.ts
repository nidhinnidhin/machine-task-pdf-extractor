'use client';

import { useEffect, useState } from 'react';
import { PdfService } from '@/services/pdf.service';

// Lazily import pdfjs-dist to avoid SSR issues
type PDFDocumentProxy = import('pdfjs-dist').PDFDocumentProxy;

interface UsePdfDocumentResult {
  pdfDoc: PDFDocumentProxy | null;
  loading: boolean;
  error: string | null;
}

export function usePdfDocument(pdfId: string | null): UsePdfDocumentResult {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pdfId) {
      setPdfDoc(null);
      setError(null);
      return;
    }

    let cancelled = false;
    let docToDestroy: PDFDocumentProxy | null = null;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        setPdfDoc(null);

        // Fetch the PDF binary via authenticated axios call
        const buffer = await PdfService.fetchBuffer(pdfId);

        // Dynamic import to avoid SSR issues
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

        const doc = await pdfjsLib.getDocument({ data: buffer }).promise;
        docToDestroy = doc;

        if (!cancelled) {
          setPdfDoc(doc);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load PDF preview');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
      docToDestroy?.cleanup().catch(() => {});
    };
  }, [pdfId]);

  return { pdfDoc, loading, error };
}
