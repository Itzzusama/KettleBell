import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { baseUrl } from "../services/api";
export const uploadAndGetUrl = async (
  file,
  type = "profile",
  folder = "profiles"
) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const formData = new FormData();
    formData.append("image", {
      uri: file.path || file.fileCopyUri || "",
      type: "image/jpeg",
      name: "photo.jpg",
    });
    formData.append("type", type);
    formData.append("folder", folder);
    const res = await axios.post(
      `${baseUrl}api/upload/image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res?.data?.data?.url;
  } catch (err) {
    console.log("================err", err.response.data);
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
}
