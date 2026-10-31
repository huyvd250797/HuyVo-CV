import type { Profile, RenderOptions } from './types';
export function escapeHtml(value: unknown): string;
export function safeWebUrl(value: string): string | null;
export function safeEmail(value: string): string | null;
export function safePhone(value: string): string | null;
export function assetPath(value: string, prefix?: string): string | null;
export function renderCv(profile: Profile, options?: RenderOptions): string;
export function renderPortfolio(profile: Profile, options?: RenderOptions): string;
export function renderDocument(profile: Profile, kind?: string, options?: RenderOptions): string;
