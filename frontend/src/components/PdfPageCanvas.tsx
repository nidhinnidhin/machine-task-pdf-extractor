'use client';

import { useEffect, useRef } from 'react';

type PDFDocumentProxy = import('pdfjs-dist').PDFDocumentProxy;

interface PdfPageCanvasProps {
  pdfDoc: PDFDocumentProxy;
  /** 1-indexed page number */
  pageNumber: number;
  /** Target pixel width for the thumbnail */
  targetWidth?: number;
}

export function PdfPageCanvas({ pdfDoc, pageNumber, targetWidth = 150 }: PdfPageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      try {
        const page = await pdfDoc.getPage(pageNumber);
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = targetWidth / baseViewport.width;
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      } catch {
        // Silently ignore render errors — the placeholder will remain
      }
    };

    render();

    return () => {
      cancelled = true;
    };
  }, [pdfDoc, pageNumber, targetWidth]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-auto rounded-md bg-white"
      style={{ display: 'block' }}
    />
  );
}
