# PDF / OG fonts

Static TTF Noto Sans Regular, Noto Sans Bold, Noto Serif Regular; OFL license included.
Downloaded 2026-10-31 from the official https://github.com/notofonts/noto-fonts repository:
`hinted/ttf/NotoSans/NotoSans-Regular.ttf`, `NotoSans-Bold.ttf`,
`hinted/ttf/NotoSerif/NotoSerif-Regular.ttf` and root `LICENSE`.

Used locally at runtime; no font CDN request is needed for PDF/OG Vietnamese text.
Keep all these files in the server bundle via next.config.ts outputFileTracingIncludes.
The website continues to use the existing subset WOFF2 files in the parent directory.
