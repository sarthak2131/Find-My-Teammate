/**
 * Resize and re-encode images in the browser so poster uploads stay small.
 */
export async function compressImageFile(
  file,
  { maxWidth = 1280, maxHeight = 1280, quality = 0.82 } = {}
) {
  if (!file?.type?.startsWith("image/")) {
    return file;
  }

  let bitmap;

  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  let { width, height } = bitmap;
  const scale = Math.min(1, maxWidth / width, maxHeight / height);
  width = Math.round(width * scale);
  height = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", quality);
  });

  if (!blob) {
    return file;
  }

  const baseName = file.name.replace(/\.[^.]+$/, "") || "poster";
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}
