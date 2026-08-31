import { profile as sourceProfile, type PortfolioProfile } from "@/data/profile";

export type PortfolioSource = "supabase" | "source";

export type PortfolioReadResult = {
  profile: PortfolioProfile;
  source: PortfolioSource;
  reason?: string;
  updatedAt?: string | null;
  supabaseConfigured: boolean;
  canWrite: boolean;
  table: string;
  recordId: string;
};

const defaultTable = "portfolio_profiles";
const defaultRecordId = "default";

export const cmsConfig = {
  table: process.env.SUPABASE_PORTFOLIO_TABLE || defaultTable,
  recordId: process.env.SUPABASE_PORTFOLIO_ID || defaultRecordId,
  revalidateSeconds: Number(process.env.PORTFOLIO_REVALIDATE_SECONDS || 60),
};

function supabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") || "";
}

function anonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
}

function serviceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

function readKey() {
  return serviceKey() || anonKey();
}

export function isSupabaseReadConfigured() {
  return Boolean(supabaseUrl() && readKey());
}

export function isSupabaseWriteConfigured() {
  return Boolean(supabaseUrl() && serviceKey());
}

export function isAdminPasswordValid(password: string | null) {
  const expected = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "huyvo-admin";
  return Boolean(password && password === expected);
}

function profileEndpoint(select = "data,updated_at") {
  const params = new URLSearchParams({
    id: `eq.${cmsConfig.recordId}`,
    select,
    limit: "1",
  });
  return `${supabaseUrl()}/rest/v1/${cmsConfig.table}?${params.toString()}`;
}

export async function readPortfolioProfile(options?: { noStore?: boolean }): Promise<PortfolioReadResult> {
  const table = cmsConfig.table;
  const recordId = cmsConfig.recordId;
  const supabaseConfigured = isSupabaseReadConfigured();
  const canWrite = isSupabaseWriteConfigured();

  if (!supabaseConfigured) {
    return {
      profile: sourceProfile,
      source: "source",
      reason: "Supabase environment variables are not configured. Using src/data/profile.ts fallback.",
      supabaseConfigured,
      canWrite,
      table,
      recordId,
    };
  }

  try {
    const key = readKey();
    const response = await fetch(profileEndpoint(), {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      cache: options?.noStore ? "no-store" : undefined,
      next: options?.noStore ? undefined : { revalidate: cmsConfig.revalidateSeconds },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        profile: sourceProfile,
        source: "source",
        reason: `Supabase read failed (${response.status}). ${errorText || "Using fallback profile."}`,
        supabaseConfigured,
        canWrite,
        table,
        recordId,
      };
    }

    const rows = (await response.json()) as Array<{ data?: PortfolioProfile; updated_at?: string | null }>;
    const row = rows[0];

    if (!row?.data) {
      return {
        profile: sourceProfile,
        source: "source",
        reason: `No Supabase record found for id '${recordId}'. Using fallback profile until you save from /admin.`,
        supabaseConfigured,
        canWrite,
        table,
        recordId,
      };
    }

    return {
      profile: row.data,
      source: "supabase",
      updatedAt: row.updated_at ?? null,
      supabaseConfigured,
      canWrite,
      table,
      recordId,
    };
  } catch (error) {
    return {
      profile: sourceProfile,
      source: "source",
      reason: error instanceof Error ? error.message : "Unexpected Supabase read error. Using fallback profile.",
      supabaseConfigured,
      canWrite,
      table,
      recordId,
    };
  }
}

export async function getPortfolioProfile() {
  const result = await readPortfolioProfile();
  return result.profile;
}

export async function savePortfolioProfile(data: PortfolioProfile) {
  if (!isSupabaseWriteConfigured()) {
    throw new Error("Supabase write is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  const key = serviceKey();
  const response = await fetch(`${supabaseUrl()}/rest/v1/${cmsConfig.table}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({
      id: cmsConfig.recordId,
      data,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Supabase write failed with status ${response.status}.`);
  }

  return response.json() as Promise<Array<{ id: string; updated_at: string }>>;
}
