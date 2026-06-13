import Image from "next/image";
import logo from "@/public/logo.png";

export default function Logo() {
  return (
    <a href="/" className="flex items-center gap-2">
      <Image src={logo} width={120} alt="logo" />
    </a>
  );
}
