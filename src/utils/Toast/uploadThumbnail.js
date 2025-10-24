import { uploadAndGetUrl } from "../constant";

export const uploadThumbnail = async (thumbnailUri, folder = "workouts") => {
  if (!thumbnailUri) return "";

  try {
    const uploadedUrl = await uploadAndGetUrl(
      { path: thumbnailUri, uri: thumbnailUri },
      folder
    );
    return uploadedUrl;
  } catch (error) {
    console.log("🔥 Thumbnail Upload Error:", error);
    throw error;
  }
};
