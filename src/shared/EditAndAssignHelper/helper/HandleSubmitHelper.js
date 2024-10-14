import axios from "axios";

export const handleSubmitHelper = ({
  formData,
  errors,
  ApiUrls,
  setErrorMessages,
  setFormSubmitted,
  fetchHeatingSchedules,
  createdHeatingScheduleNames,
  checkProgramName, // Conditional to check program name
  assign,
}) => {
  setFormSubmitted(true);
  let allFieldsFilled = true; // Flag to check if all fields are filled
  const newErrors = {};

  // Check for empty fields
  Object.keys(formData).forEach((key) => {
    if (formData[key] === "") {
      newErrors[key] = errors.missingSelectionOrInformation;
      allFieldsFilled = false; // Set flag to false if any field is empty
    }
  });

  // Fetch heating schedules if provided

  const fetchHeatingScheduless = async () => {
    try {
      const response = await axios.get(
        ApiUrls.SMARTHEATING_HEATINGSCHEDULE.LIST
      );
      const data = await response.data;
      const templateNames =
        data.length > 0 ? data.map((template) => template.templateName) : [];
      setCreatedHeatingScheduleNames(templateNames);
    } catch (error) {
      console.error("Error:", error);
    }
  };
  if (assign === true) {
    fetchHeatingScheduless().then(() => {
      // Continue execution after data is fetched

      const programName = formData.programName;
      createdHeatingScheduleNames &&
        createdHeatingScheduleNames.map((name, index) => {
          if (programName == name) {
            newErrors.programName = errors.ProgramWithNameAlreadyCreated;
          }
        });

      // Validate temperature fields

      const minTemp = parseFloat(formData.minTemp);
      const maxTemp = parseFloat(formData.maxTemp);

      if (!isNaN(minTemp) && (minTemp < 10 || minTemp > 29)) {
        newErrors.minTemp = errors.minTempInvalid;
      }
      if (!isNaN(maxTemp) && (maxTemp < 11 || maxTemp > 30)) {
        newErrors.maxTemp = errors.maxTempInvalid;
      }
      if (!isNaN(minTemp) && !isNaN(maxTemp) && maxTemp <= minTemp) {
        newErrors.maxTemp = errors.maxTempLowerThanMinTemp;
      }

      if (Object.keys(newErrors).length > 0 || !allFieldsFilled) {
        setErrorMessages(newErrors);
        return false;
      } else {
        return true;
      }
    });
  }

  if (assign === false) {
    fetchHeatingSchedules(); // Wait for data to be fetched
    console.log("enter", assign);
    // Program name check conditionally

    const programName = formData.programName;
    createdHeatingScheduleNames &&
      createdHeatingScheduleNames.map((name, index) => {
        if (programName == name) {
          newErrors.programName = errors.ProgramWithNameAlreadyCreated;
        }
      });

    // Validate temperature fields
    const minTemp = parseFloat(formData.minTemp);
    const maxTemp = parseFloat(formData.maxTemp);

    // Check if input is a decimal
    const minTempStr = formData.minTemp?.toString() || "";
    const maxTempStr = formData.maxTemp?.toString() || "";

    const containsInvalidCharacter = (str) => {
      // Regex to match any character that is not a digit, decimal point, °, C, or F
      const invalidCharRegex = /[^0-9°CFa-z]/;
      return invalidCharRegex.test(str);
    };

    const isMinTempDecimal = containsInvalidCharacter(minTempStr);
    const isMaxTempDecimal = containsInvalidCharacter(maxTempStr);

    // Check for decimal values
    if (isMinTempDecimal) {
      newErrors.minTemp = errors.TempDecimalNotAllowed;
    }
    if (isMaxTempDecimal) {
      newErrors.maxTemp = errors.TempDecimalNotAllowed;
    }

    // Validate the temperature range only if there are no decimal errors
    if (!isMinTempDecimal && !isMaxTempDecimal) {
      if (!isNaN(minTemp) && (minTemp < 10 || minTemp > 29)) {
        newErrors.minTemp = errors.minTempInvalid;
      }
      if (!isNaN(maxTemp) && (maxTemp < 11 || maxTemp > 30)) {
        newErrors.maxTemp = errors.maxTempInvalid;
      }
      if (!isNaN(minTemp) && !isNaN(maxTemp) && maxTemp <= minTemp) {
        newErrors.maxTemp = errors.maxTempLowerThanMinTemp;
      }
    }

    // Set error messages and check if the form is valid
    if (Object.keys(newErrors).length > 0 || !allFieldsFilled) {
      setErrorMessages(newErrors);
      console.log("return22");
      return false;
    }
  }

  // Validation passed
  return true;
};
