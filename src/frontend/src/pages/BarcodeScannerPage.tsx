import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  Camera,
  CameraOff,
  ClipboardCopy,
  FlipHorizontal,
  Loader2,
  QrCode,
  ScanLine,
  Trash2,
  WifiOff,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { useQRScanner } from "../qr-code/useQRScanner";

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function BarcodeScannerPage() {
  const {
    qrResults,
    isScanning,
    isActive,
    isSupported,
    error,
    isLoading,
    canStartScanning,
    startScanning,
    stopScanning,
    switchCamera,
    clearResults,
    videoRef,
    canvasRef,
  } = useQRScanner({ facingMode: "environment" });

  async function handleStartStop() {
    if (isScanning || isActive) {
      await stopScanning();
    } else {
      const ok = await startScanning();
      if (!ok) {
        toast.error("Could not start camera. Please allow camera access.");
      }
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Copied to clipboard!"))
      .catch(() => toast.error("Failed to copy"));
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-[oklch(0.42_0.18_265)] flex items-center justify-center">
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-[oklch(0.17_0.025_260)]">
              QR / Barcode Scanner
            </h1>
            <p className="text-xs text-[oklch(0.52_0.03_255)]">
              Scan QR codes and barcodes with your camera
            </p>
          </div>
        </div>
      </motion.div>

      {/* Camera Viewport */}
      <Card className="border-[oklch(0.92_0.015_250)] shadow-card rounded-2xl overflow-hidden">
        <div className="relative bg-[oklch(0.12_0.03_265)] aspect-video w-full">
          {/* Video element — always in DOM */}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isActive ? "opacity-100" : "opacity-0"
            }`}
          />
          {/* Hidden canvas for QR processing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Overlay states */}
          {!isActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
              {isLoading ? (
                <>
                  <Loader2 className="w-10 h-10 animate-spin opacity-70" />
                  <p className="text-sm opacity-70">Starting camera...</p>
                </>
              ) : isSupported === false ? (
                <>
                  <WifiOff className="w-10 h-10 opacity-50" />
                  <p className="text-sm opacity-70 text-center px-4">
                    Camera not supported on this device or browser.
                  </p>
                </>
              ) : error ? (
                <>
                  <AlertCircle className="w-10 h-10 text-red-400 opacity-80" />
                  <p className="text-sm text-red-300 text-center px-4">
                    {error.message}
                  </p>
                </>
              ) : (
                <>
                  <Camera className="w-12 h-12 opacity-30" />
                  <p className="text-sm opacity-50">
                    Press Start Scanning to begin
                  </p>
                </>
              )}
            </div>
          )}

          {/* Active scanning overlay */}
          {isActive && isScanning && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Corner brackets */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-48 h-48">
                  {/* Top-left */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white rounded-tl" />
                  {/* Top-right */}
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white rounded-tr" />
                  {/* Bottom-left */}
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white rounded-bl" />
                  {/* Bottom-right */}
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white rounded-br" />
                  {/* Scan line */}
                  <motion.div
                    className="absolute left-2 right-2 h-0.5 bg-[oklch(0.65_0.2_265)] shadow-lg shadow-[oklch(0.65_0.2_265)]"
                    animate={{ top: ["10%", "88%", "10%"] }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />
                </div>
              </div>

              {/* Status badge */}
              <div className="absolute top-3 left-3">
                <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-white text-xs font-medium">
                    Scanning...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <CardContent className="p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              onClick={handleStartStop}
              disabled={isLoading || isSupported === false}
              className={`flex-1 sm:flex-none gap-2 rounded-xl font-semibold ${
                isScanning || isActive
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-[oklch(0.42_0.18_265)] hover:bg-[oklch(0.38_0.18_265)] text-white"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Starting...
                </>
              ) : isScanning || isActive ? (
                <>
                  <CameraOff className="w-4 h-4" />
                  Stop Scanning
                </>
              ) : (
                <>
                  <ScanLine className="w-4 h-4" />
                  Start Scanning
                </>
              )}
            </Button>

            {isActive && (
              <Button
                variant="outline"
                onClick={switchCamera}
                className="gap-2 rounded-xl border-[oklch(0.88_0.02_250)]"
              >
                <FlipHorizontal className="w-4 h-4" />
                Flip Camera
              </Button>
            )}

            {qrResults.length > 0 && (
              <Button
                variant="outline"
                onClick={clearResults}
                className="gap-2 rounded-xl border-[oklch(0.88_0.02_250)] text-red-500 hover:text-red-600 hover:border-red-200"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>

          {!canStartScanning && !isLoading && isSupported !== false && (
            <p className="text-xs text-[oklch(0.55_0.03_255)] mt-2">
              Loading QR scanner library...{" "}
              <span className="inline-block animate-pulse">•</span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-base text-[oklch(0.17_0.025_260)]">
            Scan Results
          </h2>
          {qrResults.length > 0 && (
            <Badge
              variant="secondary"
              className="text-xs bg-[oklch(0.93_0.04_265)] text-[oklch(0.35_0.1_265)]"
            >
              {qrResults.length} result{qrResults.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        <AnimatePresence mode="popLayout">
          {qrResults.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="border-[oklch(0.92_0.015_250)] rounded-2xl">
                <CardContent className="p-10 text-center">
                  <QrCode className="w-10 h-10 text-[oklch(0.75_0.04_255)] mx-auto mb-3" />
                  <p className="text-[oklch(0.5_0.03_255)] text-sm font-medium">
                    No scans yet
                  </p>
                  <p className="text-[oklch(0.65_0.02_255)] text-xs mt-1">
                    Point your camera at a QR code or barcode to scan it
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            qrResults.map((result, index) => (
              <motion.div
                key={`${result.data}-${result.timestamp}`}
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, delay: index === 0 ? 0 : 0 }}
                className="mb-3"
              >
                <Card className="border-[oklch(0.92_0.015_250)] shadow-xs rounded-2xl overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <QrCode className="w-3.5 h-3.5 text-[oklch(0.42_0.18_265)] flex-shrink-0" />
                          <span className="text-xs text-[oklch(0.55_0.03_255)]">
                            {formatTimestamp(result.timestamp)}
                          </span>
                          {index === 0 && (
                            <Badge className="text-[10px] py-0 px-1.5 bg-[oklch(0.93_0.04_265)] text-[oklch(0.35_0.1_265)] border-0">
                              Latest
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-mono font-medium text-[oklch(0.2_0.03_260)] break-all leading-relaxed">
                          {result.data}
                        </p>
                        {/* Show as link if it looks like a URL */}
                        {(result.data.startsWith("http://") ||
                          result.data.startsWith("https://")) && (
                          <a
                            href={result.data}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[oklch(0.42_0.18_265)] hover:underline mt-1 inline-block"
                          >
                            Open link →
                          </a>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(result.data)}
                        className="flex-shrink-0 rounded-lg h-8 w-8 p-0 text-[oklch(0.55_0.03_255)] hover:text-[oklch(0.42_0.18_265)] hover:bg-[oklch(0.95_0.02_265)]"
                        aria-label="Copy to clipboard"
                      >
                        <ClipboardCopy className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
