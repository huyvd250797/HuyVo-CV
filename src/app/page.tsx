import { PortfolioPage } from "@/components/portfolio-page";
import { localizeProfile } from "@/data/i18n";
import { readPortfolioProfile } from "@/lib/portfolio-cms";

export default async function Home() {
  const { profile } = await readPortfolioProfile();
  const localizedProfile = localizeProfile(profile, "en");
  return <PortfolioPage profile={localizedProfile} locale="en" />;
}
