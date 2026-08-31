"use client";

import { useState } from "react";
import { profile } from "@/data/profile";
import { ThemeSwitcher } from "./theme-switcher";

export function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <a className="brand" href="#top" onClick={close} aria-label={`${profile.name} home`}>
          <span>{profile.shortName}</span><i>.</i>
        </a>

        <nav className={open ? "nav open" : "nav"} aria-label="Primary navigation">
          <a href="#about" onClick={close}>About</a>
          <a href="#approach" onClick={close}>Approach</a>
          <a href="#contact" onClick={close}>Contact</a>
          <a className="nav-cta" href="#contact" onClick={close}>Let&apos;s talk</a>
        </nav>

        <div className="nav-actions">
          <ThemeSwitcher />
          <button
            className="menu-button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
