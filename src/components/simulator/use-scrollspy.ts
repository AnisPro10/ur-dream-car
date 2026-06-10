import { useEffect, useState } from "react";

/** Renvoie l'id de la section actuellement visible (navigation type sommaire / scrollspy). */
export function useScrollSpy(ids: string[], offsetTop = 130): string {
  const [active, setActive] = useState(ids[0] ?? "");
  useEffect(() => {
    if (typeof document === "undefined") return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: `-${offsetTop}px 0px -55% 0px`, threshold: 0 },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [ids.join("|"), offsetTop]);
  return active;
}

/** Scroll doux vers une section, en tenant compte de la barre sticky. */
export function scrollToSection(id: string, offsetTop = 100) {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - offsetTop;
  window.scrollTo({ top: y, behavior: "smooth" });
}
