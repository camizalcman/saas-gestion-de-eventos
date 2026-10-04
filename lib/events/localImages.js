import fs from "fs";
import path from "path";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

export function listLocalEventImages() {
  const dir = path.join(process.cwd(), "public", "events");

  try {
    return fs
      .readdirSync(dir)
      .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
      .map((file) => `/events/${file}`)
      .sort();
  } catch {
    return [];
  }
}
