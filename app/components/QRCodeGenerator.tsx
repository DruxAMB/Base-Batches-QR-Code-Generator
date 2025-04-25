"use client";

import { useState } from "react";
import { Card } from "./DemoComponents";
import { Button } from "./DemoComponents";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";

export function QRCodeGenerator() {
  const [input, setInput] = useState("");
  const [qrValue, setQrValue] = useState("");
  const [renderer, setRenderer] = useState<'svg' | 'canvas'>("svg");

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setQrValue(input);
  };

  // Use Base brand colors
  const bgColor = "#ffffff";
  const fgColor = "#0052FF";
  // Show logo only if value looks like a URL
  const showLogo = /^https?:\/\//.test(qrValue);
  const imageSettings = showLogo
    ? {
        src: "https://static.zpao.com/favicon.png",
        height: 32,
        width: 32,
        excavate: true,
      }
    : undefined;

  return (
    <Card title="QR Code Generator" className="max-w-lg mx-auto animate-fade-in">
      <form onSubmit={handleGenerate} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Enter text or URL to encode"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="border border-[var(--app-card-border)] rounded-lg px-4 py-2 text-[var(--app-foreground)] bg-[var(--app-background)] focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
          required
        />
        <div className="flex gap-2 items-center">
          <label className="text-xs text-[var(--app-foreground-muted)]">Renderer:</label>
          <Button
            type="button"
            size="sm"
            variant={renderer === 'svg' ? 'primary' : 'outline'}
            onClick={() => setRenderer('svg')}
            className="px-3"
          >
            SVG
          </Button>
          <Button
            type="button"
            size="sm"
            variant={renderer === 'canvas' ? 'primary' : 'outline'}
            onClick={() => setRenderer('canvas')}
            className="px-3"
          >
            Canvas
          </Button>
        </div>
        <Button type="submit" variant="primary" size="md">
          Generate QR Code
        </Button>
      </form>
      <div className="flex flex-col items-center mt-6">
        {qrValue && (
          renderer === 'svg' ? (
            <QRCodeSVG
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
              value={qrValue}
              title={qrValue}
              size={180}
              bgColor={bgColor}
              fgColor={fgColor}
              level="L"
              imageSettings={imageSettings}
              className="shadow-md rounded-lg border border-[var(--app-card-border)] bg-[var(--app-background)] p-4"
            />
          )
        )}
      </div>
    </Card>
  );
}
