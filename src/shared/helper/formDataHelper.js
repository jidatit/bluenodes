const setFormDataHelper = (program, component) => {
  return {
    programName: component === "clone" 
      ? (program?.templateName + " - Cloned") || "" 
      : program?.templateName || "",
    childSafety: program?.allowDeviceOverride === true ? "No" : "Yes" || "",
    minTemp: program?.deviceOverrideTemperatureMin + "°C" || "",
    maxTemp: program?.deviceOverrideTemperatureMax + "°C" || "",
    applyAlgorithm: "Yes",
  };
};
export default setFormDataHelper;
