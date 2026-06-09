import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, isConfigured } from "./config.js";

// Compress a File to a Blob (JPEG)
function compressToBlob(file, maxPx = 1200, quality = 0.78) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = ({ target: { result } }) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const ratio = Math.min(maxPx / img.width, maxPx / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width  = Math.round(img.width  * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("Compression failed"))),
          "image/jpeg",
          quality
        );
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}

// Upload a single photo → return download URL
export async function uploadPhoto(storagePath, file) {
  if (!isConfigured) throw new Error("Firebase not configured");
  const blob     = await compressToBlob(file);
  const photoRef = ref(storage, storagePath);
  await uploadBytes(photoRef, blob, { contentType: "image/jpeg" });
  return await getDownloadURL(photoRef);
}

/**
 * Upload all photos in parallel.
 * File   → compress + upload → URL
 * string → returned as-is
 * null/"" → skipped
 */
export async function uploadPhotos(basePath, photos) {
  const results = await Promise.all(
    photos.map((item, i) => {
      if (!item) return Promise.resolve(null);
      if (typeof item === "string") return Promise.resolve(item || null);
      if (item instanceof File)
        return uploadPhoto(`${basePath}/photo${i + 1}.jpeg`, item).catch(() => null);
      return Promise.resolve(null);
    })
  );
  return results.filter(Boolean);
}

// Create an object-URL preview for a File (revoke when done)
export function previewUrl(item) {
  if (!item) return "";
  if (typeof item === "string") return item;
  if (item instanceof File) return URL.createObjectURL(item);
  return "";
}
