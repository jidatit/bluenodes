import { Button, Modal } from "flowbite-react";
import customTheme from "../CreateHeating/ModalTheme";
import { useEffect, useRef, useState } from "react";
import { errorMessages as errors } from "../../../../globals/errorMessages"; // Import error messages
import ProgressStepper from "../CreateHeating/components/ProgressStepper";
import GeneralInformation from "../CreateHeating/Steps/GeneralInformation/GeneralInformation";
import HeatingSchedule from "../CreateHeating/Steps/HeatingSchedule/HeatingSchedule";
import ProgramAssignment from "../CreateHeating/Steps/ProgramAssignment/ProgramAssignment";
import axios from "axios";
import ApiUrls from "../../../../globals/apiURL.js";
import useHeatingSchedule from "../../../../hooks/useHeatingSchedule.jsx";
import { daysOfWeek } from "../../../../globals/daysofWeek.js";
import { useToast } from "../../OperationalOverview/components/ToastContext.jsx";
import setFormDataHelper from "../../../../shared/helper/formDataHelper.js";
import validateFormData from "../../../../shared/helper/ValidateFormData.js";
import validateFieldHelper from "../../../../shared/helper/ValidateFieldHelper.js";
import validateTemperatureHelper from "../../../../shared/helper/ValidateTemperatureHelper.js";
import handleFormChangeHelper from "../../../../shared/helper/FormChangeValidationCheckHelper.js";
import validateAndSubmit from "../../../../shared/helper/HandleSubmitHelper.js";

