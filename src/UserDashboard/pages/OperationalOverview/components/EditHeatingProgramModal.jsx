/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { Button, Modal, Radio, Label, Select, Tooltip } from "flowbite-react";
import { IoInformationCircleOutline } from "react-icons/io5";
import customTheme from "../../HeatingSchedule/CreateHeating/ModalTheme";
import { errorMessages as errors } from "../../../../globals/errorMessages"; // Import error messages
import ProgressStepper from "../../HeatingSchedule/CreateHeating/components/ProgressStepper";
import GeneralInformation from "../../HeatingSchedule/CreateHeating/Steps/GeneralInformation/GeneralInformation";
import HeatingSchedule from "../../HeatingSchedule/CreateHeating/Steps/HeatingSchedule/HeatingSchedule";
import { Toast } from "flowbite-react";
import HeatingScheduleTable from "../../HeatingSchedule/components/HeatingScheduleTable";
import { Dropdown } from "flowbite-react";
import useHeatingSchedule from "../../../../hooks/useHeatingSchedule";
import axios from "axios";
import ApiUrls from "../../../../globals/apiURL.js";
import { daysOfWeek } from "../../../../globals/daysofWeek.js";
import { useToast } from "./ToastContext.jsx";

const EditHeatingProgramModal = ({
  openModal,
  handleOpenModal,
  room,
  fetchFloorDetails,
  updateReplaced,
}) => {
  const { generateToast } = useToast();
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [showError, setShowError] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { createdHeatingScheduleNames, setCreatedHeatingScheduleNames } =
    useHeatingSchedule();

  const handleCloseModal = () => {
    handleOpenModal();
    setSelectedProgram("");
    resetModalState();
  };

  const handleActionChange = (value) => {
    setSelectedAction(value);
  };

  const handleProgramChange = (event) => {
    setSelectedProgram(event.target.value);
    if (event.target.value === "") {
      setShowError(true);
    } else {
      setShowError(false);
    }
  };

  const handleDone = () => {
    if (selectedAction === "replace-room" && !selectedProgram) {
      setShowError(true);
    } else if (selectedAction === "replace-room" && selectedProgram) {
      setShowConfirmModal(true);
    }
  };

  const handleConfirmReplace = () => {
    const roomId = room.id;

    axios
      .get(ApiUrls.SMARTHEATING_HEATINGSCHEDULE.DETAILS(selectedProgram))
      .then((response) => response.data)
      .then((data) => {
        const existingRoomIds = data.locations || [];
        const updatedRoomIds = [...existingRoomIds, roomId];

        return axios.post(
          ApiUrls.SMARTHEATING_HEATINGSCHEDULE.ASSIGN_ROOM(selectedProgram),
          { locations: updatedRoomIds }
        );
      })
      .then((response) => response.data)
      .then(() => {
        generateToast(errors.ProgramReplacedSuccessfully, true);
        updateReplaced();
        handleCloseModal();
      })
      .catch((error) => {
        console.error("Error:", error);
        generateToast(errors.ProgramReplacedFailed, false);
      })
      .finally(() => {
        setShowConfirmModal(false);
      });
  };

  const handleCancelReplace = () => {
    setShowConfirmModal(false);
  };

  useEffect(() => {
    if (selectedAction === "replace-room" && !selectedProgram) {
      setShowError(true);
    }
  }, [selectedAction, selectedProgram]);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    programName: "",
    childSafety: "",
    minTemp: "",
    maxTemp: "",
    applyAlgorithm: "Yes",
  });
  const [locationDetails, setLocationDetails] = useState([]);
  const [formDataApi, setFormDataApi] = useState();
  const fetchHeatingScheduleForRoom = async (heatingScheduleId) => {
    console.log("id", heatingScheduleId);
    try {
      const resp = await axios.get(
        ApiUrls.SMARTHEATING_HEATINGSCHEDULE.HEATINGSCHEDULE_ID(
          heatingScheduleId
        )
      );
      const data = await resp.data;
      // console.log("Haeting", data);
      setLocationDetails(data);
      setFormDataApi(data);
      setFormData((prev) => ({
        ...prev,
        programName: `${data.templateName} - Room ${room.name}`,
        childSafety: data.allowDeviceOverride ? "No" : "Yes",
        minTemp: data.deviceOverrideTemperatureMin,
        maxTemp: data.deviceOverrideTemperatureMax,
        applyAlgorithm: room.algorithm ? "Yes" : "No",
      }));
    } catch (error) {
      console.error("Error fetching heating schedule:", error);
    }
  };
  useEffect(() => {
    if (room) {
      fetchHeatingScheduleForRoom(room.heatingSchedule?.id);
    }
  }, [room]);

  const [errorMessages, setErrorMessages] = useState({
    programName: "",
    childSafety: "",
    minTemp: "",
    maxTemp: "",
    applyAlgorithm: "",
  });

  const [generalErrorMessage, setGeneralErrorMessage] = useState(null); // State for general error message
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    if (formSubmitted) {
      const allFieldsFilled = Object.values(formData).every(
        (field) => field !== ""
      );
      if (!allFieldsFilled) {
        setGeneralErrorMessage(errors.allFieldsRequired);
      } else {
        setGeneralErrorMessage("");
      }

      const newErrors = {};

      // Check for empty fields
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

      const programName = formData.programName;
      createdHeatingScheduleNames?.map((name, index) => {
        if (programName == name) {
          newErrors.programName = errors.ProgramWithNameAlreadyCreated;
        }
      });

      if (Object.keys(newErrors).length > 0 || !allFieldsFilled) {
        setErrorMessages(newErrors);
      } else {
        setErrorMessages({});
      }
    }
  }, [formSubmitted, formData]);

  const validateField = (id, value) => {
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
        // console.log(errorMessages);
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

  useEffect(() => {
    const minTemp = parseFloat(formData.minTemp);
    const maxTemp = parseFloat(formData.maxTemp);

    // Convert minTemp and maxTemp to strings to safely use .includes
    const minTempStr = formData.minTemp?.toString() || "";
    const maxTempStr = formData.maxTemp?.toString() || "";

    const containsInvalidCharacter = (str) => {
      // Regex to match any character that is not a digit, decimal point, °, C, or F
      const invalidCharRegex = /[^0-9°CFa-z]/;
      return invalidCharRegex.test(str);
    };
    // Check if input is a decimal
    // const isMinTempDecimal = minTempStr.includes(".");
    // const isMaxTempDecimal = maxTempStr.includes(".");

    const isMinTempDecimal = containsInvalidCharacter(minTempStr);
    const isMaxTempDecimal = containsInvalidCharacter(maxTempStr);

    // Validate minTemp and maxTemp
    if (minTempStr !== "" && maxTempStr !== "") {
      if (isMinTempDecimal || isMaxTempDecimal) {
        // Show error if any input is a decimal
        setErrorMessages((prev) => ({
          ...prev,
          minTemp: isMinTempDecimal ? errors.TempDecimalNotAllowed : "",
          maxTemp: isMaxTempDecimal ? errors.TempDecimalNotAllowed : "",
        }));
      } else if (minTemp >= maxTemp && maxTempStr.length >= 2) {
        // Update error state for maxTemp when cross-validation fails
        setErrorMessages((prev) => ({
          ...prev,
          maxTemp: errors.maxTempLowerThanMinTemp,
        }));
      } else {
        // Clear error for maxTemp if cross-validation passes
        setErrorMessages((prev) => ({
          ...prev,
          maxTemp: "", // Clear the error message for maxTemp
          minTemp: "", // Clear the error message for minTemp
        }));
      }
    }
  }, [formData]);

  const handleChange = (e) => {
    const { id, value } = e.target;

    validateField(id, value);

    // Check if the change is from the radio button groups
    if (id === "childSafetyYes") {
      setFormData((prev) => ({
        ...prev,
        childSafety: value,
        minTemp: "min",
        maxTemp: "max",
      }));
    } else if (id === "childSafetyNo") {
      setFormData((prev) => ({
        ...prev,
        childSafety: value,
        minTemp: formDataApi.deviceOverrideTemperatureMin,
        maxTemp: formDataApi.deviceOverrideTemperatureMax,
      }));
    } else if (id === "applyAlgorithmYes" || id === "applyAlgorithmNo") {
      setFormData((prev) => ({
        ...prev,
        applyAlgorithm: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }

    // Re-validate the related temperature field
    if (id === "minTemp" && formData.maxTemp) {
      validateField("maxTemp", formData.maxTemp);
    }
    if (id === "maxTemp" && formData.minTemp) {
      validateField("minTemp", formData.minTemp);
    }

    const allFieldsFilled = Object.values({
      ...formData,
      [id]: value,
    }).every((field) => field !== "");

    if (allFieldsFilled) {
      setErrorMessages({});
      setGeneralErrorMessage(""); // Clear general error message if all fields are filled
    }
  };

  const handleSubmit = () => {
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
    // Check if input is a decimal
    // const isMinTempDecimal = minTempStr.includes(".");
    // const isMaxTempDecimal = maxTempStr.includes(".");

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

    if (Object.keys(newErrors).length > 0 || !allFieldsFilled) {
      setErrorMessages(newErrors);
      return false;
    }

    // console.log(formData);
    return true;
    // console.log(formData);
  };

  const [layouts, setLayouts] = useState({}); // State to hold layouts
  const [finalScheduleData, setFinalScheduleData] = useState({});

  const handleCheckRef = useRef(null); // Ref to hold handleCheck function
  const layoutsRef = useRef(layouts); // Ref to hold the latest layouts value

  // Function to handle layout updates
  const handleLayoutUpdate = (updatedLayouts) => {
    setLayouts(updatedLayouts);
    layoutsRef.current = updatedLayouts;
  };

  let newCheck = null;
  // Function to handle layout updates
  const handleCheckUpdate = (updatedCheck) => {
    // console.log(updatedCheck,"hhihi")
    newCheck = updatedCheck;
    // checkedRef.current = updatedCheck;
  };

  const handlePrevious = () => {
    if (currentStep === 2 || currentStep === 3) {
      setCurrentStep((prev) => Math.max(prev - 1, 0));
    }
  };

  const handleNext = () => {
    // console.log("first step ",formData)
    if (currentStep === 1) {
      if (handleSubmit()) {
        setCurrentStep((prev) => Math.min(prev + 1, 3));
      }
    }
  };

  const [combinedData, setCombinedData] = useState({
    formData: {
      programName: "",
      childSafety: "",
      minTemp: "",
      maxTemp: "",
      applyAlgorithm: "",
    },
    assignmentData: null,
    finalScheduleData: {},
  });

  useEffect(() => {
    if (formData && finalScheduleData) {
      setCombinedData({
        formData,
        finalScheduleData,
      });
    }
    // console.log(combinedData);
  }, [formData, finalScheduleData]);

  function convertScheduleData(data) {
    // console.log(data)
    const dayMapping = {
      [daysOfWeek[0]]: 1,
      [daysOfWeek[1]]: 2,
      [daysOfWeek[2]]: 3,
      [daysOfWeek[3]]: 4,
      [daysOfWeek[4]]: 5,
      [daysOfWeek[5]]: 6,
      [daysOfWeek[6]]: 7,
    };

    const result = { days: [] };

    const normalizeTime = (value) => {
      const hours = Math.floor((value * 24) / 96);
      const minutes = Math.floor(((value * 24 * 60) / 96) % 60);
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
    };

    for (const [dayName, entries] of Object.entries(data)) {
      const day = dayMapping[dayName];
      entries.forEach((entry) => {
        const from = normalizeTime(entry.y);
        let to = normalizeTime(entry.y + entry.h);
        const targetTemperature = parseInt(entry.temperature, 10);

        if (to === "24:00") {
          to = "23:59";
        }

        result.days.push({
          day,
          from,
          to,
          targetTemperature,
        });
      });
    }

    return result.days;
  }

  const handleCreate = async () => {
    handleCheckName();
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
      const fetchHeatingSchedules = async () => {
        try {
          const response = await axios.get(
            ApiUrls.SMARTHEATING_HEATINGSCHEDULE.LIST
          );
          const data = await response.data;
          const templateNames =
            data.length > 0
              ? data.map((template) => template.templateName)
              : [];
          setCreatedHeatingScheduleNames(templateNames);
        } catch (error) {
          console.error("Error:", error);
        }
      };
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
          console.log("created");

          generateToast(errors.heatingScheduleEditedSuccessfull, true);
          console.log("created");
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

  const resetModalState = () => {
    setCurrentStep(1);
    setFormData({
      programName: "",
      childSafety: "",
      minTemp: "",
      maxTemp: "",
      applyAlgorithm: "Yes",
    });
    setErrorMessages({
      programName: "",
      childSafety: "",
      minTemp: "",
      maxTemp: "",
      applyAlgorithm: "",
    });
    setGeneralErrorMessage(null);
    setFormSubmitted(false);
    setLayouts({});
    setFinalScheduleData({});
    setSelectedAction("");
  };

  const handleCheckName = () => {
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
    const exists =
      createdHeatingScheduleNames &&
      createdHeatingScheduleNames.includes(formData.programName);
    if (exists) {
      setErrorMessages((prev) => ({
        ...prev,
        programName: errors.ProgramWithNameAlreadyCreated,
      }));
    }
  };

  return (
    <>
      <Modal
        theme={customTheme}
        size={"6xl"}
        show={openModal}
        onClose={handleCloseModal}
      >
        {room && (
          <>
            <Modal.Header className=" text-lg text-gray-900 [&>*]:font-semibold">
              Bearbeiten - Raum {room.name}
            </Modal.Header>
            <Modal.Body className="h-auto p-5 overflow-y-auto">
              <div className="flex flex-col items-start justify-center w-full">
                <p className="mt-3 font-semibold ">Aktion auswählen</p>
                <div className="flex flex-row items-center justify-start w-full gap-4 mt-2">
                  <div
                    onClick={() => handleActionChange("edit-room")}
                    className="flex flex-row items-center justify-center gap-2 cursor-pointer"
                  >
                    <Radio
                      id="edit-room"
                      name="action"
                      value="edit-room"
                      checked={selectedAction === "edit-room"}
                      className="cursor-pointer "
                      // onChange={handleActionChange}
                    />
                    <Label className="cursor-pointer " htmlFor="edit-room">
                      Heizplan für den Raum bearbeiten
                    </Label>
                  </div>
                  <div
                    onClick={() => handleActionChange("replace-room")}
                    className="flex flex-row items-center justify-center gap-2 cursor-pointer"
                  >
                    <Radio
                      id="replace-room"
                      name="action"
                      value="replace-room"
                      checked={selectedAction === "replace-room"}
                      className="cursor-pointer "
                      // onChange={handleActionChange}
                    />
                    <Label className="cursor-pointer " htmlFor="replace-room">
                      Anderen Heizplan auswählen
                    </Label>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center w-full mt-3 mb-3">
                  {selectedAction === "edit-room" ? (
                    <div className="flex flex-col items-center w-full space-y-6">
                      <ProgressStepper
                        currentStep={currentStep}
                        editMode={true}
                      />
                      <div className="w-full">
                        {currentStep === 1 && (
                          <div>
                            <GeneralInformation
                              formData={formData}
                              handleChange={handleChange}
                              errorMessages={errorMessages}
                              generalErrorMessage={generalErrorMessage} // Pass general error message to Form1
                              checkName={handleCheckName}
                            />
                          </div>
                        )}
                        {currentStep === 2 && (
                          <div>
                            <HeatingSchedule
                              onUpdateLayouts={handleLayoutUpdate}
                              onUpdateCheck={handleCheckUpdate}
                              setHandleCheckRef={(func) =>
                                (handleCheckRef.current = func)
                              }
                              handlePrev={handlePrevious}
                              finalScheduleData={finalScheduleData}
                              clone={true}
                              staticTemp={true}
                              locationDetails={locationDetails}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    selectedAction === "replace-room" && (
                      <ReplaceProgram
                        selectedProgram={selectedProgram}
                        handleProgramChange={handleProgramChange}
                        showError={showError}
                        room={room}
                      />
                    )
                  )}
                </div>

                {selectedAction === "replace-room" && selectedProgram && (
                  <ViewTableComponent selectedProgram={selectedProgram} />
                )}
              </div>
            </Modal.Body>

            <Modal.Footer>
              {selectedAction === "edit-room" ? (
                currentStep < 2 ? (
                  <Button className="bg-primary" onClick={handleNext}>
                    Weiter
                  </Button>
                ) : (
                  <Button className="bg-primary" onClick={handleCreate}>
                    Speichern
                  </Button>
                )
              ) : (
                <Button className="bg-primary" onClick={handleDone}>
                  Fertig
                </Button>
              )}
              <Button
                className="font-black"
                color="gray"
                onClick={handleCloseModal}
              >
                Schließen
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>

      <ConfirmReplaceModal
        show={showConfirmModal}
        onClose={handleCancelReplace}
        onConfirm={handleConfirmReplace}
      />
    </>
  );
};

const ReplaceProgram = ({
  selectedProgram,
  handleProgramChange,
  showError,
  room,
}) => {
  const [data, setData] = useState([]);

  const fetchAll = () => {
    axios
      .get(ApiUrls.SMARTHEATING_HEATINGSCHEDULE.LIST)
      .then((response) => response.data)
      .then((data) => {
        setData(data);
        // console.log("schedule programs", data);
        // setLoader(false);
      })
      .catch((error) => console.error("Error:", error));
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <div className="flex flex-col items-start justify-start w-full gap-4 md:flex-row md:items-center">
      <div className="flex flex-col items-start justify-start w-full md:w-1/3">
        <label
          htmlFor="program"
          value="Program"
          className={`mb-2 text-sm pt-3 font-semibold ${
            showError ? "text-red-500" : "text-gray-700"
          }`}
        >
          {" "}
        </label>
        <select
          id="program"
          required
          className={` mt-1.5 w-full rounded-lg border-gray-300 text-gray-700 sm:text-sm`}
          value={selectedProgram}
          onChange={handleProgramChange}
        >
          <option value="">Heizplan auswählen</option>
          {data.map((program) => (
            <option
              className={`block rounded-lg px-4 py-2 text-sm ${
                program.id === room.heatingSchedule.id
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "hover:bg-blue-100 hover:text-blue-700"
              }`}
              key={program.id}
              value={program.id}
              disabled={program.id === room.heatingSchedule.id}
            >
              {program.templateName.length > 50
                ? `${program.templateName.slice(0, 50)}...`
                : program.templateName}
            </option>
          ))}
        </select>

        {showError && (
          <p className="mt-1 text-sm text-red-500">
            Bitte einen Heizplan auswählen.
          </p>
        )}
      </div>
    </div>
  );
};

const ViewTableComponent = ({ selectedProgram }) => {
  // Destructure selectedProgram from props
  const [temperatureDetails, setTemperatureDetails] = useState(null);
  const heatingScheduleId = selectedProgram;

  const fetchDetails = () => {
    if (!heatingScheduleId) return;

    axios
      .get(ApiUrls.SMARTHEATING_HEATINGSCHEDULE.DETAILS(heatingScheduleId))

      .then((response) => {
        if (response.status >= 400) {
          throw new Error("Network response was not ok");
        }
        return response.data;
      })
      .then((data) => {
        setTemperatureDetails(data);
        // console.log("location details", data);
      })
      .catch((error) => console.error("Error:", error));
  };

  useEffect(() => {
    fetchDetails();
  }, [heatingScheduleId]);

  return (
    <div className="w-full p-5">
      <div className="flex items-start w-full">
        <div className="w-[25%] flex flex-col gap-4">
          <h3 className="text-[16px] text-gray-500 font-semibold">
            Einstellungen
          </h3>
          <div className="flex flex-col gap-2 text-sm font-normal text-gray-900">
            <div className="flex flex-col gap-2">
              <p className="font-semibold">Kindersicherung</p>
              <p>{temperatureDetails?.templateName || "N/A"}</p>{" "}
              {/* Replace hardcoded value */}
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-semibold">Kindersicherung</p>
              <p>
                {temperatureDetails?.allowDeviceOverride ? "Aus" : "An"}
              </p>{" "}
              {/* Replace hardcoded value */}
            </div>
            {temperatureDetails?.allowDeviceOverride && (
              <>
                <div className="flex flex-col gap-2">
                  <p className="flex items-center gap-1 font-semibold">
                    Mindesttemperatur
                    <Tooltip
                      className="px-3 py-1.5 text-center max-w-96"
                      content="Die Mindesttemperatur, die am Thermostat manuell eingestellt werden kann.."
                      style="light"
                    >
                      <IoInformationCircleOutline color="#6B7280" />
                    </Tooltip>
                  </p>
                  <p>
                    {temperatureDetails?.deviceOverrideTemperatureMin || "N/A"}
                    °C
                  </p>{" "}
                  {/* Replace hardcoded value */}
                </div>
                <div className="flex flex-col gap-2">
                  <p className="flex items-center gap-1 font-semibold">
                    Höchsttemperatur
                    <Tooltip
                      className="px-3 py-1.5 text-center max-w-96"
                      content="Die Höchsttemperatur, die am Thermostat manuell eingestellt werden kann."
                      style="light"
                    >
                      <IoInformationCircleOutline color="#6B7280" />
                    </Tooltip>
                  </p>
                  <p>
                    {temperatureDetails?.deviceOverrideTemperatureMax || "N/A"}
                    °C
                  </p>{" "}
                  {/* Replace hardcoded value */}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="w-[75%] border-l flex flex-col gap-4 border-gray-200 pl-4">
          <div className="max-h-[400px] overflow-y-auto overflow-x-hidden">
            {/* {console.log("temp", temperatureDetails)} */}
            {temperatureDetails && (
              <HeatingScheduleTable locationDetails={temperatureDetails} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ConfirmReplaceModal = ({ show, onClose, onConfirm }) => {
  return (
    <Modal show={show} onClose={onClose} size="lg">
      <Modal.Header className="flex items-center justify-between">
        <span className="text-lg font-semibold text-gray-900">
          Ersetzen des Programms bestätigen
        </span>
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-900"
        ></button>
      </Modal.Header>
      <Modal.Body className="text-[#6B7280]">
        <p className="mt-2">Sind Sie sicher, dass Sie fortfahren möchten?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onConfirm} className="bg-primary">
          Ja
        </Button>
        <Button color="gray" onClick={onClose}>
          Abbrechen
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditHeatingProgramModal;
