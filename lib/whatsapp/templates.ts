export type WhatsAppTemplate = {
  id: string;
  label: string;
  message: string;
};

export const whatsappTemplates: WhatsAppTemplate[] = [
  {
    id: "general",
    label: "General enquiry",
    message: "Hello, I would like to make an enquiry about your services.",
  },
  {
    id: "product",
    label: "Product enquiry",
    message: "Hello, I am interested in {{product}}. Please send me more details.",
  },
  {
    id: "service",
    label: "Service enquiry",
    message: "Hello, I would like to ask about your {{service}} service.",
  },
  {
    id: "booking",
    label: "Booking request",
    message: "Hello, I would like to book an appointment for {{date}}.",
  },
  {
    id: "order",
    label: "Order request",
    message: "Hello, I would like to place an order. Please send me the next steps.",
  },
  {
    id: "support",
    label: "Customer support",
    message: "Hello, I need support with my order {{order_number}}.",
  },
  {
    id: "quotation",
    label: "Request a quotation",
    message: "Hello, I would like to request a quotation. Please share the information you need from me.",
  },
  {
    id: "payment",
    label: "Payment confirmation",
    message: "Hello, I have made payment for order {{order_number}}. Please confirm receipt.",
  },
  {
    id: "appointment",
    label: "Appointment request",
    message: "Hello, I would like to schedule an appointment with {{business_name}}.",
  },
];
