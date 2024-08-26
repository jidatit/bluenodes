const BASE = import.meta.env.VITE_APP_API_BASE_URL;
const STAGE = import.meta.env.VITE_APP_STAGE;

const ApiUrls = {
  BASE,
  STAGE,
  BASE_URL: `${BASE}${STAGE}`,
  AUTH_LOGIN: '/auth/login',
  SMARTHEATING_HEATINGSCHEDULE: {
    LIST: '/smartheating/heatingschedule/list',
    HEATINGSCHEDULE: '/smartheating/heatingschedule',
    HEATINGSCHEDULE_FROM_EDIT: '/smartheating/heatingschedule?from=edit',
    HEATINGSCHEDULE_ID: (heatingScheduleId) => `/smartheating/heatingschedule/${heatingScheduleId}`,
    ASSIGN_ROOM: (heatingScheduleId) => `/smartheating/heatingschedule/${heatingScheduleId}/assignrooms`,
    DETAILS: (heatingScheduleId) => `/smartheating/heatingschedule/${heatingScheduleId}/details`
  },
  SMARTHEATING_OPERATIONALVIEW: {
    DETAILS: (floorId) => `smartheating/operationaloverview/${floorId}/details`,
    LIST: `smartheating/operationaloverview/list`
  },
  SMARTHEATING_LOCATIONS: {
    LOCATIONS: (heatingScheduleDetails, roomTemperature, assignedNumberOfRooms, numberOfRooms) => `/smartheating/locations?heatingScheduleDetails=${heatingScheduleDetails}&roomTemperature=${roomTemperature}&assignedNumberOfRooms=${assignedNumberOfRooms}&numberOfRooms=${numberOfRooms}`
  },
  USER: {
    PROFILE: '/user/profile'
  }
};

export default ApiUrls;
