import axios from "axios";

const handleCheckNameHelper = async (
  ApiUrls,
  setCreatedHeatingScheduleNames,
  formData,
  program,
  setErrorMessages,
  errors,
  mode
) => {
  if (mode === "edit") {
    const fetchHeatingSchedules = () => {
      return axios
        .get(ApiUrls.SMARTHEATING_HEATINGSCHEDULE.LIST)
        .then((response) => {
          const data = response.data; // Get data directly from the response
          const templateNames =
            data.length > 0
              ? data.map((template) => template.templateName)
              : [];
          setCreatedHeatingScheduleNames(templateNames);

          const nameExistsInCreatedSchedules = templateNames.includes(
            formData.programName
          ); // Changed from createdHeatingScheduleNames
          const isSameAsTemplateName =
            program.templateName === formData.programName;

          if (!isSameAsTemplateName && nameExistsInCreatedSchedules) {
            setErrorMessages((prev) => ({
              ...prev,
              programName: errors.ProgramWithNameAlreadyCreated,
            }));
          } else {
            setErrorMessages((prev) => ({
              ...prev,
              programName: "",
            }));
          }
        })
        .catch((error) => {
          console.error("Error fetching heating schedules:", error);
        });
    };

    // Call the function to fetch schedules
    fetchHeatingSchedules();
  }
  if (mode === "create" || mode === "clone") {
    try {
      const response = await axios.get(
        ApiUrls.SMARTHEATING_HEATINGSCHEDULE.LIST
      );
      const data = response.data; // Directly access data here
      const templateNames =
        data.length > 0 ? data.map((template) => template.templateName) : [];
      setCreatedHeatingScheduleNames(templateNames);
      // Check if the programName exists in the created heating schedule names
      const nameExistsInCreatedSchedules = templateNames.includes(
        formData.programName
      ); // Use templateNames here
      if (nameExistsInCreatedSchedules) {
        setErrorMessages((prev) => ({
          ...prev,
          programName: errors.ProgramWithNameAlreadyCreated,
        }));
      } else {
        setErrorMessages((prev) => ({
          ...prev,
          programName: "",
        }));
      }
    } catch (error) {
      console.error("Error:", error);
      // Optionally, handle the error (e.g., display an error message)
      setErrorMessages((prev) => ({
        ...prev,
        programName: errors.FetchError, // Assuming you have a relevant error message
      }));
    }
  }
};

export default handleCheckNameHelper;
