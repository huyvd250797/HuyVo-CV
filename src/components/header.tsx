"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { profile as fallbackProfile, type PortfolioProfile } from "@/data/profile";
import { getLocale, localizedPath, switchLocalePath, type Locale } from "@/data/i18n";
import { getUiCopy } from "@/data/i18n";
import { ThemeSwitcher } from "./theme-switcher";

export function Header({ profileData = fallbackProfile, locale = "en" }: { profileData?: PortfolioProfile; locale?: Locale }) {
  const profile = profileData;
  const activeLocale = getLocale(locale);
  const copy = getUiCopy(activeLocale);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isHeaderVisible, setHeaderVisible] = useState(true);
  const [isPastHeader, setPastHeader] = useState(false);
  const lastScrollY = useRef(0);
  const idleTimer = useRef<number | null>(null);
  const close = () => setOpen(false);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const showAfterIdle = () => {
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => setHeaderVisible(true), 1000);
    };

    const handleScroll = () => {
      const currentY = Math.max(0, window.scrollY);
      const delta = currentY - lastScrollY.current;
      const pastHeader = currentY > 110;

      setPastHeader(pastHeader);

      if (!pastHeader) {
        setHeaderVisible(true);
      } else if (delta > 4 && !open) {
        setHeaderVisible(false);
        showAfterIdle();
      } else if (delta < -4) {
        setHeaderVisible(true);
        showAfterIdle();
      } else {
        showAfterIdle();
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    };
  }, [open]);

  useEffect(() => {
    if (open) setHeaderVisible(true);
  }, [open]);
  const root = localizedPath(activeLocale);
  const homeHref = root === "/" ? "/#top" : `${root}/#top`;
  const sectionHref = (section: string) => root === "/" ? `/#${section}` : `${root}/#${section}`;

  return (
    <header className={`site-header ${isHeaderVisible ? "is-visible" : "is-hidden"} ${isPastHeader ? "is-floating" : ""}`}>
      <div className="scroll-progress-bar" aria-hidden="true" />
      <div className="container nav-wrap">
        <a className="brand" href={homeHref} onClick={close} aria-label={`${profile.name} home`}>
          <span>{profile.shortName}</span><i>.</i>
        </a>
        <nav className={open ? "nav open" : "nav"} aria-label="Primary navigation">
          <a href={sectionHref("about")} data-section="about" onClick={close}>{copy.nav.about}</a>
          <a href={sectionHref("brand")} data-section="brand" onClick={close}>{copy.nav.brand}</a>
          <a href={sectionHref("experience")} data-section="experience" onClick={close}>{copy.nav.experience}</a>
          <a href={sectionHref("projects")} data-section="projects" onClick={close}>{copy.nav.projects}</a>
          <a href={sectionHref("skills")} data-section="skills" onClick={close}>{copy.nav.skills}</a>
          <a href={sectionHref("approach")} data-section="approach" onClick={close}>{copy.nav.process}</a>
          <a href={localizedPath(activeLocale, "/resume")} data-track-event="cta_click" data-track-label="Navbar Resume" onClick={close}>{copy.nav.resume}</a>
          <a href={localizedPath(activeLocale, "/blog")} data-track-event="cta_click" data-track-label="Navbar Blog" onClick={close}>{copy.nav.blog}</a>
          <a className="nav-cta" href={localizedPath(activeLocale, "/contact")} data-track-event="contact_click" data-track-label="Navbar Let's talk" onClick={close}>{copy.nav.contact}</a>
        </nav>
        <div className="nav-actions">
          <div className="language-switcher" aria-label="Language switcher">
            <a className={activeLocale === "en" ? "active" : ""} href={switchLocalePath("en", pathname)}>EN</a>
            <a className={activeLocale === "vi" ? "active" : ""} href={switchLocalePath("vi", pathname)}>VI</a>
          </div>
          <ThemeSwitcher />
          <button className="menu-button" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
            <span /><span />
          </button>
        </div>
      </div>
    </header>
  );
}
