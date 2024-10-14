// Helper function to handle form validation
export const validateForm = ({
  formData,
  errors,
  createdHeatingScheduleNames = [],
  //   customValidation = null, // Optional custom validation function for additional conditional logic
}) => {
  const newErrors = {};

  // Check for empty fields
  const allFieldsFilled = Object.values(formData).every(
    (field) => field !== ""
  );
  Object.keys(formData).forEach((key) => {
    if (formData[key] === "") {
      newErrors[key] = errors.missingSelectionOrInformation;
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

  // Validate unique program name
  const programName = formData.programName;
  createdHeatingScheduleNames?.forEach((name) => {
    if (programName === name) {
      newErrors.programName = errors.ProgramWithNameAlreadyCreated;
    }
  });

  // Apply any custom validation passed as prop
  //   if (customValidation) {
  //     customValidation(newErrors, formData);
  //   }

  return { newErrors, allFieldsFilled };
};
