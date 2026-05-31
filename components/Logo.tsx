import Image from "next/image";

type LogoProps = {
  showText?: boolean;
  className?: string;
};

export default function Logo({ showText = true, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image src="/anulen-mark.svg" alt="Anulen logo" width={42} height={42} priority />
      {showText && (
        <span className="text-xl font-semibold tracking-[0.28em] text-white">
          ANULEN
        </span>
      )}
    </div>
  );
}
