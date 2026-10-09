/**
 * Nexoria Global Theme Engine
 * Handles seamless synchronization of Light/Dark modes across mobile and desktop.
 */

export const THEME_STORAGE_KEY = "nexoria_theme";

export function getSavedTheme() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === "dark" || saved === "light" || saved === "system") {
    return saved;
  }
  return "light";
}

export function isDarkActive() {
  const saved = getSavedTheme();
  if (saved === "dark") return true;
  if (saved === "light") return false;
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return false;
}

export function applyTheme(mode) {
  if (typeof document === "undefined") return;

  const isDark = 
    mode === "dark" || 
    (mode === "system" && typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const root = document.documentElement;
  const body = document.body;

  if (isDark) {
    root.setAttribute("data-theme", "dark");
    body.setAttribute("data-theme", "dark");
    root.classList.add("dark-theme");
    body.classList.add("dark-theme");
    root.style.colorScheme = "dark";
  } else {
    root.removeAttribute("data-theme");
    body.removeAttribute("data-theme");
    root.classList.remove("dark-theme");
    body.classList.remove("dark-theme");
    root.style.colorScheme = "light";
  }

  // Update meta theme-color for mobile browser address bars
  try {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.name = "theme-color";
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute("content", isDark ? "#18191a" : "#1877f2");
  } catch (e) {
    // Ignore in non-browser env
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch (e) {
    // Ignore storage issues
  }

  // Notify all components in the app
  try {
    window.dispatchEvent(
      new CustomEvent("nexoria_theme_change", {
        detail: { theme: mode, isDark }
      })
    );
  } catch (e) {
    // Ignore event dispatch failure
  }
}

export function initTheme() {
  if (typeof window === "undefined") return;

  const current = getSavedTheme();
  applyTheme(current);

  // Listen to OS system theme changes if set to system
  try {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      if (getSavedTheme() === "system") {
        applyTheme("system");
      }
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handler);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handler);
    }
  } catch (e) {
    // Fallback
  }
}
