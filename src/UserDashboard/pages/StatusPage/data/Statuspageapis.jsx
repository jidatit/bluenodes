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
	dateFrom,
) => {
	try {
		const data = await axios.get(
			ApiUrls.SMARTHEATING_STATUSPAGE.ROOM_UNASSIGNED(
				page,
				limit,
				locations,
				eventTypeLevel,
				dateTo,
				dateFrom,
			),
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
	dateFrom,
) => {
	if (eventTypeLevel === null) {
		console.log("do bar ");
		try {
			const data = await axios.get(
				ApiUrls.SMARTHEATING_STATUSPAGE.EVENT_LOGS(
					page,
					limit,
					locations,
					eventTypeLevel,
					dateTo,
					dateFrom,
				),
			);
			return data.data;
		} catch (error) {
			console.log(error);
		}
	} else if (eventTypeLevel !== null && locations === null) {
		locations = null;
		try {
			const data = await axios.get(
				ApiUrls.SMARTHEATING_STATUSPAGE.EVENT_LOGS(
					page,
					limit,
					locations,
					eventTypeLevel,
					dateTo,
					dateFrom,
				),
			);
			return data.data;
		} catch (error) {
			console.log(error);
		}
	}
};
export const fetchDeviceManagementList = async (
	page = 1,
	limit = 10,
	batteryLevel = [],
	status,
	locationId = [],
) => {
	try {
		const params = {
			page,
			limit,
			batteryLevel: batteryLevel.length ? batteryLevel.join(",") : undefined,
			status,
			locationId: locationId.length ? locationId.join(",") : undefined,
		};

		const { data } = await axios.get(
			ApiUrls.SMARTHEATING_STATUSPAGE.DEVICE_MANAGEMENT_LIST,
			{ params },
		);
		return data;
	} catch (error) {
		console.error("Error fetching device management list:", error);
		throw error;
	}
};

export const fetchDevicesOfflineData = async (
	page = 1,
	limit = 10,
	locations,
	eventTypeLevel,
	dateTo,
	dateFrom,
) => {
	try {
		const data = await axios.get(
			ApiUrls.SMARTHEATING_STATUSPAGE.DEVICES_OFFLINE(
				page,
				limit,
				locations,
				eventTypeLevel,
				dateTo,
				dateFrom,
			),
		);
		return data.data;
	} catch (error) {
		console.log(error);
	}
};
