import axios from "axios";

export const handleCreateHelper = async ({
  handleCheckName,
  handleCheckRef,
  newCheck,
  layoutsRef,
  setFinalScheduleData,
  convertScheduleData,
  combinedData,
  formData,
  room,
  ApiUrls,
  setCreatedHeatingScheduleNames,
  errors,
  setErrorMessages,
  createdHeatingScheduleNames,
  generateToast,
  resetModalState,
  handleCloseModal,
  fetchFloorDetails,
  updateReplaced,
  // fetchHeatingSchedulesFlag = false, // flag to conditionally fetch schedules
  // handleOpenModal = null, // option to handle modal opening
  // fetchHeatingSchedules,
}) => {
  let scheduleDataTemp = {};

  if (handleCheckRef.current) {
    handleCheckRef.current();
  }

  if (newCheck !== null && !newCheck) {
    setFinalScheduleData(layoutsRef.current);
    scheduleDataTemp = layoutsRef.current;

    const data = convertScheduleData(scheduleDataTemp);

    const requestBody = {
      templateName: combinedData.formData.programName,
      allowDeviceOverride:
        combinedData.formData.childSafety == "No" ? true : false,
      locations: [room.id],
      days: data,
    };

    if (combinedData.formData.childSafety !== "Yes") {
      requestBody.deviceOverrideTemperatureMin = parseInt(
        combinedData.formData.minTemp
      );
      requestBody.deviceOverrideTemperatureMax = parseInt(
        combinedData.formData.maxTemp
      );
    }
    // const fetchHeatingSchedules = async () => {
    //   try {
    //     const response = await axios.get(
    //       ApiUrls.SMARTHEATING_HEATINGSCHEDULE.LIST
    //     );
    //     const data = await response.data;
    //     const templateNames =
    //       data.length > 0 ? data.map((template) => template.templateName) : [];
    //     setCreatedHeatingScheduleNames(templateNames);
    //   } catch (error) {
    //     console.error("Error:", error);
    //   }
    // };
    const exists =
      createdHeatingScheduleNames &&
      createdHeatingScheduleNames.includes(formData.programName);
    if (exists) {
      setErrorMessages((prev) => ({
        ...prev,
        programName: errors.ProgramWithNameAlreadyCreated,
      }));
    }

    try {
      const resp = await axios.post(
        ApiUrls.SMARTHEATING_HEATINGSCHEDULE.HEATINGSCHEDULE_FROM_EDIT,
        requestBody
      );

      if (resp.status >= 400) {
        const errorText = await resp.data; // Get response text for error details
        throw new Error(
          `HTTP error! Status: ${resp.status}, Details: ${errorText}`
        );
      }

      const respData = await resp.data;
      if (respData.active) {
        generateToast(errors.heatingScheduleEditedSuccessfull, true);

        // handleOpenModal();
        if (room) {
          fetchFloorDetails(room.parentId);
        }
        handleCloseModal();
        updateReplaced();
        resetModalState();
      } else {
        generateToast(errors.heatingScheduleEditedFailed, false);
      }
    } catch (error) {
      generateToast(errors.heatingScheduleEditedFailed, false);
      console.error("Error during fetch operation:", error);
    }
  }
};
