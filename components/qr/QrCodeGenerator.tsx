"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Check, Copy, Download, MapPin, RotateCcw, Share2, Trash2, Upload, X } from "lucide-react";
import { countryCodes } from "@/lib/whatsapp/countries";
import { buildQrPayload, type QrFormData } from "@/lib/qr/payload";
import { addQrHistoryEntry, clearQrHistory, loadQrHistory, saveQrHistory } from "@/lib/qr/storage";
import type { QrErrorCorrection, QrHistoryEntry, QrSettings, QrType } from "@/lib/qr/types";
import AdSenseAd from "@/components/ads/AdSenseAd";
import { ADSENSE_SLOTS } from "@/lib/adsense";

const qrTypes: Array<{ value: QrType; label: string }> = [
  { value: "url", label: "Website URL" },
  { value: "text", label: "Plain text" },
  { value: "whatsapp", label: "WhatsApp link" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone number" },
  { value: "sms", label: "SMS" },
  { value: "wifi", label: "Wi-Fi" },
  { value: "vcard", label: "Contact card" },
  { value: "location", label: "Geographic location" },
  { value: "event", label: "Calendar event" },
  { value: "social", label: "Social media link" },
  { value: "payment", label: "Payment link" },
  { value: "custom", label: "Custom data" },
];

const defaultSettings: QrSettings = {
  size: 280,
  foreground: "#111111",
  background: "#ffffff",
  transparentBackground: false,
  errorCorrection: "M",
  margin: 2,
  moduleStyle: "square",
  cornerStyle: "square",
  title: "",
  instructions: "Scan this QR code",
  logo: "",
  logoPadding: true,
};

function makeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function relativeLuminance(hex: string) {
  const value = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return 1;
  const channels = [0, 2, 4].map((start) => {
    const channel = parseInt(value.slice(start, start + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(first: string, second: string) {
  const lighter = Math.max(relativeLuminance(first), relativeLuminance(second));
  const darker = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

function safeFilePart(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "qr-code";
}

export default function QrCodeGenerator() {
  const [qrType, setQrType] = useState<QrType>("url");
  const [formData, setFormData] = useState<QrFormData>({ countryIso: "NG", security: "WPA" });
  const [settings, setSettings] = useState<QrSettings>(defaultSettings);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [svgMarkup, setSvgMarkup] = useState("");
  const [history, setHistory] = useState<QrHistoryEntry[]>([]);
  const [notice, setNotice] = useState("");
  const [showWifiPassword, setShowWifiPassword] = useState(false);
  const [allowSensitiveSave, setAllowSensitiveSave] = useState(false);
  const [logoError, setLogoError] = useState("");
  const [locationStatus, setLocationStatus] = useState("");

  const result = useMemo(() => buildQrPayload(qrType, formData), [qrType, formData]);
  const hasErrors = Object.keys(result.errors).length > 0;
  const qrHasContrast = settings.transparentBackground || contrastRatio(settings.foreground, settings.background) >= 4.5;
  const effectiveCorrection: QrErrorCorrection = settings.logo ? "H" : settings.errorCorrection;

  useEffect(() => {
    setHistory(loadQrHistory());
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function renderQr() {
      if (!result.content || hasErrors || !qrHasContrast) {
        setQrDataUrl("");
        setSvgMarkup("");
        return;
      }

      try {
        const QRCode = await import("qrcode");
        const baseOptions = {
          width: settings.size,
          margin: settings.margin,
          errorCorrectionLevel: effectiveCorrection,
          color: {
            dark: settings.foreground,
            light: settings.transparentBackground ? "#00000000" : settings.background,
          },
        } as const;
        const dataUrl = await QRCode.toDataURL(result.content, baseOptions);
        const svg = await QRCode.toString(result.content, { ...baseOptions, type: "svg" });
        if (cancelled) return;

        if (settings.logo) {
          setQrDataUrl(await addLogoToQr(dataUrl, settings));
        } else {
          setQrDataUrl(dataUrl);
        }
        setSvgMarkup(svg);
      } catch {
        if (!cancelled) setNotice("QR code generation failed. Please try again.");
      }
    }

    renderQr();

    return () => {
      cancelled = true;
    };
  }, [effectiveCorrection, hasErrors, qrHasContrast, result.content, settings]);

  const updateData = (key: string, value: string | boolean) => setFormData((current) => ({ ...current, [key]: value }));
  const updateSettings = <K extends keyof QrSettings>(key: K, value: QrSettings[K]) => setSettings((current) => ({ ...current, [key]: value }));

  const showNotice = (value: string) => {
    setNotice(value);
    window.setTimeout(() => setNotice(""), 2500);
  };

  const copyText = async (value: string, label = "Copied") => {
    try {
      await navigator.clipboard.writeText(value);
      showNotice(label);
    } catch {
      showNotice("Copy failed. Select the content and copy it manually.");
    }
  };

  const copyImage = async () => {
    if (!qrDataUrl || !navigator.clipboard || typeof ClipboardItem === "undefined") {
      showNotice("Image copy is not supported in this browser.");
      return;
    }

    const blob = await (await fetch(qrDataUrl)).blob();
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    showNotice("QR image copied.");
  };

  const shareQr = async () => {
    if (!result.content) return;
    if (!navigator.share) {
      await copyText(result.content, "Sharing is unavailable, so the content was copied.");
      return;
    }

    try {
      await navigator.share({ title: settings.title || "QR code", text: result.content });
    } catch {
      showNotice("Share cancelled.");
    }
  };

  const downloadPng = async (scale = 1, transparent = settings.transparentBackground) => {
    if (!result.content || hasErrors || !qrHasContrast) {
      showNotice("Fix validation issues before downloading.");
      return;
    }

    const QRCode = await import("qrcode");
    const dataUrl = await QRCode.toDataURL(result.content, {
      width: settings.size * scale,
      margin: settings.margin,
      errorCorrectionLevel: effectiveCorrection,
      color: {
        dark: settings.foreground,
        light: transparent ? "#00000000" : settings.background,
      },
    });
    const finalUrl = settings.logo ? await addLogoToQr(dataUrl, { ...settings, size: settings.size * scale, transparentBackground: transparent }) : dataUrl;
    downloadDataUrl(finalUrl, `${safeFilePart(settings.title || qrType)}-${scale > 1 ? "high-res" : "standard"}.png`);
    showNotice("QR PNG downloaded.");
  };

  const downloadSvg = () => {
    if (!svgMarkup) {
      showNotice("Generate a valid QR code before downloading SVG.");
      return;
    }
    const blob = new Blob([svgMarkup], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    downloadUrl(url, `${safeFilePart(settings.title || qrType)}.svg`);
    URL.revokeObjectURL(url);
    showNotice("QR SVG downloaded.");
  };

  const saveCurrent = () => {
    if (!result.content || hasErrors) {
      showNotice("Fix validation issues before saving.");
      return;
    }
    if (result.isSensitive && !allowSensitiveSave) {
      showNotice("Enable sensitive local saving before saving this QR code.");
      return;
    }
    const { logo, ...settingsWithoutLogo } = settings;
    const next = addQrHistoryEntry({
      id: makeId(),
      type: qrType,
      title: settings.title || qrTypes.find((item) => item.value === qrType)?.label || "QR code",
      encodedContent: result.content,
      settings: settingsWithoutLogo,
      createdAt: new Date().toISOString(),
    });
    setHistory(next);
    showNotice("QR code saved to recent history.");
  };

  const loadHistory = (entry: QrHistoryEntry) => {
    setQrType(entry.type);
    setFormData({ text: entry.encodedContent, url: entry.encodedContent, countryIso: "NG", security: "WPA" });
    setSettings({ ...defaultSettings, ...entry.settings, logo: "" });
    showNotice("Saved QR loaded as custom content.");
  };

  const duplicateHistory = (entry: QrHistoryEntry) => {
    const next = addQrHistoryEntry({ ...entry, id: makeId(), title: `${entry.title} copy`, createdAt: new Date().toISOString() });
    setHistory(next);
  };

  const deleteHistory = (id: string) => {
    const next = history.filter((entry) => entry.id !== id);
    setHistory(next);
    saveQrHistory(next);
  };

  const reset = () => {
    if ((result.content || settings.title || settings.logo) && !window.confirm("Reset the QR generator? Recent history will stay saved.")) return;
    setQrType("url");
    setFormData({ countryIso: "NG", security: "WPA" });
    setSettings(defaultSettings);
    setAllowSensitiveSave(false);
  };

  const clearHistory = () => {
    if (!history.length || !window.confirm("Clear all QR history stored in this browser?")) return;
    clearQrHistory();
    setHistory([]);
  };

  const handleLogoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setLogoError("");
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(file.type)) {
      setLogoError("Upload PNG, JPG, JPEG, WebP or SVG.");
      return;
    }
    if (file.size > 600_000) {
      setLogoError("Logo must be 600KB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") updateSettings("logo", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const useLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported in this browser.");
      return;
    }
    setLocationStatus("Requesting location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateData("latitude", String(position.coords.latitude));
        updateData("longitude", String(position.coords.longitude));
        setLocationStatus("Location added.");
      },
      () => setLocationStatus("Location permission was denied or unavailable."),
    );
  };

  return (
    <>
      <section className="qr-no-print px-6 pb-8 pt-8 dark:bg-black md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-sm font-bold text-[#589037]">Free Tool</p>
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <h1 className="max-w-5xl text-5xl font-black leading-[0.95] tracking-[-0.06em] md:text-7xl">Free QR Code Generator</h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-neutral-500 dark:text-neutral-300">
                Create custom QR codes for websites, Wi-Fi, WhatsApp, email, contact cards, text and more. Customise and download as PNG or SVG.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <button onClick={saveCurrent} className="inline-flex items-center gap-3 rounded-full border border-black px-5 py-3 text-sm font-bold transition hover:bg-black hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-black">
                <Check size={17} />
                Save QR
              </button>
              <button onClick={reset} className="inline-flex items-center gap-3 rounded-full border border-black/20 px-5 py-3 text-sm font-bold transition hover:border-red-600 hover:text-red-600 dark:border-white/30">
                <RotateCcw size={17} />
                Reset
              </button>
            </div>
          </div>
          {notice && (
            <div className="mt-6 flex max-w-3xl items-start gap-3 rounded-2xl border border-black/10 bg-[#f7f7f4] p-4 text-sm dark:border-white/10 dark:bg-white/10" role="status" aria-live="polite">
              <Check size={18} className="mt-0.5 shrink-0 text-[#589037]" />
              <p>{notice}</p>
            </div>
          )}
        </div>
      </section>

      <AdSenseAd slot={ADSENSE_SLOTS.top} />

      <section className="px-3 pb-10 dark:bg-black">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2 lg:items-start">
          <div className="qr-no-print grid gap-5 rounded-[2rem] bg-white p-4 shadow-sm dark:bg-black md:p-6 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-3 lg:[scrollbar-gutter:stable]">
            <Panel title="QR content">
              <div className="grid gap-4">
                <SelectField id="qrType" label="QR-code type" value={qrType} onChange={(value) => setQrType(value as QrType)} options={qrTypes.map((item) => item.label)} optionValues={qrTypes.map((item) => item.value)} />
                <TextField id="title" label="Optional title" value={settings.title} onChange={(value) => updateSettings("title", value)} placeholder="Scan to visit our website" />
                <DynamicFields type={qrType} data={formData} update={updateData} errors={result.errors} showWifiPassword={showWifiPassword} setShowWifiPassword={setShowWifiPassword} useLocation={useLocation} locationStatus={locationStatus} />
                {result.isSensitive && (
                  <label className="flex items-start gap-3 rounded-[1.25rem] bg-[#f7f7f4] p-4 text-sm font-bold dark:bg-white/10">
                    <input type="checkbox" checked={allowSensitiveSave} onChange={(event) => setAllowSensitiveSave(event.target.checked)} className="mt-1" />
                    Allow this sensitive QR content to be saved in browser history
                  </label>
                )}
              </div>
            </Panel>

            <Panel title="Customisation">
              <div className="grid gap-4 md:grid-cols-2">
                <NumberField id="size" label="QR size" value={settings.size} onChange={(value) => updateSettings("size", Math.min(Math.max(value, 160), 900))} min="160" max="900" />
                <NumberField id="margin" label="Margin / quiet zone" value={settings.margin} onChange={(value) => updateSettings("margin", Math.min(Math.max(value, 0), 10))} min="0" max="10" />
                <ColorField id="foreground" label="Foreground colour" value={settings.foreground} onChange={(value) => updateSettings("foreground", value)} />
                <ColorField id="background" label="Background colour" value={settings.background} onChange={(value) => updateSettings("background", value)} disabled={settings.transparentBackground} />
                <SelectField id="errorCorrection" label="Error correction" value={effectiveCorrection} onChange={(value) => updateSettings("errorCorrection", value as QrErrorCorrection)} options={["Low", "Medium", "Quartile", "High"]} optionValues={["L", "M", "Q", "H"]} />
                <SelectField id="moduleStyle" label="Module style" value={settings.moduleStyle} onChange={(value) => updateSettings("moduleStyle", value as QrSettings["moduleStyle"])} options={["Square", "Rounded", "Dot"]} optionValues={["square", "rounded", "dot"]} />
                <SelectField id="cornerStyle" label="Corner style" value={settings.cornerStyle} onChange={(value) => updateSettings("cornerStyle", value as QrSettings["cornerStyle"])} options={["Square", "Rounded"]} optionValues={["square", "rounded"]} />
                <label className="flex items-start gap-3 rounded-[1.25rem] bg-[#f7f7f4] p-4 text-sm font-bold dark:bg-white/10">
                  <input type="checkbox" checked={settings.transparentBackground} onChange={(event) => updateSettings("transparentBackground", event.target.checked)} className="mt-1" />
                  Transparent background
                </label>
                {!qrHasContrast && <p className="md:col-span-2 text-xs leading-5 text-red-600">Choose stronger colour contrast so the QR code remains scannable.</p>}
                {settings.logo && <p className="md:col-span-2 text-xs leading-5 text-[#589037]">Logo detected: high error correction is automatically used. Test the QR before publishing.</p>}
                {settings.moduleStyle !== "square" || settings.cornerStyle !== "square" ? (
                  <p className="md:col-span-2 text-xs leading-5 text-neutral-500 dark:text-neutral-300">The current QR renderer exports reliable square-module QR codes. Style choices are saved for future compatible renderers.</p>
                ) : null}
              </div>
            </Panel>

            <Panel title="Logo and printable card">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-bold" htmlFor="logo">
                    Optional logo
                  </label>
                  <label className="mt-2 flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-black/20 bg-[#f7f7f4] px-4 py-3 text-sm transition hover:border-[#589037] dark:border-white/20 dark:bg-black">
                    <Upload size={17} />
                    Upload logo
                    <input id="logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleLogoUpload} className="sr-only" />
                  </label>
                  {logoError && <p className="mt-2 text-xs text-red-600">{logoError}</p>}
                </div>
                {settings.logo && (
                  <div className="flex items-center gap-3">
                    <img src={settings.logo} alt="QR logo preview" className="h-14 w-14 rounded-xl object-contain" />
                    <button type="button" onClick={() => updateSettings("logo", "")} className="inline-flex items-center gap-2 text-xs font-bold text-red-600">
                      <X size={14} />
                      Remove logo
                    </button>
                  </div>
                )}
                <label className="flex items-start gap-3 rounded-[1.25rem] bg-[#f7f7f4] p-4 text-sm font-bold dark:bg-white/10">
                  <input type="checkbox" checked={settings.logoPadding} onChange={(event) => updateSettings("logoPadding", event.target.checked)} className="mt-1" />
                  White padding behind logo
                </label>
                <TextField id="instructions" label="Instruction text" value={settings.instructions} onChange={(value) => updateSettings("instructions", value)} />
              </div>
            </Panel>

            <Panel title="Recent QR codes">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-neutral-500 dark:text-neutral-300">Saved only in this browser. Sensitive entries require explicit permission.</p>
                <button onClick={clearHistory} className="rounded-full border border-black/20 px-4 py-2 text-xs font-bold text-red-600 dark:border-white/20">
                  Clear history
                </button>
              </div>
              <div className="mt-5 grid gap-3">
                {history.length ? (
                  history.map((entry) => (
                    <article key={entry.id} className="rounded-[1.25rem] bg-[#f7f7f4] p-4 dark:bg-white/10">
                      <p className="font-black">{entry.title}</p>
                      <p className="mt-1 break-all text-xs text-neutral-500 dark:text-neutral-300">{entry.encodedContent}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button onClick={() => loadHistory(entry)} className="rounded-full border border-black/10 px-3 py-2 text-xs font-bold dark:border-white/10">Load</button>
                        <button onClick={() => duplicateHistory(entry)} className="rounded-full border border-black/10 px-3 py-2 text-xs font-bold dark:border-white/10">Duplicate</button>
                        <button onClick={() => deleteHistory(entry.id)} className="rounded-full border border-black/10 px-3 py-2 text-xs font-bold text-red-600 dark:border-white/10">Delete</button>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="rounded-[1.25rem] bg-[#f7f7f4] p-4 text-sm text-neutral-500 dark:bg-white/10 dark:text-neutral-300">No recent QR codes yet.</p>
                )}
              </div>
            </Panel>

            <div className="rounded-[1.5rem] bg-[#f7f7f4] p-5 text-sm leading-7 text-neutral-600 dark:bg-white/10 dark:text-neutral-300">
              Privacy note: QR data and uploaded logos are processed in this browser and are not uploaded to Anulen servers. This tool creates static QR
              codes, so downloaded destinations cannot be changed without creating a new code.
            </div>
          </div>

          <div className="qr-preview-scroll lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-3 lg:[scrollbar-gutter:stable]">
            <div className="rounded-[2rem] bg-white p-4 shadow-sm dark:bg-black md:p-6">
              <div className="qr-print-card rounded-[2rem] border border-black/5 bg-white p-6 text-black dark:border-white/10">
                <div className="mb-5">
                  <p className="text-sm font-bold text-[#589037]">{qrTypes.find((item) => item.value === qrType)?.label}</p>
                  <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">{settings.title || "QR code preview"}</h2>
                  <p className="mt-2 text-sm text-neutral-500">{settings.instructions}</p>
                </div>
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt={`QR code containing ${result.content}`} className="mx-auto max-w-full rounded-2xl bg-white p-3" style={{ width: Math.min(settings.size, 360) }} />
                ) : (
                  <div className="flex min-h-72 items-center justify-center rounded-[1.5rem] bg-[#f7f7f4] p-6 text-center text-sm text-neutral-500">
                    {hasErrors ? "Fix the highlighted fields to generate a QR code." : !qrHasContrast ? "Increase colour contrast to preview the QR code." : "Choose a QR type and enter content."}
                  </div>
                )}
              </div>

              <div className="qr-no-print mt-5 grid gap-4">
                {Object.values(result.errors).map((error) => (
                  <p key={error} className="rounded-2xl bg-red-50 p-4 text-sm text-red-600">
                    {error}
                  </p>
                ))}
                {result.content && (
                  <div className="rounded-[1.5rem] bg-[#f7f7f4] p-5 dark:bg-white/10">
                    <p className="mb-2 text-sm font-bold">Encoded content</p>
                    <p className="break-all text-xs leading-6 text-neutral-600 dark:text-neutral-300">{result.content}</p>
                    <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-300">Static QR code. Test it before publishing, especially when using logos, colours or print materials.</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => copyText(result.content, "Encoded content copied")} disabled={!result.content} className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-bold text-white disabled:opacity-40 dark:bg-white dark:text-black">
                    <Copy size={16} />
                    Copy content
                  </button>
                  <button onClick={copyImage} disabled={!qrDataUrl} className="inline-flex items-center gap-2 rounded-full border border-black px-5 py-3 text-sm font-bold disabled:opacity-40 dark:border-white">
                    <Copy size={16} />
                    Copy image
                  </button>
                  <button onClick={shareQr} disabled={!result.content} className="inline-flex items-center gap-2 rounded-full border border-black px-5 py-3 text-sm font-bold disabled:opacity-40 dark:border-white">
                    <Share2 size={16} />
                    Share
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => downloadPng()} className="inline-flex items-center gap-2 rounded-full border border-black px-5 py-3 text-sm font-bold dark:border-white">
                    <Download size={16} />
                    PNG
                  </button>
                  <button onClick={() => downloadPng(3)} className="inline-flex items-center gap-2 rounded-full border border-black px-5 py-3 text-sm font-bold dark:border-white">
                    <Download size={16} />
                    High-res PNG
                  </button>
                  <button onClick={() => downloadPng(3, true)} className="inline-flex items-center gap-2 rounded-full border border-black px-5 py-3 text-sm font-bold dark:border-white">
                    <Download size={16} />
                    Transparent PNG
                  </button>
                  <button onClick={downloadSvg} className="inline-flex items-center gap-2 rounded-full border border-black px-5 py-3 text-sm font-bold dark:border-white">
                    <Download size={16} />
                    SVG
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AdSenseAd slot={ADSENSE_SLOTS.middle} />
    </>
  );
}

const inputClass =
  "mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f7f4] px-4 py-3 text-sm outline-none transition focus:border-[#589037] focus:ring-2 focus:ring-[#589037]/20 dark:border-white/10 dark:bg-black dark:text-white dark:placeholder:text-neutral-500";

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.5rem] border border-black/5 bg-white p-5 dark:border-white/10 dark:bg-black">
      <h2 className="mb-5 text-2xl font-black tracking-[-0.04em]">{title}</h2>
      {children}
    </section>
  );
}

function DynamicFields({
  type,
  data,
  update,
  errors,
  showWifiPassword,
  setShowWifiPassword,
  useLocation,
  locationStatus,
}: {
  type: QrType;
  data: QrFormData;
  update: (key: string, value: string | boolean) => void;
  errors: Record<string, string>;
  showWifiPassword: boolean;
  setShowWifiPassword: (value: boolean) => void;
  useLocation: () => void;
  locationStatus: string;
}) {
  const field = (key: string) => (typeof data[key] === "string" ? (data[key] as string) : "");

  if (["url", "social", "payment"].includes(type)) return <TextField id="url" label={type === "url" ? "Website URL" : type === "payment" ? "Payment link" : "Social media link"} value={field("url")} onChange={(value) => update("url", value)} error={errors.url} placeholder="https://anulen.com" />;
  if (type === "text" || type === "custom") return <TextareaField id="text" label={type === "text" ? "Plain text" : "Custom data"} value={field("text")} onChange={(value) => update("text", value)} error={errors.text} />;
  if (type === "whatsapp") return <PhoneFields data={data} update={update} errors={errors} message />;
  if (type === "phone") return <PhoneFields data={data} update={update} errors={errors} />;
  if (type === "sms") return <PhoneFields data={data} update={update} errors={errors} message sms />;
  if (type === "email")
    return (
      <div className="grid gap-4">
        <TextField id="email" label="Recipient email" value={field("email")} onChange={(value) => update("email", value)} error={errors.email} placeholder="hello@example.com" />
        <TextField id="subject" label="Subject" value={field("subject")} onChange={(value) => update("subject", value)} />
        <TextareaField id="body" label="Message body" value={field("body")} onChange={(value) => update("body", value)} />
      </div>
    );
  if (type === "wifi")
    return (
      <div className="grid gap-4">
        <TextField id="ssid" label="Network name / SSID" value={field("ssid")} onChange={(value) => update("ssid", value)} error={errors.ssid} />
        <SelectField id="security" label="Security" value={field("security") || "WPA"} onChange={(value) => update("security", value)} options={["WPA/WPA2", "WEP", "Open network"]} optionValues={["WPA", "WEP", "nopass"]} />
        {field("security") !== "nopass" && <TextField id="password" label="Password" value={field("password")} onChange={(value) => update("password", value)} type={showWifiPassword ? "text" : "password"} />}
        <label className="flex items-center gap-3 rounded-2xl bg-[#f7f7f4] p-4 text-sm font-bold dark:bg-white/10">
          <input type="checkbox" checked={showWifiPassword} onChange={(event) => setShowWifiPassword(event.target.checked)} />
          Show password
        </label>
        <label className="flex items-center gap-3 rounded-2xl bg-[#f7f7f4] p-4 text-sm font-bold dark:bg-white/10">
          <input type="checkbox" checked={data.hidden === true} onChange={(event) => update("hidden", event.target.checked)} />
          Hidden network
        </label>
      </div>
    );
  if (type === "vcard")
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <TextField id="fullName" label="Full name" value={field("fullName")} onChange={(value) => update("fullName", value)} error={errors.fullName} />
        <TextField id="company" label="Company" value={field("company")} onChange={(value) => update("company", value)} />
        <TextField id="jobTitle" label="Job title" value={field("jobTitle")} onChange={(value) => update("jobTitle", value)} />
        <TextField id="phone" label="Phone" value={field("phone")} onChange={(value) => update("phone", value)} />
        <TextField id="email" label="Email" value={field("email")} onChange={(value) => update("email", value)} />
        <TextField id="website" label="Website" value={field("website")} onChange={(value) => update("website", value)} />
        <div className="md:col-span-2">
          <TextareaField id="address" label="Address" value={field("address")} onChange={(value) => update("address", value)} />
        </div>
      </div>
    );
  if (type === "location")
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <TextField id="latitude" label="Latitude" value={field("latitude")} onChange={(value) => update("latitude", value)} error={errors.location} />
        <TextField id="longitude" label="Longitude" value={field("longitude")} onChange={(value) => update("longitude", value)} />
        <button onClick={useLocation} type="button" className="inline-flex items-center justify-center gap-2 rounded-full border border-black px-5 py-3 text-sm font-bold dark:border-white">
          <MapPin size={16} />
          Use my location
        </button>
        {locationStatus && <p className="text-sm text-neutral-500 dark:text-neutral-300">{locationStatus}</p>}
      </div>
    );
  if (type === "event")
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <TextField id="eventTitle" label="Event title" value={field("eventTitle")} onChange={(value) => update("eventTitle", value)} error={errors.eventTitle} />
        <TextField id="eventLocation" label="Location" value={field("eventLocation")} onChange={(value) => update("eventLocation", value)} />
        <TextField id="startDate" label="Start date and time" value={field("startDate")} onChange={(value) => update("startDate", value)} type="datetime-local" error={errors.startDate} />
        <TextField id="endDate" label="End date and time" value={field("endDate")} onChange={(value) => update("endDate", value)} type="datetime-local" error={errors.endDate} />
        <div className="md:col-span-2">
          <TextareaField id="description" label="Description" value={field("description")} onChange={(value) => update("description", value)} />
        </div>
      </div>
    );
  return null;
}

function PhoneFields({ data, update, errors, message, sms }: { data: QrFormData; update: (key: string, value: string | boolean) => void; errors: Record<string, string>; message?: boolean; sms?: boolean }) {
  const field = (key: string) => (typeof data[key] === "string" ? (data[key] as string) : "");
  return (
    <div className="grid gap-4">
      <SelectField id="countryIso" label="Country" value={field("countryIso") || "NG"} onChange={(value) => update("countryIso", value)} options={countryCodes.map((country) => `${country.name} +${country.code}`)} optionValues={countryCodes.map((country) => country.iso)} />
      <TextField id="phoneNumber" label="Phone number" value={field("phoneNumber")} onChange={(value) => update("phoneNumber", value)} error={errors.phoneNumber} placeholder="0801 234 5678" />
      {message && <TextareaField id="message" label={sms ? "SMS message" : "Pre-filled WhatsApp message"} value={field("message")} onChange={(value) => update("message", value)} />}
    </div>
  );
}

function TextField({ id, label, value, onChange, error, placeholder, type = "text" }: { id: string; label: string; value: string; onChange: (value: string) => void; error?: string; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-bold" htmlFor={id}>
        {label}
      </label>
      <input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} placeholder={placeholder} />
      {error && <p className="mt-2 text-xs leading-5 text-red-600">{error}</p>}
    </div>
  );
}

