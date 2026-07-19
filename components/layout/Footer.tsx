import { Mail, MapPin, Phone } from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import Logo from "../ui/Logo";

export default function Footer() {
  return (
    <footer className="px-6 py-16 dark:bg-black md:px-12 lg:px-20">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.5fr_0.7fr_0.7fr_0.9fr]">
        <div>
          <Logo />
          <p className="mt-8 max-w-xl text-sm leading-7 text-neutral-500 dark:text-neutral-300">
            Anulen offers modern website development, e-commerce systems, CRM tools, and automation solutions for businesses that want better digital
            presence and operations.
          </p>

          <div className="mt-8 flex gap-4">
            {[FaFacebookF, FaXTwitter, FaLinkedinIn, FaInstagram].map((Icon, index) => (
              <span key={index} className="flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-white/10">
                <Icon size={14} />
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-black">Navigation</h4>
          <div className="mt-8 flex flex-col gap-5 text-sm text-neutral-500 dark:text-neutral-300">
            <a href="#">Service</a>
            <a href="#">Agency</a>
            <a href="#">Case Study</a>
            <a href="#">Resource</a>
            <a href="#">Contact</a>
          </div>
        </div>

        <div>
          <h4 className="font-black">Licence</h4>
          <div className="mt-8 flex flex-col gap-5 text-sm text-neutral-500 dark:text-neutral-300">
            <a href="#">Privacy Policy</a>
            <a href="#">Copyright</a>
            <a href="#">Email Address</a>
          </div>
        </div>

        <div>
          <h4 className="font-black">Contact</h4>
          <div className="mt-8 flex flex-col gap-5 text-sm text-neutral-500 dark:text-neutral-300">
            <p className="flex gap-3">
              <Phone size={17} /> +234 813 189 1721
            </p>
            <p className="flex gap-3">
              <Mail size={17} /> hello@anulen.com
            </p>
            <p className="flex gap-3">
              <MapPin size={17} /> Aba, Abia State, Nigeria
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
