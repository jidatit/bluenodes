import axios from 'axios';

const validateAndSubmit = (
  formData,
  program,
  errors,
  setCreatedHeatingScheduleNames,
  setErrorMessages,
  handleCheckName,
  setFormSubmitted,
  createdHeatingScheduleNames,
  ApiUrls,
  mode
) => {
  handleCheckName();
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
if(mode==="edit")
{
    const fetchHeatingSchedules = async () => {
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
      fetchHeatingSchedules();
  
      const programName = formData.programName;
      const isSameAsTemplateName = program.templateName === programName;
  
      if (!isSameAsTemplateName) {
        createdHeatingScheduleNames?.forEach((name) => {
          if (programName === name) {
            newErrors.programName = errors.ProgramWithNameAlreadyCreated;
          }
        });
      }
  


      
}
 if(mode==="create"|| mode==="clone")
 {
    const fetchHeatingSchedules = async () => {
        try {
          const response = await axios.get(
            ApiUrls.SMARTHEATING_HEATINGSCHEDULE.LIST
          );
          const data = await response.data;
          const templateNames =
            data.length > 0 ? data.map((template) => template.templateName) : [];
          setCreatedHeatingScheduleNames(templateNames);
          const nameExistsInCreatedSchedules =
            createdHeatingScheduleNames?.includes(formData.programName);
  
          return nameExistsInCreatedSchedules;
        } catch (error) {
          console.error("Error:", error);
        }
      };
      const nameExistsInCreatedSchedules = fetchHeatingSchedules();
      const programName = formData.programName;
      if (nameExistsInCreatedSchedules) {
        createdHeatingScheduleNames?.forEach((name) => {
          if (programName === name) {
            newErrors.programName = errors.ProgramWithNameAlreadyCreated;
          }
        });
      }
  


 }

  // Validate temperature fields
  const minTemp = parseFloat(formData.minTemp);
  const maxTemp = parseFloat(formData.maxTemp);

  const minTempStr = formData.minTemp?.toString() || "";
  const maxTempStr = formData.maxTemp?.toString() || "";

  const containsInvalidCharacter = (str) => {
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
  if (Object.keys(newErrors).length > 0 || !allFieldsFilled) {
    setErrorMessages(newErrors);
    return false; // Indicate that validation failed
  }

  return true; // Indicate that validation passed
};

export default validateAndSubmit;
