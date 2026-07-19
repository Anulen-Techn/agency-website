import type { CountryCode } from "@/lib/whatsapp/countries";

export type WhatsAppLinkInput = {
  country: CountryCode;
  phoneNumber: string;
  message: string;
};

export type WhatsAppLinkResult = {
  internationalNumber: string;
  link: string;
  encodedMessage: string;
};

export type WhatsAppValidationErrors = {
  phoneNumber?: string;
};

export type RecentWhatsAppLink = {
  id: string;
  label: string;
  countryName: string;
  countryCode: string;
  phoneNumber: string;
  message: string;
  link: string;
  createdAt: string;
  favourite?: boolean;
};
