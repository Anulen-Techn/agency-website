import { countryCodes } from "@/lib/whatsapp/countries";
import { generateWhatsAppLink, normalizeInternationalNumber } from "@/lib/whatsapp/link";
import type { QrPayloadResult, QrType } from "@/lib/qr/types";

export type QrFormData = Record<string, string | boolean>;

const unsafeProtocols = ["javascript:", "data:", "vbscript:"];

function value(data: QrFormData, key: string) {
  const field = data[key];
  return typeof field === "string" ? field.trim() : "";
}

function bool(data: QrFormData, key: string) {
  return data[key] === true;
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function normalizeSafeUrl(rawUrl: string) {
  const candidate = rawUrl.includes("://") ? rawUrl.trim() : `https://${rawUrl.trim()}`;
  const parsed = new URL(candidate);

  if (unsafeProtocols.includes(parsed.protocol.toLowerCase())) {
    throw new Error("Unsafe URL protocol.");
  }

  if (!["http:", "https:"].includes(parsed.protocol.toLowerCase())) {
    throw new Error("Only http and https URLs are supported.");
  }

  return parsed.toString();
}

function escapeWifi(valueToEscape: string) {
  return valueToEscape.replace(/([\\;,":])/g, "\\$1");
}

function dateToCalendar(valueToFormat: string) {
  return valueToFormat ? valueToFormat.replace(/[-:]/g, "").replace(".000", "") : "";
}

export function buildQrPayload(type: QrType, data: QrFormData): QrPayloadResult {
  const errors: Record<string, string> = {};
  let content = "";
  let isSensitive = false;

  try {
    if (type === "url" || type === "social" || type === "payment") {
      const url = value(data, "url");
      if (!url) errors.url = "Enter a URL.";
      else content = normalizeSafeUrl(url);
      isSensitive = type === "payment";
    }

    if (type === "text" || type === "custom") {
      content = value(data, "text");
      if (!content) errors.text = "Enter content for the QR code.";
    }

    if (type === "whatsapp") {
      const country = countryCodes.find((item) => item.iso === value(data, "countryIso")) || countryCodes[0];
      const phoneNumber = value(data, "phoneNumber");
      if (!phoneNumber) errors.phoneNumber = "Enter a WhatsApp phone number.";
      content = generateWhatsAppLink({ country, phoneNumber, message: value(data, "message") }).link;
    }

    if (type === "email") {
      const email = value(data, "email");
      if (!email) errors.email = "Enter an email address.";
      else if (!validEmail(email)) errors.email = "Enter a valid email address.";
      const params = new URLSearchParams();
      if (value(data, "subject")) params.set("subject", value(data, "subject"));
      if (value(data, "body")) params.set("body", value(data, "body"));
      content = `mailto:${email}${params.toString() ? `?${params.toString()}` : ""}`;
    }

    if (type === "phone" || type === "sms") {
      const country = countryCodes.find((item) => item.iso === value(data, "countryIso")) || countryCodes[0];
      const phoneNumber = value(data, "phoneNumber");
      if (!phoneNumber) errors.phoneNumber = "Enter a phone number.";
      const normalized = normalizeInternationalNumber(phoneNumber, country.code);
      content = type === "phone" ? `tel:+${normalized}` : `sms:+${normalized}${value(data, "message") ? `?body=${encodeURIComponent(value(data, "message"))}` : ""}`;
    }

    if (type === "wifi") {
      const ssid = value(data, "ssid");
      const security = value(data, "security") || "WPA";
      if (!ssid) errors.ssid = "Enter the Wi-Fi network name.";
      content = `WIFI:T:${security === "nopass" ? "nopass" : security};S:${escapeWifi(ssid)};P:${escapeWifi(value(data, "password"))};H:${bool(data, "hidden") ? "true" : "false"};;`;
      isSensitive = !!value(data, "password");
    }

    if (type === "vcard") {
      const fullName = value(data, "fullName");
      if (!fullName) errors.fullName = "Enter a contact name.";
      content = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${fullName}`,
        value(data, "company") && `ORG:${value(data, "company")}`,
        value(data, "jobTitle") && `TITLE:${value(data, "jobTitle")}`,
        value(data, "phone") && `TEL:${value(data, "phone")}`,
        value(data, "email") && `EMAIL:${value(data, "email")}`,
        value(data, "website") && `URL:${value(data, "website")}`,
        value(data, "address") && `ADR:;;${value(data, "address")}`,
        "END:VCARD",
      ]
        .filter(Boolean)
        .join("\n");
      isSensitive = true;
    }

    if (type === "location") {
      const lat = value(data, "latitude");
      const lng = value(data, "longitude");
      if (!lat || !lng) errors.location = "Enter latitude and longitude.";
      content = `geo:${lat},${lng}`;
    }

    if (type === "event") {
      const title = value(data, "eventTitle");
      const start = value(data, "startDate");
      const end = value(data, "endDate");
      if (!title) errors.eventTitle = "Enter an event title.";
      if (!start) errors.startDate = "Enter a start date.";
      if (!end) errors.endDate = "Enter an end date.";
      if (start && end && end <= start) errors.endDate = "End date must be after the start date.";
      content = ["BEGIN:VEVENT", `SUMMARY:${title}`, `DTSTART:${dateToCalendar(start)}`, `DTEND:${dateToCalendar(end)}`, value(data, "eventLocation") && `LOCATION:${value(data, "eventLocation")}`, value(data, "description") && `DESCRIPTION:${value(data, "description")}`, "END:VEVENT"].filter(Boolean).join("\n");
      isSensitive = true;
    }
  } catch (error) {
    errors.url = error instanceof Error ? error.message : "Enter a valid value.";
  }

  return { content, isSensitive, errors };
}