function TextareaField({ id, label, value, onChange, error }: { id: string; label: string; value: string; onChange: (value: string) => void; error?: string }) {
  return (
    <div>
      <label className="block text-sm font-bold" htmlFor={id}>
        {label}
      </label>
      <textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} className={`${inputClass} min-h-28 resize-y`} placeholder="Enter content" />
      {error && <p className="mt-2 text-xs leading-5 text-red-600">{error}</p>}
    </div>
  );
}

function NumberField({ id, label, value, onChange, min, max }: { id: string; label: string; value: number; onChange: (value: number) => void; min?: string; max?: string }) {
  return (
    <div>
      <label className="block text-sm font-bold" htmlFor={id}>
        {label}
      </label>
      <input id={id} type="number" value={value} min={min} max={max} onChange={(event) => onChange(Number.isFinite(Number(event.target.value)) ? Number(event.target.value) : 0)} className={inputClass} />
    </div>
  );
}

function ColorField({ id, label, value, onChange, disabled }: { id: string; label: string; value: string; onChange: (value: string) => void; disabled?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-bold" htmlFor={id}>
        {label}
      </label>
      <input id={id} type="color" value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} className="mt-2 h-12 w-full cursor-pointer rounded-2xl border border-black/10 bg-[#f7f7f4] p-1 disabled:opacity-40 dark:border-white/10 dark:bg-black" />
    </div>
  );
}

