import { profile as fallbackProfile, type PortfolioProfile } from "@/data/profile";
import { appVersion } from "@/data/version";
import { getLocale, getUiCopy, localizedPath, type Locale } from "@/data/i18n";
import { mediaPreviewUrl, mediaViewUrl } from "@/lib/media-url";

export function Hero({ profileData = fallbackProfile, locale = "en" }: { profileData?: PortfolioProfile; locale?: Locale }) {
  const profile = profileData;
  const activeLocale = getLocale(locale);
  const copy = getUiCopy(activeLocale);
  const avatarUrl = mediaPreviewUrl(profile.media?.avatarUrl, 900);
  const resumeUrl = mediaViewUrl(profile.media?.resumeUrl);

  return (
    <section className="hero section" id="top">
      <div className="container hero-grid">
        <div className="hero-copy">
          <div className="eyebrow"><span className="status-dot" /> {profile.availability}</div>
          <p className="hello">{copy.hero.hello} {profile.name}.</p>
          <h1>{profile.role}</h1>
          <p className="hero-headline">{profile.headline}</p>
          <p className="hero-description">{profile.description}</p>
          <div className="hero-actions">
            <a href={`${localizedPath(activeLocale)}/#about`} className="button primary" data-track-event="cta_click" data-track-label="Hero Explore profile">{copy.hero.explore} <span>↘</span></a>
            <a href={localizedPath(activeLocale, "/contact")} className="button secondary" data-track-event="contact_click" data-track-label="Hero Contact me">{copy.hero.contact}</a>
            {resumeUrl && (
              <a href={resumeUrl} className="button secondary" target="_blank" rel="noreferrer" data-track-event="resume_download" data-track-label="Hero Download CV">{copy.hero.downloadCv}</a>
            )}
          </div>
          <div className="hero-meta">
            <span>{profile.location}</span>
            <span className="meta-line" />
            <span>{copy.hero.portfolio} {appVersion.label}</span>
          </div>
        </div>

        <div className="hero-visual" aria-label={copy.hero.profileCard}>
          <div className="profile-card">
            <div className="card-topline">
              <span>{copy.hero.profileCode}</span>
              <span>2026</span>
            </div>
            {avatarUrl ? (
              <div className="profile-photo-wrap">
                <img src={avatarUrl} alt={profile.media?.avatarAlt || `Portrait photo of ${profile.name}`} referrerPolicy="no-referrer" />
              </div>
            ) : (
              <div className="monogram">{profile.shortName}</div>
            )}
            <div className="card-content">
              <span className="card-kicker">{copy.hero.focus}</span>
              <strong>{profile.headline}</strong>
              <div className="specialty-grid">
                {profile.specialties.map((item, index) => (
                  <div key={item}><span>0{index + 1}</span>{item}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
