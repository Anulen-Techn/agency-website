import Logo from "./Logo";

const footerLinks = [
  {
    title: "Services",
    links: ["Websites", "Ecommerce", "Automation", "Design"],
  },
  {
    title: "Company",
    links: ["About", "Projects", "Contact", "Careers"],
  },
  {
    title: "Resources",
    links: ["Case studies", "Blog", "Terms", "Privacy"],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-5 py-14">
      <div className="container">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-sm text-white/60">
              Build modern digital products, automation systems, and websites that grow with your business.
            </p>
          </div>

          <div className="footer-grid">
            {footerLinks.map((group) => (
              <div key={group.title}>
                <h3 className="font-semibold text-white">{group.title}</h3>
                {group.links.map((link) => (
                  <a key={link} href="#" className="footer-link">
                    {link}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-5 border-t border-white/10 pt-8 text-sm text-white/50 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Anulen. Build. Automate. Grow.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-white/50 hover:text-white">
              Twitter
            </a>
            <a href="#" className="text-white/50 hover:text-white">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