function SelectField({ id, label, value, onChange, options, optionValues }: { id: string; label: string; value: string; onChange: (value: string) => void; options: string[]; optionValues?: string[] }) {
  return (
    <div>
      <label className="block text-sm font-bold" htmlFor={id}>
        {label}
      </label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={inputClass}>
        {options.map((option, index) => (
          <option key={optionValues?.[index] || option} value={optionValues?.[index] || option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function downloadUrl(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

async function addLogoToQr(qrDataUrl: string, settings: QrSettings) {
  const canvas = document.createElement("canvas");
  canvas.width = settings.size;
  canvas.height = settings.size;
  const context = canvas.getContext("2d");
  if (!context) return qrDataUrl;

  const qrImage = await loadImage(qrDataUrl);
  context.drawImage(qrImage, 0, 0, settings.size, settings.size);

  const logoImage = await loadImage(settings.logo);
  const logoSize = Math.round(settings.size * 0.18);
  const logoX = (settings.size - logoSize) / 2;
  const logoY = (settings.size - logoSize) / 2;
  if (settings.logoPadding) {
    context.fillStyle = "#ffffff";
    context.fillRect(logoX - 8, logoY - 8, logoSize + 16, logoSize + 16);
  }
  context.drawImage(logoImage, logoX, logoY, logoSize, logoSize);

  return canvas.toDataURL("image/png");
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}
