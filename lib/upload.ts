import fs from "fs";
import path from "path";

export async function saveFile(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public/uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filename = `${Date.now()}-${file.name}`;
  const filepath = path.join(uploadDir, filename);

  fs.writeFileSync(filepath, buffer);

  return `/uploads/${filename}`;
}
