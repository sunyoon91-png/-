/** Removes characters that are unsafe in filenames across common filesystems. */
function sanitizeForFilename(value: string): string {
  return value.replace(/[\\/:*?"<>|]/g, "").trim();
}

/**
 * Builds an export filename from the title, e.g. a title of
 * "금싸라기 땅에\n국민책방을, 교보문고" becomes "kyobo-thumbnail-교보문고.jpg".
 */
export function buildExportFilename(title: string, extension: "jpg" | "png"): string {
  const tokens = title
    .split(/[\s,\n]+/)
    .map(sanitizeForFilename)
    .filter(Boolean);

  const suffix = tokens.length > 0 ? tokens[tokens.length - 1] : "";
  const base = suffix ? `kyobo-thumbnail-${suffix}` : "kyobo-thumbnail";
  return `${base}.${extension}`;
}
