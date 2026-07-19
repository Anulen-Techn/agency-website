export default function Logo() {
  return (
    <a href="/" className="inline-flex w-fit items-center gap-[3px]" aria-label="Anulen home">
      <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-black dark:bg-white">
        <span className="font-[Arial] text-[33px] font-bold leading-none text-white dark:text-black">A</span>
      </span>

      <span className="font-[Arial] text-[30px] font-medium leading-none text-black dark:text-white">nulen</span>
    </a>
  );
}
