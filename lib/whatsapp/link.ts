import type { WhatsAppLinkInput, WhatsAppLinkResult, WhatsAppValidationErrors } from "@/lib/whatsapp/types";

const supportedPhoneChars = /^[\d\s()+.-]*$/;

export function sanitizePhoneNumber(value: string) {
  return value.replace(/[^\d]/g, "");
}

export function normalizeInternationalNumber(rawPhone: string, countryCode: string) {
  let digits = sanitizePhoneNumber(rawPhone);
  const code = sanitizePhoneNumber(countryCode);

  if (digits.startsWith(code + code)) {
    digits = digits.slice(code.length);
  }

  if (digits.startsWith(code)) {
    return digits;
  }

  while (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  return `${code}${digits}`;
}

export function encodeWhatsAppMessage(message: string) {
  return encodeURIComponent(message.trim());
}

export function generateWhatsAppLink(input: WhatsAppLinkInput): WhatsAppLinkResult {
  const internationalNumber = normalizeInternationalNumber(input.phoneNumber, input.country.code);
  const encodedMessage = encodeWhatsAppMessage(input.message);
  const link = encodedMessage ? `https://wa.me/${internationalNumber}?text=${encodedMessage}` : `https://wa.me/${internationalNumber}`;

  return { internationalNumber, link, encodedMessage };
}

export function validateWhatsAppLinkInput(input: WhatsAppLinkInput): WhatsAppValidationErrors {
  const errors: WhatsAppValidationErrors = {};
  const raw = input.phoneNumber.trim();
  const normalized = normalizeInternationalNumber(raw, input.country.code);

  if (!raw) {
    errors.phoneNumber = "Phone number is required.";
  } else if (!supportedPhoneChars.test(raw)) {
    errors.phoneNumber = "Use only numbers, spaces, brackets, dashes, dots or a plus sign.";
  } else if (!/^\d+$/.test(normalized)) {
    errors.phoneNumber = "The final phone number must contain numbers only.";
  } else if (normalized.length < 8) {
    errors.phoneNumber = "Phone number is too short.";
  } else if (normalized.length > 15) {
    errors.phoneNumber = "Phone number is too long.";
  }

  return errors;
}

export function linkDisplayFormats(link: string, text: string) {
  const safeText = text.trim() || "Chat with us on WhatsApp";
  const escapedText = safeText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const markdownText = safeText.replace(/\\/g, "\\\\").replace(/\]/g, "\\]");

  return {
    standard: link,
    html: `<a href="${link}" target="_blank" rel="noopener noreferrer">${escapedText}</a>`,
    markdown: `[${markdownText}](${link})`,
    plain: `${safeText}:\n${link}`,
    shortText: safeText,
  };
}
