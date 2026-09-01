"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { profile as fallbackProfile, type PortfolioProfile } from "@/data/profile";
import { getLocale, getUiCopy, type Locale } from "@/data/i18n";

export function ContactForm({ profileData = fallbackProfile, locale = "en" }: { profileData?: PortfolioProfile; locale?: Locale }) {
  const profile = profileData;
  const copy = getUiCopy(getLocale(locale));
  const [form, setForm] = useState(() => ({
    name: "",
    email: "",
    topic: profile.contact.preferredTopics[0] ?? copy.contact.fallbackTopic,
    message: "",
  }));
  const [submitted, setSubmitted] = useState(false);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    if (submitted) setSubmitted(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const subject = `${copy.contact.subjectPrefix} — ${form.topic}`;
    const body = [
      `${copy.contact.name}: ${form.name || copy.contact.notProvided}`,
      `${copy.contact.email}: ${form.email || copy.contact.notProvided}`,
      `${copy.contact.topic}: ${form.topic}`,
      "",
      form.message || copy.contact.bodyMessageFallback,
    ].join("\n");

    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label>
          <span>{copy.contact.name}</span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            placeholder={copy.contact.namePlaceholder}
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
          />
        </label>
        <label>
          <span>{copy.contact.email}</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder={copy.contact.emailPlaceholder}
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
          />
        </label>
      </div>

      <label>
        <span>{copy.contact.topic}</span>
        <select
          name="topic"
          value={form.topic}
          onChange={(event) => updateField("topic", event.target.value)}
        >
          {profile.contact.preferredTopics.map((topic) => (
            <option key={topic} value={topic}>{topic}</option>
          ))}
        </select>
      </label>

      <label>
        <span>{copy.contact.message}</span>
        <textarea
          name="message"
          rows={6}
          placeholder={copy.contact.messagePlaceholder}
          value={form.message}
          onChange={(event) => updateField("message", event.target.value)}
        />
      </label>

      <div className="contact-form-actions">
        <button type="submit" data-track-event="contact_click" data-track-label="Contact form mailto">{copy.contact.openDraft} ↗</button>
        <p>{submitted ? copy.contact.opened : copy.contact.noBackend}</p>
      </div>
    </form>
  );
}
