export type QrType =
  | "url"
  | "text"
  | "whatsapp"
  | "email"
  | "phone"
  | "sms"
  | "wifi"
  | "vcard"
  | "location"
  | "event"
  | "social"
  | "payment"
  | "custom";

export type QrErrorCorrection = "L" | "M" | "Q" | "H";

export type QrModuleStyle = "square" | "rounded" | "dot";

export type QrCornerStyle = "square" | "rounded";

export type QrSettings = {
  size: number;
  foreground: string;
  background: string;
  transparentBackground: boolean;
  errorCorrection: QrErrorCorrection;
  margin: number;
  moduleStyle: QrModuleStyle;
  cornerStyle: QrCornerStyle;
  title: string;
  instructions: string;
  logo: string;
  logoPadding: boolean;
};

export type QrHistoryEntry = {
  id: string;
  type: QrType;
  title: string;
  encodedContent: string;
  settings: Omit<QrSettings, "logo">;
  createdAt: string;
};

export type QrPayloadResult = {
  content: string;
  isSensitive: boolean;
  errors: Record<string, string>;
};
