"use client";

import { getLocale, getUiCopy, type Locale } from "@/data/i18n";

export function ResumePrintButton({ locale = "en" }: { locale?: Locale }) {
  const copy = getUiCopy(getLocale(locale));

  return (
    <button className="resume-print-button" type="button" data-track-event="resume_download" data-track-label="Print / Save PDF" onClick={() => window.print()}>
      {copy.resume.print} ↗
    </button>
  );
}
