export const validateFieldHelper = ({
  id,
  value,
  formData,
  errors,
  setErrorMessages,
}) => {
  let error = "";

  if (value === "") {
    error = errors.missingSelectionOrInformation;
  } else {
    const minTemp =
      id === "minTemp" ? parseFloat(value) : parseFloat(formData.minTemp);
    const maxTemp =
      id === "maxTemp" ? parseFloat(value) : parseFloat(formData.maxTemp);

    if (id === "minTemp") {
      if (isNaN(minTemp) || minTemp < 10 || minTemp > 29) {
        error = errors.minTempInvalid;
      } else if (maxTemp !== "" && minTemp >= maxTemp) {
        // Update error state for maxTemp immediately
        setErrorMessages((prev) => ({
          ...prev,
          maxTemp: errors.maxTempLowerThanMinTemp,
        }));
      } else {
        // Clear error for maxTemp if minTemp is valid and lower than maxTemp
        setErrorMessages((prev) => ({
          ...prev,
          maxTemp: "",
        }));
      }
    }

    if (id === "maxTemp") {
      if (isNaN(maxTemp) || maxTemp < 11 || maxTemp > 30) {
        error = errors.maxTempInvalid;
      } else if (minTemp !== "" && maxTemp <= minTemp) {
        error = errors.maxTempLowerThanMinTemp;
      }
    }
  }

  // Set error message for the current field
  setErrorMessages((prev) => ({
    ...prev,
    [id]: error,
  }));
};
