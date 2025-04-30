"use client";

import { useRef, useState, useEffect } from "react";
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
import Image from "next/image";

export function QRCodeGenerator() {
  // Check premium status with default values to prevent rendering errors
  const { isPremium = false, daysRemaining = 0 } = usePremiumNFT();
  
  // Premium feature states
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  // We don't need to track the File object separately since we only use the data URL
  const [qrStyle, setQrStyle] = useState("squares");
  const [qrColor, setQrColor] = useState("#0052ff");
  const [bulkUrls, setBulkUrls] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [generatedQRs, setGeneratedQRs] = useState<{url: string, dataUrl: string}[]>([]);
  
  // Analytics state for premium users
  const [analytics, setAnalytics] = useState<{
    generated: number;
    downloaded: number;
    shared: number;
  }>({
    generated: 0,
    downloaded: 0,
    shared: 0,
  });
  
  // Load analytics from localStorage on component mount
  useEffect(() => {
    if (isPremium) {
      const savedAnalytics = localStorage.getItem('qr-analytics');
      if (savedAnalytics) {
        try {
          setAnalytics(JSON.parse(savedAnalytics));
        } catch (error) {
          console.error('Error parsing analytics from localStorage:', error);
        }
      }
    }
  }, [isPremium]);
  
  // Save analytics to localStorage whenever they change
  useEffect(() => {
    if (isPremium) {
      localStorage.setItem('qr-analytics', JSON.stringify(analytics));
    }
  }, [analytics, isPremium]);
  
  // Helper function to update analytics
  const updateAnalytics = (key: 'generated' | 'downloaded' | 'shared', increment: number = 1) => {
    if (isPremium) {
      setAnalytics(prev => ({
        ...prev,
        [key]: prev[key] + increment
      }));
    }
  };

  // Download QR code as PNG (for both SVG and Canvas)
  // Download PNG from canvas
  const handleDownloadPNG = () => {
    if (canvasRef.current && qrValue) {
      const canvas = canvasRef.current;
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "qrcode.png";
      link.href = url;
      link.click();
      
      // Track download in analytics
      updateAnalytics('downloaded');
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
    
    // Track download in analytics
    updateAnalytics('downloaded');
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
              
              // Track share in analytics
              updateAnalytics('shared');
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

  // Function to generate a single QR code
  const generateSingleQR = (value: string) => {
    setQrValue(value);
    
    // Track generation in analytics
    updateAnalytics('generated');
  };
  
  // Function to handle bulk generation for premium users
  const handleBulkGenerate = async () => {
    if (!isPremium || !bulkUrls.length) return;
    
    setLoading(true);
    const results: {url: string, dataUrl: string}[] = [];
    
    // Use QRCode.toDataURL from qrcode.react
    const QRCode = await import('qrcode');
    
    // Process each URL (up to 10)
    const urlsToProcess = bulkUrls.slice(0, 10);
    
    for (const url of urlsToProcess) {
      try {
        // Generate QR code as data URL
        const dataUrl = await QRCode.toDataURL(url, {
          width: 256,
          margin: 1,
          color: {
            dark: fgColor,
            light: bgColor
          },
          errorCorrectionLevel: 'H'
        });
        
        results.push({
          url,
          dataUrl
        });
      } catch (error) {
        console.error(`Error generating QR code for ${url}:`, error);
      }
    }
    
    setGeneratedQRs(results);
    setLoading(false);
    
    // Track bulk generation in analytics
    updateAnalytics('generated', results.length);
  };
  
  // Main form submission handler
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      // For bulk mode (premium only)
      if (isPremium && bulkMode) {
        handleBulkGenerate();
        return;
      }
      
      // For single QR code generation
      let value = '';
      if (qrType === 'email') {
        value = email ? `mailto:${email}` : '';
      } else {
        value = input;
      }
      
      generateSingleQR(value);
      setLoading(false);
    }, 1000);
  };

  // Use theme-aware colors for QR background and foreground
  const bgColor = "#fff";
  // Use custom color for premium users, default for free users
  const fgColor = isPremium ? qrColor : "#0052ff";
  
  // Handle custom logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    
    // Convert file to data URL for display and use in QR code
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCustomLogo(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };
  
  // Logo settings for QR code
  // For premium users: use custom logo if uploaded, otherwise use default for URLs
  // For free users: only show logo for URLs
  const showDefaultLogo = !isPremium && /^https?:\/\//.test(qrValue);
  const imageSettings = isPremium && customLogo
    ? {
        src: customLogo,
        height: 40,
        width: 40,
        excavate: true,
      }
    : showDefaultLogo
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
        {/* QR Type Selection */}
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
          
          {/* Premium Mode Toggle */}
          {isPremium && (
            <div className="ml-auto flex items-center gap-2">
              <label className="text-xs text-[var(--app-foreground-muted)]">Bulk Mode:</label>
              <div className="relative inline-block w-10 h-5 rounded-full bg-[var(--app-card-border)]">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={bulkMode}
                  onChange={() => setBulkMode(!bulkMode)}
                />
                <div 
                  className={`absolute left-0.5 top-0.5 w-4 h-4 rounded-full transition-transform ${bulkMode ? 'transform translate-x-5 bg-[var(--app-accent)]' : 'bg-white'}`}
                  onClick={() => setBulkMode(!bulkMode)}
                ></div>
              </div>
            </div>
          )}
        </div>
        
        {/* Premium Features: Custom Styling */}
        {isPremium && (
          <div className="flex flex-wrap gap-4 p-3 border border-[var(--app-card-border)] rounded-lg bg-[var(--app-background-subtle)]">
            <div className="w-full">
              <h4 className="text-sm font-medium mb-2">Premium Options</h4>
            </div>
            
            {/* Custom Logo Upload */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[var(--app-foreground-muted)]">Custom Logo:</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleLogoUpload}
                className="text-xs"
              />
            </div>
            
            {/* QR Color Picker */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[var(--app-foreground-muted)]">QR Color:</label>
              <input 
                type="color" 
                value={qrColor}
                onChange={(e) => setQrColor(e.target.value)}
                className="w-10 h-6"
              />
            </div>
            
            {/* QR Style Selection */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[var(--app-foreground-muted)]">QR Style:</label>
              <Select value={qrStyle} onValueChange={setQrStyle}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="squares">Squares</SelectItem>
                  <SelectItem value="dots">Dots</SelectItem>
                  <SelectItem value="rounded">Rounded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        {/* Standard Single QR Input Fields */}
        {!bulkMode && qrType === 'text' && (
          <input
            type="text"
            placeholder="Enter text or URL to encode"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="border border-[var(--app-card-border)] rounded-lg px-4 py-2 text-[var(--app-foreground)] bg-[var(--app-background)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] placeholder:text-[var(--app-foreground-muted)]"
            required
          />
        )}
        {!bulkMode && qrType === 'email' && (
          <input
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border border-[var(--app-card-border)] rounded-lg px-4 py-2 text-[var(--app-foreground)] bg-[var(--app-background)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] placeholder:text-[var(--app-foreground-muted)]"
            required
          />
        )}
        
        {/* Bulk Generation UI (Premium Only) */}
        {isPremium && bulkMode && (
          <div className="flex flex-col gap-2">
            <textarea
              placeholder="Enter URLs or text (one per line)"
              value={bulkUrls.join('\n')}
              onChange={e => setBulkUrls(e.target.value.split('\n').filter(url => url.trim()))}
              className="border border-[var(--app-card-border)] rounded-lg px-4 py-2 text-[var(--app-foreground)] bg-[var(--app-background)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] placeholder:text-[var(--app-foreground-muted)] min-h-[100px]"
              required
            />
            <p className="text-xs text-[var(--app-foreground-muted)]">
              Enter one URL or text per line. Up to 10 QR codes will be generated at once.
            </p>
          </div>
        )}
        
        {/* Analytics Display for Premium Users */}
        {isPremium && (
          <div className="flex justify-between text-xs text-[var(--app-foreground-muted)] mt-1 mb-2">
            <div>Generated: {analytics.generated}</div>
            <div>Downloaded: {analytics.downloaded}</div>
            <div>Shared: {analytics.shared}</div>
          </div>
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
      <div className="flex flex-col items-center mt-6">
        <AnimatePresence>
          {/* Single QR Code Display */}
          {qrValue && !loading && !bulkMode && (
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
                level="H"
                imageSettings={imageSettings}
                className={`shadow-md rounded-lg border border-[var(--app-card-border)] p-4 ${isPremium ? `qr-style-${qrStyle}` : ''}`}
              />
              {/* Hidden SVG for download */}
              <div style={{position: 'absolute', left: '-9999px', top: 0, width: 0, height: 0, overflow: 'hidden'}} aria-hidden="true">
                <QRCodeSVG
                  ref={svgHiddenRef}
                  value={qrValue}
                  title={qrValue}
                  size={1024}
                  bgColor={bgColor}
                  fgColor={fgColor}
                  level="H"
                  imageSettings={imageSettings}
                />
              </div>
              
              {/* Add custom styling for premium QR code styles */}
              {isPremium && (
                <style jsx global>{`
                  /* Rounded style */
                  .qr-style-rounded canvas {
                    border-radius: 12px;
                  }
                  .qr-style-rounded path {
                    border-radius: 4px;
                  }
                  
                  /* Dots style */
                  .qr-style-dots canvas {
                    --qr-module-size: 6px;
                  }
                  .qr-style-dots canvas > path {
                    transform: scale(0.85);
                    rx: 50%;
                    ry: 50%;
                  }
                  
                  /* Custom styling for all premium QR codes */
                  .qr-style-squares canvas,
                  .qr-style-dots canvas,
                  .qr-style-rounded canvas {
                    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
                  }
                `}</style>
              )}
            </motion.div>
          )}
          
          {/* Bulk QR Code Display (Premium Only) */}
          {isPremium && bulkMode && generatedQRs.length > 0 && !loading && (
            <motion.div
              key="bulk-qr"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="w-full"
            >
              <h3 className="text-lg font-medium mb-4 text-center">Generated QR Codes</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {generatedQRs.map((qr, index) => (
                  <div key={index} className="flex flex-col items-center p-2 border border-[var(--app-card-border)] rounded-lg">
                    <Image 
                      src={qr.dataUrl} 
                      alt={`QR Code for ${qr.url}`}
                      height={120}
                      width={120}
                      className="w-full max-w-[120px] h-auto mb-2"
                    />
                    <p className="text-xs text-[var(--app-foreground-muted)] truncate w-full text-center">
                      {qr.url.length > 20 ? qr.url.substring(0, 20) + '...' : qr.url}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 text-xs py-1 h-7"
                      onClick={() => {
                        // Download this specific QR code
                        const a = document.createElement('a');
                        a.href = qr.dataUrl;
                        a.download = `qr-code-${index + 1}.png`;
                        a.click();
                        
                        // Track download in analytics
                        setAnalytics(prev => ({
                          ...prev,
                          downloaded: prev.downloaded + 1
                        }));
                      }}
                    >
                      Download
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Download all QR codes as a zip file
                    // For simplicity, we'll just download them individually
                    generatedQRs.forEach((qr, index) => {
                      const a = document.createElement('a');
                      a.href = qr.dataUrl;
                      a.download = `qr-code-${index + 1}.png`;
                      a.click();
                    });
                    
                    // Track downloads in analytics
                    setAnalytics(prev => ({
                      ...prev,
                      downloaded: prev.downloaded + generatedQRs.length
                    }));
                  }}
                >
                  Download All
                </Button>
              </div>
            </motion.div>
          )}
          
          {/* Download and Share Buttons for Single QR */}
          {qrValue && !loading && !bulkMode && (
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
          )}
        </AnimatePresence>
      </div>
      
      {/* Premium Features */}
      <PremiumFeatures />
    </Card>
  );
}
