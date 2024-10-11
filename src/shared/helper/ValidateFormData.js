const validateFormData = (formData, errors) => {
    const newErrors = {};
    
    // Check for empty fields
    const allFieldsFilled = Object.values(formData).every(field => field !== "");
    if (!allFieldsFilled) {
      newErrors.general = errors.allFieldsRequired;
    }
  
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
  
    // Check if specific fields are missing
    Object.keys(formData).forEach((key) => {
      if (formData[key] === "") {
        newErrors[key] = errors.missingSelectionOrInformation;
      }
    });
  
    return {
      allFieldsFilled,
      errors: newErrors
    };
  };
 export default validateFormData;   