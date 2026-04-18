export function toCssAspectRatio(aspectRatio: string) {
  const [width = "1", height = "1"] = aspectRatio.split(":");
  return `${width} / ${height}`;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
