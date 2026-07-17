export type Service = {
  slug: string;
  title: string;
  shortTitle: string;
  eyebrow: string;
  excerpt: string;
  description: string;
  icon: "globe" | "cart" | "workflow" | "message" | "database" | "code";
  outcomes: string[];
  process: string[];
  details: string[];
};

export const services: Service[] = [
  {
    slug: "website-design-development",
    title: "Website Design & Development",
    shortTitle: "Websites",
    eyebrow: "Premium business websites",
    excerpt: "Modern, responsive websites built to make your business look credible, load fast, and convert visitors into enquiries.",
    description:
      "We design and build business websites that clearly explain what you do, guide visitors toward action, and give your brand a polished digital home. Every build is responsive, performance-aware, and structured for future growth.",
    icon: "globe",
    outcomes: ["Responsive pages for mobile, tablet, and desktop", "Clear service, about, contact, and landing page structure", "SEO-ready foundations and fast page experience"],
    process: ["Clarify your offer, audience, and conversion goals", "Design the page structure and visual direction", "Build, test, refine, and prepare the site for launch"],
    details: [
      "Your website is often the first serious impression people get of your business, so we focus on clarity before decoration. The layout, copy structure, and calls to action are planned around what visitors need to understand before they trust you.",
      "We build with clean modern technologies so your website is easy to maintain, fast to load, and ready for new pages, campaigns, or integrations when your business grows.",
    ],
  },
  {
    slug: "ecommerce-platforms",
    title: "E-commerce Platforms",
    shortTitle: "E-commerce",
    eyebrow: "Online stores and sales systems",
    excerpt: "Product-focused shopping experiences with clean catalogues, smooth checkout flows, and the structure needed to sell online.",
    description:
      "We create e-commerce platforms that help customers browse, understand products, and buy with less friction. The focus is on clean product presentation, easy management, and a buying journey that feels trustworthy.",
    icon: "cart",
    outcomes: ["Product catalogue and product detail pages", "Cart, checkout, and enquiry-based purchase flows", "Admin-friendly structure for products, orders, and updates"],
    process: ["Map products, categories, payments, and delivery needs", "Design the shopping experience around customer decisions", "Build the store, connect key flows, and test the purchase journey"],
    details: [
      "A good online store does more than display products. It reduces confusion, answers buyer questions, and makes the next step obvious from the first product view to checkout or enquiry.",
      "We can support catalogue stores, service-product hybrids, quote-based purchasing, and more complete e-commerce systems depending on how your business sells.",
    ],
  },
  {
    slug: "business-automation",
    title: "Business Automation",
    shortTitle: "Automation",
    eyebrow: "Less manual work",
    excerpt: "Automated workflows that connect forms, notifications, customer updates, internal tasks, and repeated business processes.",
    description:
      "We help businesses reduce repetitive work by turning manual steps into connected digital workflows. Automation can improve response times, reduce missed tasks, and make everyday operations easier to manage.",
    icon: "workflow",
    outcomes: ["Lead capture and follow-up workflows", "Automated notifications for teams and customers", "Connected tools for routine business processes"],
    process: ["Identify the repeated tasks slowing the business down", "Design the workflow and decide what should happen automatically", "Build, test, and document the automation so your team can use it confidently"],
    details: [
      "Automation works best when it starts from a real operational problem. We look at the steps your team repeats every week, then build systems that remove friction without making the workflow harder to understand.",
      "This can include website form routing, customer updates, internal alerts, spreadsheet or CRM connections, appointment flows, and other repeated business actions.",
    ],
  },
  {
    slug: "whatsapp-automation",
    title: "WhatsApp Automation",
    shortTitle: "WhatsApp",
    eyebrow: "Customer conversations at scale",
    excerpt: "WhatsApp flows for enquiries, FAQs, lead qualification, order updates, booking support, and faster customer communication.",
    description:
      "We build WhatsApp automation systems that help businesses respond faster, qualify enquiries, answer common questions, and move customers through simple service or sales flows.",
    icon: "message",
    outcomes: ["Automated replies for common customer questions", "Lead qualification and routing flows", "Order, booking, or enquiry updates through WhatsApp"],
    process: ["Define the customer questions and actions WhatsApp should handle", "Create conversation flows that feel simple and natural", "Connect the automation to the right business process or team handoff"],
    details: [
      "For many businesses, WhatsApp is where customers already want to talk. We help turn that channel into a more reliable system instead of a scattered inbox full of repeated questions.",
      "The goal is not to make communication feel robotic. It is to give customers quick answers, collect the right information, and hand off to a person when the conversation needs human attention.",
    ],
  },
  {
    slug: "crm-business-systems",
    title: "CRM & Business Systems",
    shortTitle: "CRM Systems",
    eyebrow: "Organized customer operations",
    excerpt: "Custom CRM tools and internal dashboards for tracking leads, customers, tasks, projects, sales activity, and business data.",
    description:
      "We design and build CRM and internal business systems that help teams stay organized. These tools can track leads, customers, projects, sales activity, service requests, and the information your team needs every day.",
    icon: "database",
    outcomes: ["Lead, customer, and project tracking dashboards", "Role-friendly internal tools for teams", "Cleaner reporting and visibility across business activity"],
    process: ["Understand what your team tracks and where the current gaps are", "Plan the data structure, screens, roles, and workflows", "Build the system and refine it around real team usage"],
    details: [
      "Off-the-shelf tools are not always a good fit for how a business actually works. A custom CRM or internal system can match your process more closely and remove unnecessary complexity.",
      "We focus on practical screens, clear data, and workflows your team can use repeatedly without fighting the software.",
    ],
  },
  {
    slug: "custom-software-development",
    title: "Custom Software Development",
    shortTitle: "Custom Software",
    eyebrow: "Digital products and tools",
    excerpt: "Purpose-built web apps, portals, dashboards, and digital tools for businesses that need more than a standard website.",
    description:
      "We build custom software for businesses that need a specific digital tool, portal, dashboard, or platform. This service is for ideas that need product thinking, interface design, and reliable development.",
    icon: "code",
    outcomes: ["Custom web apps, portals, and dashboards", "User-friendly interfaces for complex workflows", "Scalable foundations for future product features"],
    process: ["Shape the idea into clear requirements and user flows", "Design the screens and technical foundation", "Build in focused phases, test carefully, and prepare for real users"],
    details: [
      "Custom software is useful when your business has a process, product idea, or customer experience that generic tools cannot handle well. We help turn that idea into a usable, focused system.",
      "The work can include client portals, booking systems, reporting dashboards, marketplace features, workflow tools, and other web-based software products.",
    ],
  },
];

export function getServiceBySlug(slug: string) {
  return services.find((service) => service.slug === slug);
}
