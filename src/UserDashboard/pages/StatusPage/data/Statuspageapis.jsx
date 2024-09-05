import ApiUrls from "../../../../globals/apiURL";
import axios from "axios";

export const fetchStatusPageStats = async () => {
  try {
    const data = await axios.get(ApiUrls.SMARTHEATING_STATUSPAGE.STATS);
    return data.data;
  } catch (error) {
    console.log(error);
  }
};

export const fetchUnassignedRoomsData = async (
  page = 1,
  limit = 10,
  locations,
  eventTypeLevel,
  dateTo,
  dateFrom
) => {
  try {
    const data = await axios.get(
      ApiUrls.SMARTHEATING_STATUSPAGE.ROOM_UNASSIGNED(
        page,
        limit,
        locations,
        eventTypeLevel,
        dateTo,
        dateFrom
      )
    );
    return data.data;
  } catch (error) {
    console.log(error);
  }
};

export const fetchEventLogsData = async (
  page = 1,
  limit = 10,
  locations,
  eventTypeLevel,
  dateTo,
  dateFrom
) => {
  if (eventTypeLevel === null) {
    console.log("do bar ", locations);
    try {
      const data = await axios.get(
        ApiUrls.SMARTHEATING_STATUSPAGE.EVENT_LOGS(
          page,
          limit,
          locations,
          eventTypeLevel,
          dateTo,
          dateFrom
        )
      );
      return data.data;
    } catch (error) {
      console.log(error);
    }
  } else if (eventTypeLevel !== null && locations === null) {
    console.log("teen bar ");
    locations = null;
    try {
      const data = await axios.get(
        ApiUrls.SMARTHEATING_STATUSPAGE.EVENT_LOGS(
          page,
          limit,
          locations,
          eventTypeLevel,
          dateTo,
          dateFrom
        )
      );
      return data.data;
    } catch (error) {
      console.log(error);
    }
  }
};

export const fetchDevicesOfflineData = async (
  page = 1,
  limit = 10,
  locations,
  eventTypeLevel,
  dateTo,
  dateFrom
) => {
  try {
    const data = await axios.get(
      ApiUrls.SMARTHEATING_STATUSPAGE.DEVICES_OFFLINE(
        page,
        limit,
        locations,
        eventTypeLevel,
        dateTo,
        dateFrom
      )
    );
    return data.data;
  } catch (error) {
    console.log(error);
  }
};
