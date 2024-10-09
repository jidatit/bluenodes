import { Button, Modal } from "flowbite-react";
import customTheme from "../CreateHeating/ModalTheme";
import { useEffect, useRef, useState } from "react";
import { errorMessages as errors } from "../../../../globals/errorMessages"; // Import error messages
import ProgressStepper from "../CreateHeating/components/ProgressStepper";
import GeneralInformation from "../CreateHeating/Steps/GeneralInformation/GeneralInformation";
import HeatingSchedule from "../CreateHeating/Steps/HeatingSchedule/HeatingSchedule";
import useHeatingSchedule from "../../../../hooks/useHeatingSchedule";
import axios from "axios";
import ApiUrls from "../../../../globals/apiURL.js";
import { Toast } from "flowbite-react";
import { daysOfWeek } from "../../../../globals/daysofWeek.js";
import { useToast } from "../../OperationalOverview/components/ToastContext.jsx";

export function EditHeatingModal({
  openEditModal,
  handleEditModal,
  onEdit,
  program,
  locationDetails,
}) {
  const { generateToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formDataApi, setFormDataApi] = useState();
  const [formData, setFormData] = useState({
    programName: "",
    childSafety: "",
    minTemp: "",
    maxTemp: "",
    applyAlgorithm: "Yes",
  });

  const { createdHeatingScheduleNames, setCreatedHeatingScheduleNames } =
    useHeatingSchedule();

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
    if (openEditModal) {
      setFormData({
        programName: program?.templateName || "",
        childSafety: program?.allowDeviceOverride === true ? "No" : "Yes" || "",
        minTemp: program?.deviceOverrideTemperatureMin + "°C" || "",
        maxTemp: program?.deviceOverrideTemperatureMax + "°C" || "",
        applyAlgorithm: "Yes",
      });
      setFormDataApi(program);
    }
  }, [openEditModal, program]);

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
    const isSameAsTemplateName = program.templateName === programName;

    if (!isSameAsTemplateName) {
      createdHeatingScheduleNames?.forEach((name) => {
        if (programName === name) {
          newErrors.programName = errors.ProgramWithNameAlreadyCreated;
        }
      });
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
      return false;
    }

    return true;
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
    newCheck = updatedCheck;
  };

  const handlePrevious = () => {
    if (currentStep === 2 || currentStep === 3) {
      setCurrentStep((prev) => Math.max(prev - 1, 0));
    }
  };

  const handleNext = () => {
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

  // const programAssignmentRef = useRef();

  const handleCreate = () => {
    let scheduleDataTemp = {};

    // Save button clicked
    if (currentStep === 2) {
      // Trigger the handleCheck function in the child component
      if (handleCheckRef.current) {
        handleCheckRef.current();
      }
      if (newCheck !== null && !newCheck) {
        setFinalScheduleData(layoutsRef.current);
        scheduleDataTemp = layoutsRef.current;

        // Convert schedule data into API format
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
              const targetTemperature = parseFloat(entry.temperature, 10);

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

        //Manipulating for API
        let finalObj = {
          templateName: combinedData.formData.programName,
          allowDeviceOverride:
            combinedData.formData.childSafety === "No" ? true : false,
          days: convertScheduleData(scheduleDataTemp),
        };

        if (combinedData.formData.childSafety !== "Yes") {
          finalObj.deviceOverrideTemperatureMin = parseInt(
            combinedData.formData.minTemp
          );
          finalObj.deviceOverrideTemperatureMax = parseInt(
            combinedData.formData.maxTemp
          );
        }
        axios
          .put(
            ApiUrls.SMARTHEATING_HEATINGSCHEDULE.HEATINGSCHEDULE_ID(program.id),
            finalObj
          )
          .then((response) => {
            const { data, status } = response;
            generateToast(errors.editSuccessfull, true);
            onEdit(combinedData);
            handleEditModal();
            resetModalState();
          })
          .catch((error) => {
            generateToast(errors.editFailed, false);
            console.error("Error:", error);
          });
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
  };

  const handleCloseModal = () => {
    resetModalState();
    handleEditModal();
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
        const nameExistsInCreatedSchedules =
          createdHeatingScheduleNames &&
          createdHeatingScheduleNames.includes(formData.programName);
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
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchHeatingSchedules();
  };

  return (
    <>
      <Modal
        theme={customTheme}
        size={currentStep === 2 ? "7xl" : "5xl"}
        dismissible
        show={openEditModal}
        onClose={handleCloseModal}
      >
        <Modal.Header className=" text-lg text-gray-900 [&>*]:font-semibold">
          Heizplan bearbeiten: {program.templateName}
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-col items-center space-y-6">
            <ProgressStepper currentStep={currentStep} editMode={true} />
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
                    locationDetails={locationDetails}
                  />
                </div>
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          {currentStep < 2 ? (
            <Button className="bg-primary" onClick={handleNext}>
              Weiter
            </Button>
          ) : (
            <Button className={` bg-primary`} onClick={handleCreate}>
              Speichern
            </Button>
          )}
          <Button
            className="font-black"
            color="gray"
            onClick={handleCloseModal}
          >
            Abbrechen
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
