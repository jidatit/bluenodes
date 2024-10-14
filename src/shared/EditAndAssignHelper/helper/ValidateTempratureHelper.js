export const validateTemperaturesHelper = ({
  formData,
  setErrorMessages,
  errors,
  checkForInvalidChars = false, // Pass this flag to determine the behavior
}) => {
  const minTemp = parseFloat(formData.minTemp);
  const maxTemp = parseFloat(formData.maxTemp);

  // Convert minTemp and maxTemp to strings to safely use .includes
  const minTempStr = formData.minTemp?.toString() || "";
  const maxTempStr = formData.maxTemp?.toString() || "";

  // Conditional: Check for invalid characters (only in one of the components)
  if (checkForInvalidChars) {
    const containsInvalidCharacter = (str) => {
      // Regex to match any character that is not a digit, decimal point, °, C, or F
      const invalidCharRegex = /[^0-9°CFa-z]/;
      return invalidCharRegex.test(str);
    };

    const isMinTempDecimal = containsInvalidCharacter(minTempStr);
    const isMaxTempDecimal = containsInvalidCharacter(maxTempStr);

    // Show error if either input contains invalid characters
    if (isMinTempDecimal || isMaxTempDecimal) {
      setErrorMessages((prev) => ({
        ...prev,
        minTemp: isMinTempDecimal ? errors.TempDecimalNotAllowed : "",
        maxTemp: isMaxTempDecimal ? errors.TempDecimalNotAllowed : "",
      }));
      return; // Exit early if there's an invalid character
    }
  }

  // Cross-validate minTemp and maxTemp
  if (minTempStr !== "" && maxTempStr !== "") {
    if (minTemp >= maxTemp && maxTempStr.length >= 2) {
      setErrorMessages((prev) => ({
        ...prev,
        maxTemp: errors.maxTempLowerThanMinTemp,
      }));
    } else {
      // Clear error for both minTemp and maxTemp if valid

      // Initialize the object with maxTemp
      let updatedErrors = {
        maxTemp: "",
      };

      // Conditionally clear minTemp if checkForInvalidChars is true
      if (checkForInvalidChars === true) {
        updatedErrors.minTemp = ""; // Add the minTemp clearing conditionally
      }

      // Set the final error messages
      setErrorMessages((prev) => ({
        ...prev,
        ...updatedErrors,
      }));
    }
  }
};
