import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const getHashId = (hash) => {
  const rawId = hash.slice(1);
  try {
    return decodeURIComponent(rawId);
  } catch {
    return rawId;
  }
};

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = getHashId(hash);
      const timer = window.setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        } else {
          window.scrollTo(0, 0);
          document.documentElement.scrollTo(0, 0);
        }
      }, 50);
      return () => window.clearTimeout(timer);
    }

    // Immediately scroll window & document to top on pathname change
    window.scrollTo(0, 0);
    document.documentElement.scrollTo(0, 0);
    if (document.body) document.body.scrollTo(0, 0);

    // Run inside requestAnimationFrame and setTimeout to guarantee top scroll
    // after React finishes rendering and layout painting for the new page
    const rafId = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTo(0, 0);
    });

    const timer = window.setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTo(0, 0);
    }, 30);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(timer);
    };
  }, [pathname, hash]);

  return null;
}
