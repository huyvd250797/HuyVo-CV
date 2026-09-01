const driveFileIdPattern = /(?:\/file\/d\/|\/d\/|[?&]id=)([a-zA-Z0-9_-]{10,})/;
const bareDriveIdPattern = /^[a-zA-Z0-9_-]{20,}$/;

export type MediaUrlInfo = {
  originalUrl: string;
  normalizedUrl: string;
  previewUrl: string;
  viewUrl: string;
  downloadUrl: string;
  provider: "google-drive" | "direct" | "empty";
  fileId: string | null;
};

export function cleanMediaUrl(value?: string | null) {
  const raw = (value || "").trim();
  if (!raw) return "";

  if (raw.startsWith("//")) return `https:${raw}`;
  if (/^https?:\/\//i.test(raw) || raw.startsWith("/") || raw.startsWith("mailto:")) return raw;
  if (/^(www\.|drive\.google\.com|docs\.google\.com|google\.com|lh3\.googleusercontent\.com)/i.test(raw)) {
    return `https://${raw}`;
  }

  return raw;
}

export function extractGoogleDriveFileId(value?: string | null) {
  const raw = (value || "").trim();
  if (!raw) return null;

  if (bareDriveIdPattern.test(raw)) return raw;

  const normalized = cleanMediaUrl(raw);
  const decoded = decodeURIComponent(normalized);

  const queryId = decoded.match(/[?&]id=([a-zA-Z0-9_-]{10,})/i)?.[1];
  if (queryId) return queryId;

  const pathId = decoded.match(driveFileIdPattern)?.[1];
  if (pathId) return pathId;

  const userContentId = decoded.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]{10,})/i)?.[1];
  if (userContentId) return userContentId;

  return null;
}

export function isGoogleDriveMediaUrl(value?: string | null) {
  return Boolean(extractGoogleDriveFileId(value));
}

export function googleDrivePreviewUrl(fileId: string, size = 1600) {
  return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w${size}`;
}

export function googleDriveViewUrl(fileId: string) {
  return `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/view?usp=sharing`;
}

export function googleDriveDownloadUrl(fileId: string) {
  return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`;
}

export function mediaUrlInfo(value?: string | null, size = 1600): MediaUrlInfo {
  const originalUrl = (value || "").trim();
  if (!originalUrl) {
    return {
      originalUrl: "",
      normalizedUrl: "",
      previewUrl: "",
      viewUrl: "",
      downloadUrl: "",
      provider: "empty",
      fileId: null,
    };
  }

  const fileId = extractGoogleDriveFileId(originalUrl);
  if (fileId) {
    return {
      originalUrl,
      normalizedUrl: googleDriveViewUrl(fileId),
      previewUrl: googleDrivePreviewUrl(fileId, size),
      viewUrl: googleDriveViewUrl(fileId),
      downloadUrl: googleDriveDownloadUrl(fileId),
      provider: "google-drive",
      fileId,
    };
  }

  const normalizedUrl = cleanMediaUrl(originalUrl);
  return {
    originalUrl,
    normalizedUrl,
    previewUrl: normalizedUrl,
    viewUrl: normalizedUrl,
    downloadUrl: normalizedUrl,
    provider: "direct",
    fileId: null,
  };
}

export function mediaPreviewUrl(value?: string | null, size = 1600) {
  return mediaUrlInfo(value, size).previewUrl;
}

export function mediaViewUrl(value?: string | null) {
  return mediaUrlInfo(value).viewUrl;
}

export function mediaDownloadUrl(value?: string | null) {
  return mediaUrlInfo(value).downloadUrl;
}
