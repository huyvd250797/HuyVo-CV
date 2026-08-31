import { profile } from "@/data/profile";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>© 2026 {profile.name}. All rights reserved.</span>
        <span>Designed for clarity. Built for the web.</span>
        <span>V0.1.0</span>
      </div>
    </footer>
  );
}
