import axiosInstance from "@/lib/axios";

/**
 * Upload file helper
 */
export const uploadFile = async <T = any>(
  url: string,
  file: File
): Promise<T> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axiosInstance.post<T>(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("[uploadFile] Upload failed:", error?.response?.data || error);
    throw error?.response?.data || error;
  }
};