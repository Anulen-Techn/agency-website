"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Download, ExternalLink, QrCode, RotateCcw, Share2, Star, Trash2 } from "lucide-react";
import { countryCodes, type CountryCode } from "@/lib/whatsapp/countries";
import { generateWhatsAppLink, linkDisplayFormats, normalizeInternationalNumber, validateWhatsAppLinkInput } from "@/lib/whatsapp/link";
import { addWhatsAppHistoryEntry, clearWhatsAppHistory, loadWhatsAppHistory, saveWhatsAppHistory } from "@/lib/whatsapp/storage";
import { whatsappTemplates } from "@/lib/whatsapp/templates";
import type { RecentWhatsAppLink } from "@/lib/whatsapp/types";
import AdSenseAd from "@/components/ads/AdSenseAd";
import { ADSENSE_SLOTS } from "@/lib/adsense";

const defaultCountry = countryCodes[0];
const placeholderNames = ["name", "product", "service", "order_number", "date", "business_name"];

function makeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function readableDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
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

export default function WhatsAppLinkGenerator() {
  const [country, setCountry] = useState<CountryCode>(defaultCountry);
  const [countrySearch, setCountrySearch] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [label, setLabel] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});
  const [ctaText, setCtaText] = useState("Chat with us on WhatsApp");
  const [buttonSize, setButtonSize] = useState("medium");
  const [buttonRounded, setButtonRounded] = useState(true);
  const [buttonIcon, setButtonIcon] = useState(true);
  const [buttonNewTab, setButtonNewTab] = useState(true);
  const [qrSize, setQrSize] = useState(260);
  const [qrForeground, setQrForeground] = useState("#111111");
  const [qrBackground, setQrBackground] = useState("#ffffff");
  const [qrMargin, setQrMargin] = useState(2);
  const [qrLabel, setQrLabel] = useState("Scan to chat on WhatsApp");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [history, setHistory] = useState<RecentWhatsAppLink[]>([]);
  const [notice, setNotice] = useState("");
  const [copiedKey, setCopiedKey] = useState("");
  const [errors, setErrors] = useState(validateWhatsAppLinkInput({ country, phoneNumber, message }));

  const generated = useMemo(() => generateWhatsAppLink({ country, phoneNumber, message }), [country, phoneNumber, message]);
  const validation = useMemo(() => validateWhatsAppLinkInput({ country, phoneNumber, message }), [country, phoneNumber, message]);
  const canUseResult = !validation.phoneNumber && phoneNumber.trim();
  const formats = useMemo(() => linkDisplayFormats(generated.link, ctaText), [generated.link, ctaText]);
  const qrHasReadableContrast = contrastRatio(qrForeground, qrBackground) >= 4.5;
  const filteredCountries = useMemo(() => {
    const query = countrySearch.trim().toLowerCase();
    if (!query) return countryCodes;

    return countryCodes.filter((item) => `${item.name} ${item.iso} +${item.code}`.toLowerCase().includes(query));
  }, [countrySearch]);
  const selectedTemplate = whatsappTemplates.find((template) => template.id === templateId);
  const usedPlaceholders = placeholderNames.filter((name) => message.includes(`{{${name}}}`));

  const buttonPadding = buttonSize === "small" ? "8px 12px" : buttonSize === "large" ? "16px 24px" : "12px 18px";
  const buttonRadius = buttonRounded ? "999px" : "6px";
  const buttonHtml = `<a
  href="${generated.link}"
  ${buttonNewTab ? 'target="_blank" rel="noopener noreferrer"' : ""}
  style="display:inline-flex;align-items:center;gap:8px;padding:${buttonPadding};background:#25D366;color:#fff;text-decoration:none;border-radius:${buttonRadius};font-weight:600;"
>
  ${buttonIcon ? "WhatsApp " : ""}${ctaText}
</a>`;
  const buttonJsx = `<a
  href={whatsappLink}
  ${buttonNewTab ? 'target="_blank"\n  rel="noopener noreferrer"' : ""}
  className="inline-flex items-center gap-2 ${buttonRounded ? "rounded-full" : "rounded-md"} bg-[#25D366] px-5 py-3 font-semibold text-white"
>
  ${buttonIcon ? "WhatsApp " : ""}${ctaText}
</a>`;

  useEffect(() => {
    setHistory(loadWhatsAppHistory());
  }, []);

  useEffect(() => {
    setErrors(validation);
  }, [validation]);

  useEffect(() => {
    let cancelled = false;

    async function renderQr() {
      if (!canUseResult) {
        setQrDataUrl("");
        return;
      }

      if (!qrHasReadableContrast) {
        setQrDataUrl("");
        return;
      }

      try {
        const QRCode = await import("qrcode");
        const dataUrl = await QRCode.toDataURL(generated.link, {
          width: qrSize,
          margin: qrMargin,
          color: {
            dark: qrForeground,
            light: qrBackground,
          },
          errorCorrectionLevel: "M",
        });
        if (!cancelled) setQrDataUrl(dataUrl);
      } catch {
        if (!cancelled) setNotice("QR code generation failed. Please try again.");
      }
    }

    renderQr();

    return () => {
      cancelled = true;
    };
  }, [canUseResult, generated.link, qrBackground, qrForeground, qrHasReadableContrast, qrMargin, qrSize]);

  const showNotice = (value: string) => {
    setNotice(value);
    window.setTimeout(() => setNotice(""), 2500);
  };

  const copyText = async (value: string, key: string, success = "Copied") => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
      setCopiedKey(key);
      showNotice(success);
      window.setTimeout(() => setCopiedKey(""), 1800);
    } catch {
      showNotice("Copy failed. Select the text and copy it manually.");
    }
  };

  const saveCurrentLink = () => {
    if (!canUseResult) {
      setErrors(validation);
      showNotice("Enter a valid phone number first.");
      return;
    }

    const next = addWhatsAppHistoryEntry({
      id: makeId(),
      label: label.trim() || ctaText,
      countryName: country.name,
      countryCode: country.code,
      phoneNumber: generated.internationalNumber,
      message,
      link: generated.link,
      createdAt: new Date().toISOString(),
    });
    setHistory(next);
    showNotice("Link saved in recent history.");
  };

  const applyTemplate = (id: string) => {
    const template = whatsappTemplates.find((item) => item.id === id);
    if (!template) {
      setTemplateId("");
      return;
    }

    if (message.trim() && message !== selectedTemplate?.message && !window.confirm("Replace your current message with this template?")) return;

    setTemplateId(id);
    setMessage(template.message);
    setPlaceholderValues({});
  };

  const applyPlaceholderValue = (name: string, value: string) => {
    const token = `{{${name}}}`;
    const previous = placeholderValues[name];

    setPlaceholderValues((current) => ({ ...current, [name]: value }));
    setMessage((current) => {
      if (previous && current.includes(previous)) return current.replaceAll(previous, value || token);
      return current.replaceAll(token, value || token);
    });
  };

  const reset = () => {
    if ((phoneNumber.trim() || message.trim()) && !window.confirm("Reset the generator? Recent history will stay saved.")) return;

    setCountry(defaultCountry);
    setCountrySearch("");
    setPhoneNumber("");
    setMessage("");
    setLabel("");
    setTemplateId("");
    setPlaceholderValues({});
    setNotice("Generator reset.");
  };

  const deleteHistoryItem = (id: string) => {
    const next = history.filter((item) => item.id !== id);
    setHistory(next);
    saveWhatsAppHistory(next);
  };

  const toggleFavourite = (id: string) => {
    const next = history.map((item) => (item.id === id ? { ...item, favourite: !item.favourite } : item));
    setHistory(next);
    saveWhatsAppHistory(next);
  };

  const clearHistory = () => {
    if (!history.length || !window.confirm("Clear all recent WhatsApp links stored in this browser?")) return;
    clearWhatsAppHistory();
    setHistory([]);
  };

  const loadHistoryItem = (item: RecentWhatsAppLink) => {
    const nextCountry = countryCodes.find((entry) => entry.code === item.countryCode && entry.name === item.countryName) || countryCodes.find((entry) => entry.code === item.countryCode) || defaultCountry;
    setCountry(nextCountry);
    setPhoneNumber(item.phoneNumber);
    setMessage(item.message);
    setLabel(item.label);
    showNotice("Recent link loaded.");
  };

  const shareLink = async () => {
    if (!canUseResult) return;
    if (!navigator.share) {
      await copyText(generated.link, "share-fallback", "Sharing is unavailable, so the link was copied.");
      return;
    }

    try {
      await navigator.share({
        title: ctaText || "Chat with us on WhatsApp",
        text: ctaText || "Chat with us on WhatsApp",
        url: generated.link,
      });
    } catch {
      showNotice("Share cancelled.");
    }
  };

  const downloadQr = () => {
    if (!qrDataUrl) {
      showNotice("Generate a valid link before downloading the QR code.");
      return;
    }

    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `whatsapp-link-${generated.internationalNumber || "draft"}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    showNotice("QR code downloaded.");
  };

  return (
    <>
      <section className="whatsapp-no-print px-6 pb-8 pt-8 dark:bg-black md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-sm font-bold text-[#589037]">Free Tool</p>
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <h1 className="max-w-5xl text-5xl font-black leading-[0.95] tracking-[-0.06em] md:text-7xl">Free WhatsApp Link Generator</h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-neutral-500 dark:text-neutral-300">
                Create a direct WhatsApp chat link with an optional pre-filled message. Copy the link, share it online or download a QR code.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <button onClick={saveCurrentLink} className="inline-flex items-center gap-3 rounded-full border border-black px-5 py-3 text-sm font-bold transition hover:bg-black hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-black">
                <Star size={17} />
                Save link
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
          <div className="whatsapp-no-print grid gap-5 rounded-[2rem] bg-white p-4 shadow-sm dark:bg-black md:p-6 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-3 lg:[scrollbar-gutter:stable]">
            <Panel title="Phone number">
              <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
                <div>
                  <label className="block text-sm font-bold" htmlFor="countrySearch">
                    Search country
                  </label>
                  <input id="countrySearch" value={countrySearch} onChange={(event) => setCountrySearch(event.target.value)} className={inputClass} placeholder="Nigeria, +234, NG" />
                </div>
                <div>
                  <label className="block text-sm font-bold" htmlFor="country">
                    Country code
                  </label>
                  <select
                    id="country"
                    value={`${country.iso}-${country.code}`}
                    onChange={(event) => {
                      const next = countryCodes.find((item) => `${item.iso}-${item.code}` === event.target.value);
                      if (next) setCountry(next);
                    }}
                    className={inputClass}
                  >
                    {filteredCountries.map((item) => (
                      <option key={`${item.iso}-${item.code}-${item.name}`} value={`${item.iso}-${item.code}`}>
                        {item.name} ({item.iso}) +{item.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold" htmlFor="phoneNumber">
                    WhatsApp phone number
                  </label>
                  <div className="mt-2 grid gap-3 sm:grid-cols-[auto_1fr]">
                    <span className="flex items-center rounded-2xl border border-black/10 bg-[#f7f7f4] px-4 py-3 text-sm font-bold dark:border-white/10 dark:bg-black">
                      +{country.code}
                    </span>
                    <input id="phoneNumber" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} className={inputClass.replace("mt-2 ", "")} placeholder="0801 234 5678" inputMode="tel" />
                  </div>
                  {errors.phoneNumber && <p className="mt-2 text-xs leading-5 text-red-600">{errors.phoneNumber}</p>}
                  <p className="mt-3 text-xs leading-5 text-neutral-500 dark:text-neutral-300">
                    Final number preview: {phoneNumber.trim() ? normalizeInternationalNumber(phoneNumber, country.code) : `+${country.code}...`}
                  </p>
                </div>
              </div>
            </Panel>

            <Panel title="Message">
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-bold" htmlFor="template">
                    Message template
                  </label>
                  <select id="template" value={templateId} onChange={(event) => applyTemplate(event.target.value)} className={inputClass}>
                    <option value="">Write my own message</option>
                    {whatsappTemplates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.label}
                      </option>
                    ))}
                  </select>
                </div>
                {usedPlaceholders.length > 0 && (
                  <div className="grid gap-3 rounded-[1.5rem] bg-[#f7f7f4] p-4 dark:bg-white/10 md:grid-cols-2">
                    {usedPlaceholders.map((name) => (
                      <div key={name}>
                        <label className="block text-xs font-bold uppercase tracking-wider" htmlFor={`placeholder-${name}`}>
                          {name.replaceAll("_", " ")}
                        </label>
                        <input id={`placeholder-${name}`} value={placeholderValues[name] || ""} onChange={(event) => applyPlaceholderValue(name, event.target.value)} className={inputClass} placeholder={`Replace {{${name}}}`} />
                      </div>
                    ))}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-bold" htmlFor="message">
                    Pre-filled message
                  </label>
                  <textarea id="message" value={message} onChange={(event) => setMessage(event.target.value)} className={`${inputClass} min-h-40 resize-y`} placeholder="Hello Anulen Technologies,&#10;&#10;I would like to ask about your web development services." />
                  <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-300">{message.length} characters. Line breaks, emojis, ampersands, hashtags and punctuation are safely encoded.</p>
                </div>
              </div>
            </Panel>

            <Panel title="QR code settings">
              <div className="grid gap-4 md:grid-cols-2">
                <NumberField id="qrSize" label="QR size" value={qrSize} onChange={(value) => setQrSize(Math.min(Math.max(value, 160), 720))} min="160" max="720" />
                <NumberField id="qrMargin" label="QR margin" value={qrMargin} onChange={(value) => setQrMargin(Math.min(Math.max(value, 0), 8))} min="0" max="8" />
                <div>
                  <label className="block text-sm font-bold" htmlFor="qrForeground">
                    Foreground colour
                  </label>
                  <input id="qrForeground" type="color" value={qrForeground} onChange={(event) => setQrForeground(event.target.value)} className="mt-2 h-12 w-full cursor-pointer rounded-2xl border border-black/10 bg-[#f7f7f4] p-1 dark:border-white/10 dark:bg-black" />
                </div>
                <div>
                  <label className="block text-sm font-bold" htmlFor="qrBackground">
                    Background colour
                  </label>
                  <input id="qrBackground" type="color" value={qrBackground} onChange={(event) => setQrBackground(event.target.value)} className="mt-2 h-12 w-full cursor-pointer rounded-2xl border border-black/10 bg-[#f7f7f4] p-1 dark:border-white/10 dark:bg-black" />
                </div>
                {!qrHasReadableContrast && (
                  <p className="md:col-span-2 text-xs leading-5 text-red-600">
                    Choose QR colours with stronger contrast so the code remains scannable.
                  </p>
                )}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold" htmlFor="qrLabel">
                    QR label
                  </label>
                  <input id="qrLabel" value={qrLabel} onChange={(event) => setQrLabel(event.target.value)} className={inputClass} />
                </div>
              </div>
            </Panel>

            <Panel title="Display and button code">
              <div className="grid gap-4">
                <TextField id="label" label="Saved link label" value={label} onChange={setLabel} placeholder="Customer Support" />
                <TextField id="ctaText" label="Display text" value={ctaText} onChange={setCtaText} />
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="block text-sm font-bold" htmlFor="buttonSize">
                      Button size
                    </label>
                    <select id="buttonSize" value={buttonSize} onChange={(event) => setButtonSize(event.target.value)} className={inputClass}>
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                  <label className="mt-7 flex items-center gap-3 rounded-2xl bg-[#f7f7f4] p-4 text-sm font-bold dark:bg-white/10">
                    <input type="checkbox" checked={buttonRounded} onChange={(event) => setButtonRounded(event.target.checked)} />
                    Rounded
                  </label>
                  <label className="mt-7 flex items-center gap-3 rounded-2xl bg-[#f7f7f4] p-4 text-sm font-bold dark:bg-white/10">
                    <input type="checkbox" checked={buttonIcon} onChange={(event) => setButtonIcon(event.target.checked)} />
                    Include icon text
                  </label>
                </div>
                <label className="flex items-center gap-3 rounded-2xl bg-[#f7f7f4] p-4 text-sm font-bold dark:bg-white/10">
                  <input type="checkbox" checked={buttonNewTab} onChange={(event) => setButtonNewTab(event.target.checked)} />
                  Open button links in a new tab
                </label>
              </div>
            </Panel>

            <Panel title="Recent links">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-neutral-500 dark:text-neutral-300">Saved only in this browser. Maximum 20 links.</p>
                <button onClick={clearHistory} className="rounded-full border border-black/20 px-4 py-2 text-xs font-bold text-red-600 dark:border-white/20">
                  Clear history
                </button>
              </div>
              <div className="mt-5 grid gap-3">
                {history.length ? (
                  history.map((item) => (
                    <article key={item.id} className="rounded-[1.25rem] bg-[#f7f7f4] p-4 dark:bg-white/10">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-black">{item.label}</p>
                          <p className="mt-1 break-all text-xs text-neutral-500 dark:text-neutral-300">{item.link}</p>
                          <p className="mt-1 text-xs text-neutral-400">{readableDate(item.createdAt)}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => toggleFavourite(item.id)} className="rounded-full border border-black/10 px-3 py-2 text-xs font-bold dark:border-white/10">
                            {item.favourite ? "Unfavourite" : "Favourite"}
                          </button>
                          <button onClick={() => loadHistoryItem(item)} className="rounded-full border border-black/10 px-3 py-2 text-xs font-bold dark:border-white/10">
                            Load
                          </button>
                          <button onClick={() => copyText(item.link, `history-${item.id}`, "Recent link copied")} className="rounded-full border border-black/10 px-3 py-2 text-xs font-bold dark:border-white/10">
                            Copy
                          </button>
                          <button onClick={() => deleteHistoryItem(item.id)} className="rounded-full border border-black/10 px-3 py-2 text-xs font-bold text-red-600 dark:border-white/10">
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="rounded-[1.25rem] bg-[#f7f7f4] p-4 text-sm text-neutral-500 dark:bg-white/10 dark:text-neutral-300">No recent links yet.</p>
                )}
              </div>
            </Panel>

            <div className="rounded-[1.5rem] bg-[#f7f7f4] p-5 text-sm leading-7 text-neutral-600 dark:bg-white/10 dark:text-neutral-300">
              This tool creates WhatsApp click-to-chat links. It is not affiliated with or endorsed by WhatsApp or Meta. It cannot confirm whether a
              phone number is registered on WhatsApp. Only create and share links for phone numbers you own or have permission to use.
            </div>
          </div>

          <div className="whatsapp-preview-scroll lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-3 lg:[scrollbar-gutter:stable]">
            <div className="rounded-[2rem] bg-white p-4 shadow-sm dark:bg-black md:p-6">
              <div className="mb-5 flex items-center gap-3 rounded-[1.5rem] bg-black p-5 text-white dark:bg-white dark:text-black">
                <QrCode size={20} />
                <div>
                  <h2 className="text-lg font-black">Link and QR preview</h2>
                  <p className="text-sm opacity-70">Everything updates in your browser.</p>
                </div>
              </div>

              <div className="grid gap-5">
                <ResultCard title="Generated link">
                  {canUseResult ? (
                    <>
                      <p className="break-all rounded-2xl bg-[#f7f7f4] p-4 text-sm dark:bg-white/10">{generated.link}</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-300">International number: {generated.internationalNumber}</p>
                      {message && <p className="whitespace-pre-wrap text-sm leading-7 text-neutral-500 dark:text-neutral-300">Message preview: {message}</p>}
                      <div className="flex flex-wrap gap-3">
                        <button onClick={() => copyText(generated.link, "main-link", "WhatsApp link copied")} className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-bold text-white dark:bg-white dark:text-black">
                          {copiedKey === "main-link" ? <Check size={16} /> : <Copy size={16} />}
                          Copy link
                        </button>
                        <a href={generated.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-black px-5 py-3 text-sm font-bold dark:border-white">
                          <ExternalLink size={16} />
                          Open in WhatsApp
                        </a>
                        <button onClick={shareLink} className="inline-flex items-center gap-2 rounded-full border border-black px-5 py-3 text-sm font-bold dark:border-white">
                          <Share2 size={16} />
                          Share
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="rounded-2xl bg-[#f7f7f4] p-4 text-sm text-neutral-500 dark:bg-white/10 dark:text-neutral-300">Enter a valid phone number to generate a WhatsApp link.</p>
                  )}
                </ResultCard>

                <ResultCard title="QR code">
                  {qrDataUrl ? (
                    <div className="flex flex-col items-center gap-4">
                      <img src={qrDataUrl} alt={`QR code for ${generated.link}`} className="max-w-full rounded-2xl bg-white p-4" style={{ width: Math.min(qrSize, 320) }} />
                      {qrLabel && <p className="text-center text-sm font-bold">{qrLabel}</p>}
                      <button onClick={downloadQr} className="inline-flex items-center gap-2 rounded-full border border-black px-5 py-3 text-sm font-bold dark:border-white">
                        <Download size={16} />
                        Download QR code
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-500 dark:text-neutral-300">
                      {canUseResult && !qrHasReadableContrast ? "Increase QR colour contrast to preview and download the code." : "QR code appears after a valid link is available."}
                    </p>
                  )}
                </ResultCard>

                <ResultCard title="Copyable formats">
                  <FormatBlock title="Standard link" value={formats.standard} onCopy={() => copyText(formats.standard, "standard", "Standard link copied")} />
                  <FormatBlock title="HTML anchor" value={formats.html} onCopy={() => copyText(formats.html, "html", "HTML copied")} />
                  <FormatBlock title="Markdown link" value={formats.markdown} onCopy={() => copyText(formats.markdown, "markdown", "Markdown copied")} />
                  <FormatBlock title="Plain text" value={formats.plain} onCopy={() => copyText(formats.plain, "plain", "Plain text copied")} />
                </ResultCard>

                <ResultCard title="Website button code">
                  <FormatBlock title="HTML button" value={buttonHtml} onCopy={() => copyText(buttonHtml, "button-html", "Button HTML copied")} />
                  <FormatBlock title="React / Next.js JSX" value={buttonJsx} onCopy={() => copyText(buttonJsx, "button-jsx", "Button JSX copied")} />
                </ResultCard>
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

function ResultCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.5rem] border border-black/5 bg-white p-5 dark:border-white/10 dark:bg-black">
      <h3 className="mb-4 text-xl font-black tracking-[-0.04em]">{title}</h3>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function TextField({ id, label, value, onChange, placeholder }: { id: string; label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-bold" htmlFor={id}>
        {label}
      </label>
      <input id={id} value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} placeholder={placeholder} />
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

function FormatBlock({ title, value, onCopy }: { title: string; value: string; onCopy: () => void }) {
  return (
    <div className="rounded-[1.25rem] bg-[#f7f7f4] p-4 dark:bg-white/10">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-black">{title}</p>
        <button onClick={onCopy} className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-2 text-xs font-bold dark:border-white/10">
          <Copy size={14} />
          Copy
        </button>
      </div>
      <pre className="whitespace-pre-wrap break-all text-xs leading-6 text-neutral-600 dark:text-neutral-300">{value}</pre>
    </div>
  );
}
