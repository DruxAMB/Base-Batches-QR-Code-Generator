"use client";

import { useRef, useState } from "react";
import { Card } from "./DemoComponents";
import { Button } from "@/components/ui/button";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { PremiumFeatures } from "@/components/PremiumFeatures";
import { usePremiumNFT } from "@/hooks/usePremiumNFT";

export function QRCodeGenerator() {
  // Check premium status with default values to prevent rendering errors
  const { isPremium = false, daysRemaining = 0 } = usePremiumNFT();
  // Download QR code as PNG (for both SVG and Canvas)
  // Download PNG from canvas
  const handleDownloadPNG = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qr-code.png';
      a.click();
    }
  };

  // Download SVG by serializing a hidden QRCodeSVG
  const svgHiddenRef = useRef<SVGSVGElement | null>(null);
  const handleDownloadSVG = () => {
    const svg = svgHiddenRef.current;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qr-code.svg';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };


  // Share QR code using Web Share API or fallback
  const handleShare = async () => {
    if (canvasRef.current) {
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
            handleDownloadPNG();
          }
        }
      }, 'image/png');
    }
  };


  const [qrType, setQrType] = useState<'text' | 'email'>('text');
  const [input, setInput] = useState("");
  const [email, setEmail] = useState("");
  const [qrValue, setQrValue] = useState("");

  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      let value = '';
      if (qrType === 'email') {
        value = email ? `mailto:${email}` : '';
      } else {
        value = input;
      }
      setQrValue(value);
      setLoading(false);
    }, 1000);
  };

  // Use theme-aware colors for QR background and foreground
  const bgColor = "#fff";
  const fgColor = "#0052ff";
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
    <Card 
      title={
        <div className="flex items-center gap-2">
          <span>QR Code Generator</span>
          {isPremium && daysRemaining !== null && (
            <span className="text-xs px-2 py-0.5 bg-[var(--app-accent)] text-white rounded-full">
              Premium ({daysRemaining}d)
            </span>
          )}
        </div>
      } 
      className="max-w-lg mx-auto animate-fade-in text-[var(--app-foreground)]">
      <motion.form
        onSubmit={handleGenerate}
        className="flex flex-col gap-4"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 80, damping: 14 }}
      >
        <div className="flex gap-2 items-center">
          <label className="text-xs text-[var(--app-foreground-muted)]">QR Type:</label>
          <div className="w-32">
            <Select value={qrType} onValueChange={v => setQrType(v as 'text' | 'email')}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {qrType === 'text' && (
          <input
            type="text"
            placeholder="Enter text or URL to encode"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="border border-[var(--app-card-border)] rounded-lg px-4 py-2 text-[var(--app-foreground)] bg-[var(--app-background)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] placeholder:text-[var(--app-foreground-muted)]"
            required
          />
        )}
        {qrType === 'email' && (
          <input
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border border-[var(--app-card-border)] rounded-lg px-4 py-2 text-[var(--app-foreground)] bg-[var(--app-background)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] placeholder:text-[var(--app-foreground-muted)]"
            required
          />
        )}

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
              <QRCodeCanvas
                ref={canvasRef}
                value={qrValue}
                title={qrValue}
                size={180}
                bgColor={bgColor}
                fgColor={fgColor}
                level="L"
                imageSettings={imageSettings}
                className="shadow-md rounded-lg border border-[var(--app-card-border)] p-4"
              />
              {/* Hidden SVG for download */}
              <div style={{position: 'absolute', left: '-9999px', top: 0, width: 0, height: 0, overflow: 'hidden'}} aria-hidden="true">
                <QRCodeSVG
                  ref={svgHiddenRef}
                  value={qrValue}
                  title={qrValue}
                  size={180}
                  bgColor={bgColor}
                  fgColor={fgColor}
                  level="L"
                  imageSettings={imageSettings}
                />
              </div>
              {/* Download and Share Buttons */}
              <div className="flex gap-3 mt-4">
                <Button variant="outline" size="sm" onClick={() => handleDownloadPNG()}>
                  Download PNG
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownloadSVG()}>
                  Download SVG
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleShare()}>
                  Share
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Premium Features */}
      <PremiumFeatures />
    </Card>
  );
}
