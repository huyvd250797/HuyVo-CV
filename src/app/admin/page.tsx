import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard";
import { profile } from "@/data/profile";

export const metadata: Metadata = {
  title: `Admin | ${profile.name}`,
  description: "Portfolio CMS / Admin Lite for editing browser drafts and exporting profile configuration.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <AdminDashboard />;
}
