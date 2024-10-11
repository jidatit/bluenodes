const validateTemperatureHelper = (formData, setErrorMessages, errors, mode) => {
    const minTemp = parseFloat(formData.minTemp);
    const maxTemp = parseFloat(formData.maxTemp);
  
    // Convert minTemp and maxTemp to strings for validation
    const minTempStr = formData.minTemp?.toString() || "";
    const maxTempStr = formData.maxTemp?.toString() || "";
  
    // Helper to check for invalid characters
    const containsInvalidCharacter = (str) => {
      const invalidCharRegex = /[^0-9°CFa-z]/;
      return invalidCharRegex.test(str);
    };
  
    const isMinTempDecimal = containsInvalidCharacter(minTempStr);
    const isMaxTempDecimal = containsInvalidCharacter(maxTempStr);
  
    // Conditional validation logic based on mode (edit or create)
    const isValidForMode =
      mode === "create"
        ? minTemp !== "" && maxTemp !== ""
        :minTempStr !== "" && maxTempStr !== "" ;
  
    if (isValidForMode) {
      if (isMinTempDecimal || isMaxTempDecimal) {
        // Show error if any input has invalid characters
        setErrorMessages((prev) => ({
          ...prev,
          minTemp: isMinTempDecimal ? errors.TempDecimalNotAllowed : "",
          maxTemp: isMaxTempDecimal ? errors.TempDecimalNotAllowed : "",
        }));
      } else if (minTemp >= maxTemp && maxTempStr.length >= 2) {
        // Cross-field validation
        setErrorMessages((prev) => ({
          ...prev,
          maxTemp: errors.maxTempLowerThanMinTemp,
        }));
      } else {
        // Clear error messages if validation passes
        setErrorMessages((prev) => ({
          ...prev,
          maxTemp: "",
          minTemp: "",
        }));
      }
    }
  };
  export default validateTemperatureHelper;
  