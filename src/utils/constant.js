import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "@react-native-firebase/storage";
import { getApp } from "@react-native-firebase/app";

export const uploadAndGetUrl = async (file, folder = "profiles") => {
  try {
    const app = getApp(); // Ensure app initialized
    const storage = getStorage(app);

    const fileName = `photo_${Date.now()}.jpg`;
    const storageRef = ref(storage, `${folder}/${fileName}`);

    const response = await fetch(file.path || file.fileCopyUri);
    const blob = await response.blob();

    const uploadTask = uploadBytesResumable(storageRef, blob);

    await new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // console.log(snapshot.bytesTransferred, "of", snapshot.totalBytes);
        },
        (error) => reject(error),
        () => resolve()
      );
    });

    const downloadUrl = await getDownloadURL(storageRef);

    return downloadUrl;
  } catch (error) {
    console.log("🔥 Firebase upload error:", error);
    throw error;
  }
};
export const modalDays = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};
