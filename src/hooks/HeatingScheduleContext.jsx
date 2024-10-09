import { createContext, useState, useContext } from "react";

// Create Context
const HeatingScheduleContext = createContext();

// Create Provider Component
export const HeatingScheduleProvider = ({ children }) => {
  const [createdHeatingScheduleNames, setCreatedHeatingScheduleNames] =
    useState([]);

  return (
    <HeatingScheduleContext.Provider
      value={{ createdHeatingScheduleNames, setCreatedHeatingScheduleNames }}
    >
      {children}
    </HeatingScheduleContext.Provider>
  );
};

// Create a custom hook to use the context
export const useHeatingSchedule = () => {
  return useContext(HeatingScheduleContext);
};
