const BASE = import.meta.env.VITE_APP_API_BASE_URL;
const STAGE = import.meta.env.VITE_APP_STAGE;

const ApiUrls = {
	BASE,
	STAGE,
	BASE_URL: `${BASE}${STAGE}`,
	AUTH_LOGIN: "/auth/login",

	SMARTHEATING_STATUSPAGE: {
		STATS: "/smartheating/statuspage/report",
		EVENT_LOGS: (page, limit, locations, eventTypeLevel, dateTo, dateFrom) => {
			let url = `/smartheating/statuspage/list?page=${page}&limit=${limit}`;
			if (locations) {
				url += `&locationId=${locations}`;
			}
			if (eventTypeLevel) {
				url += `&eventTypeLevel=${eventTypeLevel}`;
			}
			if (dateTo && dateFrom) {
				url += `&dateTo=${dateTo}&dateFrom=${dateFrom}`;
			}
			return url;
		},
		ROOM_UNASSIGNED: (
			page,
			limit,
			locations,
			eventTypeLevel,
			dateTo,
			dateFrom,
		) => {
			let url = `/smartheating/statuspage/list-unassigned-rooms?page=${page}&limit=${limit}`;
			if (locations) {
				url += `&locationId=${locations}`;
			}
			if (eventTypeLevel) {
				url += `&eventTypeLevel=${eventTypeLevel}`;
			}
			if (dateTo && dateFrom) {
				url += `&dateTo=${dateTo}&dateFrom=${dateFrom}`;
			}
			return url;
		},
		DEVICES_OFFLINE: (
			page,
			limit,
			locations,
			eventTypeLevel,
			dateTo,
			dateFrom,
		) => {
			let url = `/smartheating/statuspage/list-devices-offline?page=${page}&limit=${limit}`;
			if (locations) {
				url += `&locationId=${locations}`;
			}
			if (eventTypeLevel) {
				url += `&eventTypeLevel=${eventTypeLevel}`;
			}
			if (dateTo && dateFrom) {
				url += `&dateTo=${dateTo}&dateFrom=${dateFrom}`;
			}
			return url;
		},
	},

	SMARTHEATING_HEATINGSCHEDULE: {
		LIST: "/smartheating/heatingschedule/list",
		HEATINGSCHEDULE: "/smartheating/heatingschedule",
		HEATINGSCHEDULE_FROM_EDIT: "/smartheating/heatingschedule?from=edit",
		HEATINGSCHEDULE_ID: (heatingScheduleId) =>
			`/smartheating/heatingschedule/${heatingScheduleId}`,
		ASSIGN_ROOM: (heatingScheduleId) =>
			`/smartheating/heatingschedule/${heatingScheduleId}/assignrooms`,
		DETAILS: (heatingScheduleId) =>
			`/smartheating/heatingschedule/${heatingScheduleId}/details`,
	},

	SMARTHEATING_OPERATIONALVIEW: {
		DETAILS: (floorId) =>
			`/smartheating/operationaloverview/${floorId}/details`,
		LIST: `/smartheating/operationaloverview/list`,
	},

	SMARTHEATING_LOCATIONS: {
		LOCATIONS: (
			heatingScheduleDetails,
			roomTemperature,
			assignedNumberOfRooms,
			numberOfRooms,
		) =>
			`/smartheating/locations?heatingScheduleDetails=${heatingScheduleDetails}&roomTemperature=${roomTemperature}&assignedNumberOfRooms=${assignedNumberOfRooms}&numberOfRooms=${numberOfRooms}`,
		LIST: `/smartheating/locations`,
	},

	SMARTHEATING_DEVICEMANAGEMENT: {
		LIST: (page, limit, batteryLevel, status, locationId) => {
			let url = `/smartheating/devicemanagement/list?page=${page}&limit=${limit}`;
			if (batteryLevel) {
				url += `&batteryLevel=${batteryLevel}`;
			}
			if (status) {
				url += `&status=${status}`;
			}
			if (locationId) {
				url += `&locationId=${locationId}`;
			}
			return url;
		},
		UPDATE_DEVICE_NAME: (deviceId) =>
			`/smartheating/devicemanagement/devicename/${deviceId}`,
		GET_DEVICE_INFO: (id) => `/smartheating/devicemanagement/lastpayload/${id}`,
	},

	USER: {
		PROFILE: "/user/profile",
	},
};

export default ApiUrls;
