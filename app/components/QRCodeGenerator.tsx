"use client";

import { useRef, useState } from "react";
import { Card } from "./DemoComponents";
import { Button } from "@/components/ui/button";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";

export function QRCodeGenerator() {
  // Download QR code as PNG (for both SVG and Canvas)
  const handleDownload = () => {
    if (renderer === 'svg' && svgRef.current) {
      // Convert SVG to PNG
      const svg = svgRef.current;
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = svg.width.baseVal.value || 180;
        canvas.height = svg.height.baseVal.value || 180;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = 'qr-code.png';
              a.click();
              URL.revokeObjectURL(url);
            }
          }, 'image/png');
        }
      };
      img.src = url;
    } else if (renderer === 'canvas' && canvasRef.current) {
      const canvas = canvasRef.current;
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qr-code.png';
      a.click();
    }
  };

  // Share QR code using Web Share API or fallback
  const handleShare = async () => {
    if (renderer === 'svg' && svgRef.current) {
      // Convert SVG to PNG
      const svg = svgRef.current;
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      const img = new window.Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = svg.width.baseVal.value || 180;
        canvas.height = svg.height.baseVal.value || 180;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(async (blob) => {
            if (blob) {
              if (navigator.canShare && navigator.canShare({ files: [new File([blob], 'qr-code.png', { type: blob.type })] })) {
                try {
                  await navigator.share({
                    files: [new File([blob], 'qr-code.png', { type: blob.type })],
                    title: 'QR Code',
                    text: 'Scan this QR code!',
                  });
                } catch {}
              } else {
                // fallback: download
                handleDownload();
              }
            }
          }, 'image/png');
        }
      };
      img.src = url;
    } else if (renderer === 'canvas' && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.toBlob(async (blob) => {
        if (blob) {
          if (navigator.canShare && navigator.canShare({ files: [new File([blob], 'qr-code.png', { type: blob.type })] })) {
            try {
              await navigator.share({
                files: [new File([blob], 'qr-code.png', { type: blob.type })],
                title: 'QR Code',
                text: 'Scan this QR code!',
              });
            } catch {}
          } else {
            // fallback: download
            handleDownload();
          }
        }
      }, 'image/png');
    }
  };

  const [input, setInput] = useState("");
  const [qrValue, setQrValue] = useState("");
  const [renderer, setRenderer] = useState<'svg' | 'canvas'>("svg");
  const [loading, setLoading] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setQrValue(input);
      setLoading(false);
    }, 3000);
  };

  // Use theme-aware colors for QR background and foreground
  const bgColor = "var(--app-background)";
  const fgColor = "var(--app-accent)";
  // Show logo only if value looks like a URL
  const showLogo = /^https?:\/\//.test(qrValue);
  const imageSettings = showLogo
    ? {
        src: "/Base_Network_Logo.png",
        height: 32,
        width: 32,
        excavate: true,
      }
    : undefined;

  return (
    <Card title="QR Code Generator" className="max-w-lg mx-auto animate-fade-in text-[var(--app-foreground)]">
      <motion.form
        onSubmit={handleGenerate}
        className="flex flex-col gap-4"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 80, damping: 14 }}
      >
        <input
          type="text"
          placeholder="Enter text or URL to encode"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="border border-[var(--app-card-border)] rounded-lg px-4 py-2 text-[var(--app-foreground)] bg-[var(--app-background)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] placeholder:text-[var(--app-foreground-muted)]"
          required
        />
        <div className="flex gap-2 items-center">
          <label className="text-xs text-[var(--app-foreground-muted)]">Renderer:</label>
          <Button
            type="button"
            size="sm"
            variant={renderer === 'svg' ? 'default' : 'outline'}
            onClick={() => setRenderer('svg')}
            className="px-3"
          >
            SVG
          </Button>
          <Button
            type="button"
            size="sm"
            variant={renderer === 'canvas' ? 'default' : 'outline'}
            onClick={() => setRenderer('canvas')}
            className="px-3"
          >
            Canvas
          </Button>
        </div>
        <Button type="submit" variant="default" size="default" disabled={loading}>
          {loading ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <svg className="animate-spin h-5 w-5 mr-2 text-[var(--app-foreground)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              Generating...
            </motion.span>
          ) : (
            "Generate QR Code"
          )}
        </Button>
      </motion.form>
      <div className="flex flex-col items-center mt-6 min-h-[200px]">
        <AnimatePresence>
          {qrValue && !loading && (
            <motion.div
              key="qr"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="flex flex-col items-center"
            >
              {renderer === 'svg' ? (
                <QRCodeSVG
                  ref={svgRef}
                  value={qrValue}
                  title={qrValue}
                  size={180}
                  bgColor={bgColor}
                  fgColor={fgColor}
                  level="L"
                  imageSettings={imageSettings}
                  className="shadow-md rounded-lg border border-[var(--app-card-border)] bg-[var(--app-background)] p-4"
                />
              ) : (
                <QRCodeCanvas
                  ref={canvasRef}
                  value={qrValue}
                  title={qrValue}
                  size={180}
                  bgColor={bgColor}
                  fgColor={fgColor}
                  level="L"
                  imageSettings={imageSettings}
                  className="shadow-md rounded-lg border border-[var(--app-card-border)] bg-[var(--app-background)] p-4"
                />
              )}
              {/* Download and Share Buttons */}
              <div className="flex gap-3 mt-4">
                <Button variant="outline" size="sm" onClick={() => handleDownload()}>
                  Download
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleShare()}>
                  Share
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
