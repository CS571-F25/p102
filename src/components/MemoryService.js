import { bucketGet, bucketPut } from "../Bucket";

// Fetch ALL memories at once
export async function fetchAllMemories() {
  const res = await bucketGet("memories");
  if (res && res.results) return res.results;
  return {};
}

// Add or append an image for this event
export async function addEventMemory(eventId, userId, base64Data) {
  const all = await fetchAllMemories();

  const existing = all[eventId];
  const oldImages =
    existing && Array.isArray(existing.images) ? existing.images : [];

  const newImages = [
    ...oldImages,
    {
      userId,
      data: base64Data,
      uploadedAt: Date.now()
    }
  ];

  // Write back using PUT
  const resp = await bucketPut("memories", eventId, { images: newImages });

  return newImages;
}