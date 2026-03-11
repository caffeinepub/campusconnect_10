import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Share, X } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Shared state so both the banner and the sidebar button can share the prompt
let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners: Array<(p: BeforeInstallPromptEvent | null) => void> = [];

function subscribe(fn: (p: BeforeInstallPromptEvent | null) => void) {
  listeners.push(fn);
  return () => {
    const i = listeners.indexOf(fn);
    if (i !== -1) listeners.splice(i, 1);
  };
}

function notify(p: BeforeInstallPromptEvent | null) {
  deferredPrompt = p;
  for (const fn of listeners) fn(p);
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    notify(e as BeforeInstallPromptEvent);
  });
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/** Bottom banner that appears only when Chrome fires beforeinstallprompt */
export function InstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(
    deferredPrompt,
  );
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }
    const unsub = subscribe(setPrompt);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return unsub;
  }, []);

  if (installed || dismissed || !prompt) return null;

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    notify(null);
  };

  return (
    <div
      data-ocid="install.banner"
      className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-primary text-primary-foreground flex items-center gap-3 shadow-lg"
    >
      <Download className="w-5 h-5 shrink-0" />
      <p className="flex-1 text-sm font-medium">
        Install campusX as an app on your phone
      </p>
      <Button
        data-ocid="install.primary_button"
        size="sm"
        variant="secondary"
        className="shrink-0 font-semibold"
        onClick={handleInstall}
      >
        Install
      </Button>
      <button
        type="button"
        data-ocid="install.close_button"
        onClick={() => setDismissed(true)}
        className="shrink-0 opacity-80 hover:opacity-100"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/** Install button for the sidebar — always shown (unless already installed) */
export function InstallSidebarButton() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(
    deferredPrompt,
  );
  const [standalone, setStandalone] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setStandalone(true);
      return;
    }
    const unsub = subscribe(setPrompt);
    window.addEventListener("appinstalled", () => setStandalone(true));
    return unsub;
  }, []);

  if (standalone) return null;

  const handleClick = async () => {
    if (prompt) {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") setStandalone(true);
      notify(null);
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        type="button"
        data-ocid="install.sidebar_button"
        onClick={handleClick}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
      >
        <Download className="flex-shrink-0" size={17} />
        Install App
      </button>

      <Dialog open={showGuide} onOpenChange={setShowGuide}>
        <DialogContent data-ocid="install.dialog" className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Install campusX</DialogTitle>
          </DialogHeader>
          {isIOS() ? (
            <div className="space-y-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">
                To install on iPhone / iPad:
              </p>
              <ol className="space-y-3 list-none">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary mt-0.5">1.</span>
                  Open this page in{" "}
                  <strong className="text-foreground">Safari</strong> (not
                  Chrome).
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary mt-0.5">2.</span>
                  Tap the{" "}
                  <span className="inline-flex items-center gap-1">
                    <Share className="w-4 h-4 text-blue-500" />
                    <strong className="text-foreground">Share</strong>
                  </span>{" "}
                  button at the bottom of Safari.
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary mt-0.5">3.</span>
                  Scroll down and tap{" "}
                  <strong className="text-foreground">
                    "Add to Home Screen"
                  </strong>
                  .
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary mt-0.5">4.</span>
                  Tap <strong className="text-foreground">Add</strong> — done!
                </li>
              </ol>
            </div>
          ) : (
            <div className="space-y-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">
                To install on Android:
              </p>
              <ol className="space-y-3 list-none">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary mt-0.5">1.</span>
                  Open this page in{" "}
                  <strong className="text-foreground">Chrome</strong>.
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary mt-0.5">2.</span>
                  Tap the{" "}
                  <strong className="text-foreground">3-dot menu</strong> (top
                  right).
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary mt-0.5">3.</span>
                  Tap{" "}
                  <strong className="text-foreground">
                    "Add to Home screen"
                  </strong>
                  .
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary mt-0.5">4.</span>
                  Tap <strong className="text-foreground">Add</strong> — done!
                </li>
              </ol>
              <p className="text-xs">
                On some Android devices Chrome may also show an automatic
                install banner at the bottom of the screen.
              </p>
            </div>
          )}
          <Button
            data-ocid="install.close_button"
            onClick={() => setShowGuide(false)}
            className="w-full mt-2"
          >
            Got it
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
