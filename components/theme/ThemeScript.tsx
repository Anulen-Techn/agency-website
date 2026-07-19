export default function ThemeScript() {
  const script = `
    (() => {
      try {
        const getSystemTheme = () => (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        const applyTheme = (theme) => {
          const shouldUseDark = theme === "dark";
          document.documentElement.classList.toggle("dark", shouldUseDark);
          document.documentElement.style.colorScheme = shouldUseDark ? "dark" : "light";
        };

        localStorage.removeItem("theme");
        window.__anulenApplyTheme = applyTheme;
        window.__anulenGetSystemTheme = getSystemTheme;
        window.__anulenGetPreferredTheme = getSystemTheme;

        const shouldUseDark = getSystemTheme() === "dark";
        document.documentElement.classList.toggle("dark", shouldUseDark);
        document.documentElement.style.colorScheme = shouldUseDark ? "dark" : "light";
      } catch {
        document.documentElement.classList.remove("dark");
        document.documentElement.style.colorScheme = "light";
      }
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
