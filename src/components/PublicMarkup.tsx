/** Only use with src/lib/render.mjs: every content string is escaped and every URL is validated.
 * Shared server-side HTML keeps the dependency-free review and Next.js output identical.
 * Never pass user-supplied HTML to this component.
 */
export function PublicMarkup({ html }: { html: string }) { return <div dangerouslySetInnerHTML={{ __html: html }} />; }
