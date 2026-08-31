"use client";

export function ResumePrintButton() {
  return (
    <button className="resume-print-button" type="button" onClick={() => window.print()}>
      Print / Save PDF ↗
    </button>
  );
}
