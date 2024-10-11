const handleFormChangeHelper = (
    e,
    formData,
    setFormData,
    formDataApi,
    validateFieldHelper,
    setErrorMessages,
    errors,
    setGeneralErrorMessage,
    mode
  ) => {
    const { id, value } = e.target;

    // Validate the field based on the change
    validateFieldHelper(id, value, formData, setErrorMessages, errors);
  
    // Conditional handling based on 'childSafetyYes' and 'childSafetyNo'
    if (id === "childSafetyYes") {
      setFormData((prev) => ({
        ...prev,
        childSafety: value,
        minTemp: "min",
        maxTemp: "max",
      }));
    } else if (id === "childSafetyNo") {
      // Handle mode-specific logic for setting temperature values
      if (mode === "create") {
        // In create mode, clear minTemp and maxTemp
        setFormData((prev) => ({
          ...prev,
          childSafety: value,
          minTemp: "",
          maxTemp: "",
        }));
      } 
      
       
      if (mode === "edit"|| mode==="clone") {
        // In edit mode, restore the original values from the API
        setFormData((prev) => ({
          ...prev,
          childSafety: value,
          minTemp: formDataApi.deviceOverrideTemperatureMin,
          maxTemp: formDataApi.deviceOverrideTemperatureMax,
        }));
      }
    } else if (id === "applyAlgorithmYes" || id === "applyAlgorithmNo") {
      setFormData((prev) => ({
        ...prev,
        applyAlgorithm: value,
      }));
    } else {
      // Generic field update for other inputs
      setFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  
    // Re-validate the related temperature field when temperature fields are updated
    if (id === "minTemp" && formData.maxTemp) {
      validateFieldHelper(
        "maxTemp",
        formData.maxTemp,
        formData,
        setErrorMessages,
        errors
      );
    }
    if (id === "maxTemp" && formData.minTemp) {
      validateFieldHelper(
        "minTemp",
        formData.minTemp,
        formData,
        setErrorMessages,
        errors
      );
    }
  
    // Check if all fields are filled
    const allFieldsFilled = Object.values({
      ...formData,
      [id]: value,
    }).every((field) => field !== "");
  
    // Clear error messages if all fields are filled
    if (allFieldsFilled) {
      setErrorMessages({});
      setGeneralErrorMessage(""); // Clear the general error message
    }
  };

  export default handleFormChangeHelper;
