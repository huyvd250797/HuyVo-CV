import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard";
import { profile } from "@/data/profile";

export const metadata: Metadata = {
  title: `Admin | ${profile.name}`,
  description: "Real CMS / Supabase Admin for editing live portfolio profile data.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <AdminDashboard />;
}
