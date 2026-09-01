"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
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
  const close = () => setOpen(false);
  const root = localizedPath(activeLocale);
  const sectionHref = (section: string) => `${root === "/" ? "" : root}/#${section}` || `/#${section}`;

  return (
    <header className="site-header">
      <div className="scroll-progress-bar" aria-hidden="true" />
      <div className="container nav-wrap">
        <a className="brand" href={`${root === "/" ? "" : root}/#top` || "/#top"} onClick={close} aria-label={`${profile.name} home`}>
          <span>{profile.shortName}</span><i>.</i>
        </a>
        <nav className={open ? "nav open" : "nav"} aria-label="Primary navigation">
          <a href={sectionHref("about")} data-section="about" onClick={close}>{copy.nav.about}</a>
          <a href={sectionHref("experience")} data-section="experience" onClick={close}>{copy.nav.experience}</a>
          <a href={sectionHref("projects")} data-section="projects" onClick={close}>{copy.nav.projects}</a>
          <a href={sectionHref("skills")} data-section="skills" onClick={close}>{copy.nav.skills}</a>
          <a href={sectionHref("approach")} data-section="approach" onClick={close}>{copy.nav.process}</a>
          <a href={localizedPath(activeLocale, "/resume")} data-track-event="cta_click" data-track-label="Navbar Resume" onClick={close}>{copy.nav.resume}</a>
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