export function CloneHeatingModal({
  openCloneModal,
  handleCloneModal,
  onCreate,
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
  const component = "clone";
  const [generalErrorMessage, setGeneralErrorMessage] = useState(null); // State for general error message
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    // setFormData({
    //   programName: program?.templateName + " - Cloned" || "",
    //   childSafety: program?.allowDeviceOverride === true ? "No" : "Yes" || "",
    //   minTemp: program?.deviceOverrideTemperatureMin + "°C" || "",
    //   maxTemp: program?.deviceOverrideTemperatureMax + "°C" || "",
    //   applyAlgorithm: "Yes",
    // });
    // setFormDataApi(program);
    if (openCloneModal) {
      const formData = setFormDataHelper(program, component); // No clone, so isClone is false or omitted
      setFormData(formData);
      setFormDataApi(program);
    }
  }, [openCloneModal, program]);

  useEffect(() => {
    // if (formSubmitted) {
    //   const allFieldsFilled = Object.values(formData).every(
    //     (field) => field !== ""
    //   );
    //   if (!allFieldsFilled) {
    //     setGeneralErrorMessage(errors.allFieldsRequired);
    //   } else {
    //     setGeneralErrorMessage("");
    //   }

    //   const newErrors = {};

    //   // Check for empty fields
    //   Object.keys(formData).forEach((key) => {
    //     if (formData[key] === "") {
    //       newErrors[key] = errors.missingSelectionOrInformation;
    //     }
    //   });

    //   // Validate temperature fields
    //   const minTemp = parseFloat(formData.minTemp);
    //   const maxTemp = parseFloat(formData.maxTemp);

    //   if (!isNaN(minTemp) && (minTemp < 10 || minTemp > 29)) {
    //     newErrors.minTemp = errors.minTempInvalid;
    //   }
    //   if (!isNaN(maxTemp) && (maxTemp < 11 || maxTemp > 30)) {
    //     newErrors.maxTemp = errors.maxTempInvalid;
    //   }
    //   if (!isNaN(minTemp) && !isNaN(maxTemp) && maxTemp <= minTemp) {
    //     newErrors.maxTemp = errors.maxTempLowerThanMinTemp;
    //   }

    //   if (Object.keys(newErrors).length > 0 || !allFieldsFilled) {
    //     setErrorMessages(newErrors);
    //   } else {
    //     setErrorMessages({});
    //   }
    // }
    if (formSubmitted) {
      const { allFieldsFilled, errors: newErrors } = validateFormData(
        formData,
        errors
      );

      if (!allFieldsFilled) {
        setGeneralErrorMessage(errors.allFieldsRequired);
      } else {
        setGeneralErrorMessage("");
      }

      if (Object.keys(newErrors).length > 0 || !allFieldsFilled) {
        setErrorMessages(newErrors);
      } else {
        setErrorMessages({});
      }
    }
  }, [formSubmitted, formData]);

  // const validateField = (id, value) => {
  //   let error = "";

  //   if (value === "") {
  //     error = errors.missingSelectionOrInformation;
  //   } else {
  //     const minTemp =
  //       id === "minTemp" ? parseFloat(value) : parseFloat(formData.minTemp);
  //     const maxTemp =
  //       id === "maxTemp" ? parseFloat(value) : parseFloat(formData.maxTemp);

  //     if (id === "minTemp") {
  //       if (isNaN(minTemp) || minTemp < 10 || minTemp > 29) {
  //         error = errors.minTempInvalid;
  //       } else if (maxTemp !== "" && minTemp >= maxTemp) {
  //         // Update error state for maxTemp immediately
  //         setErrorMessages((prev) => ({
  //           ...prev,
  //           maxTemp: errors.maxTempLowerThanMinTemp,
  //         }));
  //       } else {
  //         // Clear error for maxTemp if minTemp is valid and lower than maxTemp
  //         setErrorMessages((prev) => ({
  //           ...prev,
  //           maxTemp: "",
  //         }));
  //       }
  //     }

  //     if (id === "maxTemp") {
  //       if (isNaN(maxTemp) || maxTemp < 11 || maxTemp > 30) {
  //         error = errors.maxTempInvalid;
  //       } else if (minTemp !== "" && maxTemp <= minTemp) {
  //         error = errors.maxTempLowerThanMinTemp;
  //       }
  //     }
  //   }

  //   // Set error message for the current field
  //   setErrorMessages((prev) => ({
  //     ...prev,
  //     [id]: error,
  //   }));
  // };

  useEffect(() => {
    // const minTemp = parseFloat(formData.minTemp);
    // const maxTemp = parseFloat(formData.maxTemp);

    // // Convert minTemp and maxTemp to strings to safely use .includes
    // const minTempStr = formData.minTemp?.toString() || "";
    // const maxTempStr = formData.maxTemp?.toString() || "";
    // const containsInvalidCharacter = (str) => {
    //   // Regex to match any character that is not a digit, decimal point, °, C, or F
    //   const invalidCharRegex = /[^0-9°CFa-z]/;
    //   return invalidCharRegex.test(str);
    // };

    // const isMinTempDecimal = containsInvalidCharacter(minTempStr);
    // const isMaxTempDecimal = containsInvalidCharacter(maxTempStr);
    // // Validate minTemp and maxTemp
    // if (minTempStr !== "" && maxTempStr !== "") {
    //   if (isMinTempDecimal || isMaxTempDecimal) {
    //     // Show error if any input is a decimal
    //     setErrorMessages((prev) => ({
    //       ...prev,
    //       minTemp: isMinTempDecimal ? errors.TempDecimalNotAllowed : "",
    //       maxTemp: isMaxTempDecimal ? errors.TempDecimalNotAllowed : "",
    //     }));
    //   } else if (minTemp >= maxTemp && maxTempStr.length >= 2) {
    //     // Update error state for maxTemp when cross-validation fails
    //     setErrorMessages((prev) => ({
    //       ...prev,
    //       maxTemp: errors.maxTempLowerThanMinTemp,
    //     }));
    //   } else {
    //     // Clear error for maxTemp if cross-validation passes
    //     setErrorMessages((prev) => ({
    //       ...prev,
    //       maxTemp: "", // Clear the error message for maxTemp
    //       minTemp: "", // Clear the error message for minTemp
    //     }));
    //   }
    // }
    validateTemperatureHelper(formData, setErrorMessages, errors, "clone");
  }, [formData]);

  const handleChange = (e) => {
    // const { id, value } = e.target;

    // validateFieldHelper(id, value, formData, setErrorMessages, errors);

    // // Check if the change is from the radio button groups
    // if (id === "childSafetyYes") {
    //   setFormData((prev) => ({
    //     ...prev,
    //     childSafety: value,
    //     minTemp: "min",
    //     maxTemp: "max",
    //   }));
    // } else if (id === "childSafetyNo") {
    //   setFormData((prev) => ({
    //     ...prev,
    //     childSafety: value,
    //     minTemp: formDataApi.deviceOverrideTemperatureMin,
    //     maxTemp: formDataApi.deviceOverrideTemperatureMax,
    //   }));
    // } else if (id === "applyAlgorithmYes" || id === "applyAlgorithmNo") {
    //   setFormData((prev) => ({
    //     ...prev,
    //     applyAlgorithm: value,
    //   }));
    // } else {
    //   setFormData((prev) => ({
    //     ...prev,
    //     [id]: value,
    //   }));
    // }

    // // Re-validate the related temperature field
    // if (id === "minTemp" && formData.maxTemp) {
    //   validateFieldHelper(
    //     "maxTemp",
    //     formData.maxTemp,
    //     formData,
    //     setErrorMessages,
    //     errors
    //   );
    // }
    // if (id === "maxTemp" && formData.minTemp) {
    //   validateFieldHelper(
    //     "minTemp",
    //     formData.minTemp,
    //     formData,
    //     setErrorMessages,
    //     errors
    //   );
    // }

    // const allFieldsFilled = Object.values({
    //   ...formData,
    //   [id]: value,
    // }).every((field) => field !== "");

    // if (allFieldsFilled) {
    //   setErrorMessages({});
    //   setGeneralErrorMessage(""); // Clear general error message if all fields are filled
    // }
    handleFormChangeHelper(
      e,
      formData,
      setFormData,
      formDataApi,
      validateFieldHelper,
      setErrorMessages,
      errors,
      setGeneralErrorMessage,
      "clone"
    );
  };

  const handleSubmit = () => {
    // handleCheckName();
    // setFormSubmitted(true);

    // let allFieldsFilled = true; // Flag to check if all fields are filled
    // const newErrors = {};

    // // Check for empty fields
    // Object.keys(formData).forEach((key) => {
    //   if (formData[key] === "") {
    //     newErrors[key] = errors.missingSelectionOrInformation;
    //     allFieldsFilled = false; // Set flag to false if any field is empty
    //   }
    // });
    // const fetchHeatingSchedules = async () => {
    //   try {
    //     const response = await axios.get(
    //       ApiUrls.SMARTHEATING_HEATINGSCHEDULE.LIST
    //     );
    //     const data = await response.data;
    //     const templateNames =
    //       data.length > 0 ? data.map((template) => template.templateName) : [];
    //     setCreatedHeatingScheduleNames(templateNames);
    //     const nameExistsInCreatedSchedules =
    //       createdHeatingScheduleNames?.includes(formData.programName);

    //     return nameExistsInCreatedSchedules;
    //   } catch (error) {
    //     console.error("Error:", error);
    //   }
    // };
    // const nameExistsInCreatedSchedules = fetchHeatingSchedules();
    // const programName = formData.programName;
    // if (nameExistsInCreatedSchedules) {
    //   createdHeatingScheduleNames?.forEach((name) => {
    //     if (programName === name) {
    //       newErrors.programName = errors.ProgramWithNameAlreadyCreated;
    //     }
    //   });
    // }
    // // Validate temperature fields
    // const minTemp = parseFloat(formData.minTemp);
    // const maxTemp = parseFloat(formData.maxTemp);

    // // Check if input is a decimal
    // const minTempStr = formData.minTemp?.toString() || "";
    // const maxTempStr = formData.maxTemp?.toString() || "";

    // const containsInvalidCharacter = (str) => {
    //   // Regex to match any character that is not a digit, decimal point, °, C, or F
    //   const invalidCharRegex = /[^0-9°CFa-z]/;
    //   return invalidCharRegex.test(str);
    // };
    // const isMinTempDecimal = containsInvalidCharacter(minTempStr);
    // const isMaxTempDecimal = containsInvalidCharacter(maxTempStr);

    // // Check for decimal values
    // if (isMinTempDecimal) {
    //   newErrors.minTemp = errors.TempDecimalNotAllowed;
    // }
    // if (isMaxTempDecimal) {
    //   newErrors.maxTemp = errors.TempDecimalNotAllowed;
    // }

    // // Validate the temperature range only if there are no decimal errors
    // if (!isMinTempDecimal && !isMaxTempDecimal) {
    //   if (!isNaN(minTemp) && (minTemp < 10 || minTemp > 29)) {
    //     newErrors.minTemp = errors.minTempInvalid;
    //   }
    //   if (!isNaN(maxTemp) && (maxTemp < 11 || maxTemp > 30)) {
    //     newErrors.maxTemp = errors.maxTempInvalid;
    //   }
    //   if (!isNaN(minTemp) && !isNaN(maxTemp) && maxTemp <= minTemp) {
    //     newErrors.maxTemp = errors.maxTempLowerThanMinTemp;
    //   }
    // }

    // if (Object.keys(newErrors).length > 0 || !allFieldsFilled) {
    //   setErrorMessages(newErrors);
    //   return false;
    // }

    // return true;

    const valid = validateAndSubmit(
      formData,
      program,
      errors,
      setCreatedHeatingScheduleNames,
      setErrorMessages,
      handleCheckName,
      setFormSubmitted,
      createdHeatingScheduleNames,
      ApiUrls,
      "clone"
    );

    if (!valid) {
      return false; // Form is invalid
    }

    // Proceed with form submission or other logic
    return true; // Form is valid
  };

  // For getting data from heating program assignment
  const [heatingAssignmentData, setHeatingAssignmentData] = useState({});

  const handleAssignmentData = (assignmentData) => {
    setHeatingAssignmentData(assignmentData);
  };

  const [layouts, setLayouts] = useState({}); // State to hold layouts
  const [finalScheduleData, setFinalScheduleData] = useState({});

  const handleCheckRef = useRef(null); // Ref to hold handleCheck function
  const handleAssignmentRef = useRef(null); // Ref to hold handleCheck function
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
    } else if (currentStep === 2) {
      // Trigger the handleCheck function in the child component
      if (handleCheckRef.current) {
        handleCheckRef.current();
      }

      if (newCheck !== null && !newCheck) {
        setCurrentStep((prev) => Math.min(prev + 1, 3));
        setFinalScheduleData(layoutsRef.current);
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
    if (formData && heatingAssignmentData && finalScheduleData) {
      setCombinedData({
        formData,
        heatingAssignmentData,
        finalScheduleData,
      });
    }
  }, [formData, heatingAssignmentData, finalScheduleData]);

  const [buttonText, setButtonText] = useState("Create");

  const handleCreate = () => {
    if (handleAssignmentRef.current) {
      handleAssignmentRef.current();

      const anyRoomSelected = heatingAssignmentData?.buildings?.some(
        (building) =>
          building.floors.some((floor) =>
            floor.rooms.some((room) => room.assigned)
          )
      );

      handleAssignmentData();
      // eslint-disable-next-line no-inner-declarations
      function getRoomIdsByProgram(data) {
        const programName = combinedData.formData.programName;
        const roomIds = [];

        // Loop through each building
        data.forEach((building) => {
          // Loop through each floor in the building
          building.floors.forEach((floor) => {
            // Loop through each room on the floor
            floor.rooms.forEach((room) => {
              // Check if the programAssigned matches the programName
              if (room.programAssigned === programName) {
                roomIds.push(room.id);
              }
            });
          });
        });

        return roomIds;
      }

      // Convert schedule data into API format
      // eslint-disable-next-line no-inner-declarations
      function convertScheduleData(data) {
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
      const finalObj = {
        templateName: combinedData.formData.programName,
        allowDeviceOverride:
          combinedData.formData.childSafety === "No" ? true : false,
        ...(anyRoomSelected && {
          locations: getRoomIdsByProgram(
            combinedData.heatingAssignmentData.buildings
          ),
        }),
        days: convertScheduleData(combinedData.finalScheduleData),
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
        .post(ApiUrls.SMARTHEATING_HEATINGSCHEDULE.HEATINGSCHEDULE, finalObj)
        .then((response) => {
          generateToast(errors.cloneSuccessfull, true);
          onCreate(combinedData);
          handleCloneModal();
          resetModalState();
        })
        .catch((error) => {
          console.error("Error:", error);
          generateToast(errors.cloneFailed, false);
          onCreate("Error");
        });
    } else {
      console.error("handleAssignmentRef.current is not defined");
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
    setHeatingAssignmentData({});
    setLayouts({});
    setFinalScheduleData({});
    setButtonText("Create");
  };

  const handleCloseModal = () => {
    resetModalState();
    handleCloneModal();
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
      }
    };
    fetchHeatingSchedules();
  };

  const [initialData, setInitialData] = useState({});

  useEffect(() => {
    axios
      .get(ApiUrls.SMARTHEATING_LOCATIONS.LOCATIONS(true, true, true, true))
      .then((response) => response.data)
      .then((data) => {
        const apiData = {
          buildings: data?.map((building) => {
            // Calculate the total rooms in the building
            const totalRooms = building?.children.reduce(
              (sum, floor) => sum + floor.children.length,
              0
            );
            const buildingAssignedRooms = building?.children.reduce(
              (sum, floor) => {
                // Iterate over each room in the floor and sum the assignedNumberOfRooms values
                const assignedNumberOfRoomsSum = floor.children.reduce(
                  (floorSum, room) => {
                    return floorSum + (room.assignedNumberOfRooms || 0);
                  },
                  0
                );

                return sum + assignedNumberOfRoomsSum;
              },
              0
            );

            return {
              id: building.id,
              name: building.name,
              roomsAssigned: buildingAssignedRooms,
              totalRooms: totalRooms,
              floors: building.children.map((floor) => ({
                id: floor.id,
                name: floor.name,
                roomsAssigned: floor.assignedNumberOfRooms,
                totalRooms: floor.children.length,
                rooms: floor.children.map((room) => ({
                  id: room.id,
                  name: room.name,
                  type: room.type,
                  algorithmOn: false,
                  programAssigned: room.heatingSchedule
                    ? room.heatingSchedule.templateName
                    : null,
                  currentTemperature: room.roomTemperature,
                  assigned: false,
                })),
              })),
            };
          }),
        };

        setInitialData(apiData);
      })
      .catch((error) => console.error("Error:", error));
  }, []);

  return (
    <>
      <Modal
        theme={customTheme}
        size={currentStep === 2 ? "7xl" : "5xl"}
        dismissible
        show={openCloneModal}
        onClose={handleCloseModal}
      >
        <Modal.Header className=" text-lg text-gray-900 [&>*]:font-semibold">
          Heizplan duplizieren: {program.templateName}
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-col items-center space-y-6">
            <ProgressStepper currentStep={currentStep} />
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
              {currentStep === 3 && (
                <div>
                  <ProgramAssignment
                    formData={formData}
                    setHandleAssignmentRef={(func) =>
                      (handleAssignmentRef.current = func)
                    }
                    assignmentData={handleAssignmentData}
                    handlePrev={handlePrevious}
                    heatingData={heatingAssignmentData}
                    initialData={initialData}
                    clone={false}
                    program={program}
                  />
                </div>
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          {currentStep < 3 ? (
            <Button className="bg-primary" onClick={handleNext}>
              Weiter
            </Button>
          ) : (
            <Button
              className={` ${
                buttonText === "Bestätigen"
                  ? "bg-green-400 focus:ring-green-400 focus:bg-green-400 hover:bg-green-400 enabled:hover:bg-green-400"
                  : "bg-primary"
              }`}
              onClick={handleCreate}
            >
              {buttonText}
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
