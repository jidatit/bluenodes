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

export const fetchUnassignedRoomsData = async (page = 1, limit = 10, locations) => {
    try {
        const data = await axios.get(ApiUrls.SMARTHEATING_STATUSPAGE.ROOM_UNASSIGNED(page, limit, locations))
        return data.data;
    } catch (error) {
        console.log(error)
    }
}

export const fetchEventLogsData = async (page = 1, limit = 10, locations) => {
    try {
        const data = await axios.get(ApiUrls.SMARTHEATING_STATUSPAGE.EVENT_LOGS(page, limit, locations))
        return data.data;
    } catch (error) {
        console.log(error)
    }
}

export const fetchDevicesOfflineData = async (page = 1, limit = 10) => {
    try {
        const data = await axios.get(ApiUrls.SMARTHEATING_STATUSPAGE.DEVICES_OFFLINE(page, limit))
        return data.data;
    } catch (error) {
        console.log(error)
    }
}