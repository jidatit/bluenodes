import axios from "axios";
import ApiUrls from "../../../../../globals/apiURL";

export const fetchDeviceManagementList = async (
  page = 1,
  limit = 10,
  batteryLevel,
  status,
  locationId
) => {
  try {
    // Construct the URL using the ApiUrls.SMARTHEATING_DEVICEMANAGEMENT.LIST function
    const url = ApiUrls.SMARTHEATING_DEVICEMANAGEMENT.LIST(
      page,
      limit,
      batteryLevel,
      status,
      locationId
    );

    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    console.error("Error fetching device management list:", error);
    throw error;
  }
};

export const updateDeviceName = async (deviceId, newName) => {
  try {
    const url =
      ApiUrls.SMARTHEATING_DEVICEMANAGEMENT.UPDATE_DEVICE_NAME(deviceId);
    const response = await axios.put(url, { deviceName: newName });

    return response; // assuming the API responds with updated data or success confirmation
  } catch (error) {
    if (error.response) {
      // Server responded with a status other than 200 range
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", error.response.headers);
    } else if (error.request) {
      // Request was made but no response received
      console.error("Error request data:", error.request);
    } else {
      // Something else happened while setting up the request
      console.error("Error message:", error.message);
    }
    throw error;
  }
};

export const getDeviceInfo = async (deviceId) => {
  try {
    const url = ApiUrls.SMARTHEATING_DEVICEMANAGEMENT.GET_DEVICE_INFO(deviceId);
    const response = await axios.get(url);

    return response.data; // This will return the device information object
  } catch (error) {
    console.error("Error fetching device info:", error);
    throw error;
  }
};
