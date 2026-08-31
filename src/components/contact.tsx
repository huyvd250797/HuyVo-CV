import { profile } from "@/data/profile";

export function Contact() {
  return (
    <section className="section contact" id="contact">
      <div className="container contact-inner">
        <div className="section-label light"><span>03</span> Contact</div>
        <p className="contact-kicker">Have a project, role or idea to discuss?</p>
        <h2>Let&apos;s build something useful.</h2>
        <div className="contact-bottom">
          <a className="email-link" href={`mailto:${profile.email}`}>{profile.email} <span>↗</span></a>
          <div className="social-links">
            <a href={profile.social.linkedin}>LinkedIn ↗</a>
            <a href={profile.social.github}>GitHub ↗</a>
          </div>
        </div>
      </div>
    </section>
  );
}
