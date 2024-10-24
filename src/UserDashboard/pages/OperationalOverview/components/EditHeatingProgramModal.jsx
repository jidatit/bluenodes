/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { Button, Modal, Radio, Label } from "flowbite-react";
import customTheme from "../../HeatingSchedule/CreateHeating/ModalTheme";
import { errorMessages as errors } from "../../../../globals/errorMessages"; // Import error messages
import ProgressStepper from "../../HeatingSchedule/CreateHeating/components/ProgressStepper";
import GeneralInformation from "../../HeatingSchedule/CreateHeating/Steps/GeneralInformation/GeneralInformation";
import HeatingSchedule from "../../HeatingSchedule/CreateHeating/Steps/HeatingSchedule/HeatingSchedule";
import useHeatingSchedule from "../../../../hooks/useHeatingSchedule";
import axios from "axios";
import ApiUrls from "../../../../globals/apiURL.js";
import { daysOfWeek } from "../../../../globals/daysofWeek.js";
import { useToast } from "./ToastContext.jsx";
import HeatingPlanTempDetails from "../../../../shared/components/HeatingPlanTempDetails.jsx";
import { handleConfirmReplaceHelper } from "../../../../shared/EditAndAssignHelper/helper/ConfirmReplaceHelper.js";
import { validateForm } from "../../../../shared/EditAndAssignHelper/helper/UseFormValidationEffct.js";
import { validateFieldHelper } from "../../../../shared/EditAndAssignHelper/helper/ValidateFieldHelper.js";
import { validateTemperaturesHelper } from "../../../../shared/EditAndAssignHelper/helper/ValidateTempratureHelper.js";
import { handleSubmitHelper } from "../../../../shared/EditAndAssignHelper/helper/HandleSubmitHelper.js";
import { convertScheduleDataFunc } from "../../../../shared/EditAndAssignHelper/helper/ConvertScheduleDataHelper.js";
import { handleCreateHelper } from "../../../../shared/EditAndAssignHelper/helper/HandleCreateHelper.js";
import ConfirmModal from "../../../../shared/components/ConfirmReplaceModal.jsx";
import ProgramSelector from "../../../../shared/components/ProgramSelector.jsx";

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
    handleConfirmReplaceHelper({
      roomId: room.id,
      selectedProgram,
      generateToast,
      setSelectedProgram,
      ApiUrls,
      errors,
      specificCallback: updateReplaced, // Specific callback for this component
      handleCloseModal,
      setShowConfirmModal,
      isAssign: false,
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
  // const fetchHeatingScheduleForRoom = async (heatingScheduleId) => {

  //   try {
  //     const resp = await axios.get(
  //       ApiUrls.SMARTHEATING_HEATINGSCHEDULE.HEATINGSCHEDULE_ID(
  //         heatingScheduleId
  //       )
  //     );
  //     const data = await resp.data;
  //     // console.log("Haeting", data);
  //     setLocationDetails(data);
  //     setFormDataApi(data);
  //     setFormData((prev) => ({
  //       ...prev,
  //       programName: `${data.templateName} - Room ${room.name}`,
  //       childSafety: data.allowDeviceOverride ? "No" : "Yes",
  //       minTemp: data.deviceOverrideTemperatureMin,
  //       maxTemp: data.deviceOverrideTemperatureMax,
  //       applyAlgorithm: room.algorithm ? "Yes" : "No",
  //     }));
  //   } catch (error) {
  //     console.error("Error fetching heating schedule:", error);
  //   }
  // };
  // useEffect(() => {
  //   if (room) {
  //     fetchHeatingScheduleForRoom(room.heatingSchedule?.id);
  //   }
  // }, [room]);

  const fetchHeatingScheduleForRoom = (heatingScheduleId) => {
    axios
      .get(
        ApiUrls.SMARTHEATING_HEATINGSCHEDULE.HEATINGSCHEDULE_ID(
          heatingScheduleId
        )
      )
      .then((response) => {
        const data = response.data; // Access data directly from response

        // Set states with the fetched data
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
      })
      .catch((error) => {
        console.error("Error fetching heating schedule:", error);
      });
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
      // Call the reusable form validation function
      const { newErrors, allFieldsFilled } = validateForm({
        formData,
        errors,
        createdHeatingScheduleNames, // Example of existing programs
      });

      if (!allFieldsFilled) {
        setGeneralErrorMessage(errors.allFieldsRequired);
      } else {
        setGeneralErrorMessage("");
      }

      if (Object.keys(newErrors).length > 0) {
        setErrorMessages(newErrors);
      } else {
        setErrorMessages({});
      }
    }
  }, [formSubmitted, formData]);

  const validateField = (id, value) => {
    validateFieldHelper({
      id,
      value,
      formData,
      errors,
      setErrorMessages,
    });
  };

  useEffect(() => {
    validateTemperaturesHelper({
      formData,
      setErrorMessages,
      errors,
      checkForInvalidChars: true,
    });
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

  const fetchHeatingSchedules = () => {
    axios
      .get(ApiUrls.SMARTHEATING_HEATINGSCHEDULE.LIST)
      .then((response) => {
        const data = response.data;
        const templateNames =
          data.length > 0 ? data.map((template) => template.templateName) : [];
        setCreatedHeatingScheduleNames(templateNames);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  const handleSubmit = () => {
    handleCheckName();

    const returnValue = handleSubmitHelper({
      formData,
      errors,
      ApiUrls,
      setErrorMessages,
      setFormSubmitted,
      fetchHeatingSchedules,
      createdHeatingScheduleNames,
      checkProgramName: true, // Program name check enabled for this component
      assign: false,
    });

    return returnValue;
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

  let newCheck;
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
  }, [formData, finalScheduleData]);

  function convertScheduleData(data) {
    const result = convertScheduleDataFunc(data, daysOfWeek);

    return result;
  }

  const handleCreate = async () => {
    try {
      handleCheckName();
      await handleCreateHelper(
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
        handleOpenModal
      );
      updateReplaced()
    } catch (error) {
      console.error("Error in handleCreate:", error);
      // Handle the error appropriately, such as showing a toast or modal
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

  // const handleCheckName = () => {
  //   const fetchHeatingSchedules = async () => {
  //     try {
  //       const response = await axios.get(
  //         ApiUrls.SMARTHEATING_HEATINGSCHEDULE.LIST
  //       );
  //       const data = await response.data;
  //       const templateNames =
  //         data.length > 0 ? data.map((template) => template.templateName) : [];
  //       setCreatedHeatingScheduleNames(templateNames);
  //     } catch (error) {
  //       console.error("Error:", error);
  //     }
  //   };
  //   fetchHeatingSchedules();
  //   const exists =
  //     createdHeatingScheduleNames &&
  //     createdHeatingScheduleNames.includes(formData.programName);
  //   if (exists) {
  //     setErrorMessages((prev) => ({
  //       ...prev,
  //       programName: errors.ProgramWithNameAlreadyCreated,
  //     }));
  //   }
  // };
  const handleCheckName = () => {
    axios
      .get(ApiUrls.SMARTHEATING_HEATINGSCHEDULE.LIST)
      .then((response) => {
        const data = response.data;
        const templateNames =
          data.length > 0 ? data.map((template) => template.templateName) : [];
        setCreatedHeatingScheduleNames(templateNames);

        const exists =
          templateNames && templateNames.includes(formData.programName);

        if (exists) {
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
        console.error("Error:", error);
      });
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
      })
      .catch((error) => console.error("Error:", error));
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    // <div className="flex flex-col items-start justify-start w-full gap-4 md:flex-row md:items-center">
    //   <div className="flex flex-col items-start justify-start w-full md:w-1/3">
    //     <label
    //       htmlFor="program"
    //       value="Program"
    //       className={`mb-2 text-sm pt-3 font-semibold ${
    //         showError ? "text-red-500" : "text-gray-700"
    //       }`}
    //     >
    //       {" "}
    //     </label>
    //     <select
    //       id="program"
    //       required
    //       className={` mt-1.5 w-full rounded-lg border-gray-300 text-gray-700 sm:text-sm`}
    //       value={selectedProgram}
    //       onChange={handleProgramChange}
    //     >
    //       <option value="">Heizplan auswählen</option>
    //       {data.map((program) => (
    //         <option
    //           className={`block rounded-lg px-4 py-2 text-sm ${
    //             program.id === room.heatingSchedule.id
    //               ? "bg-gray-100 text-gray-400 cursor-not-allowed"
    //               : "hover:bg-blue-100 hover:text-blue-700"
    //           }`}
    //           key={program.id}
    //           value={program.id}
    //           disabled={program.id === room.heatingSchedule.id}
    //         >
    //           {program.templateName.length > 50
    //             ? `${program.templateName.slice(0, 50)}...`
    //             : program.templateName}
    //         </option>
    //       ))}
    //     </select>

    //     {showError && (
    //       <p className="mt-1 text-sm text-red-500">
    //         Bitte einen Heizplan auswählen.
    //       </p>
    //     )}
    //   </div>
    // </div>

    <ProgramSelector
      label="Program"
      placeholder="Heizplan auswählen"
      errorMessage="Bitte einen Heizplan auswählen."
      data={data}
      room={room}
      selectedProgram={selectedProgram}
      handleProgramChange={handleProgramChange}
      showError={showError}
      disabledProgramId={room?.heatingSchedule?.id}
      componentType="edit"
      // Passing room object for the edit condition
    />
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
      })
      .catch((error) => console.error("Error:", error));
  };

  useEffect(() => {
    fetchDetails();
  }, [heatingScheduleId]);

  return (
    <HeatingPlanTempDetails
      temperatureDetails={temperatureDetails}
      isAlternate={true}
      title="Einstellungen"
      showTemplateName={true}
    />
  );
};

const ConfirmReplaceModal = ({ show, onClose, onConfirm }) => {
  return (
    <ConfirmModal
      show={show}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Ersetzen des Programms bestätigen"
      bodyText="Sind Sie sicher, dass Sie fortfahren möchten?"
    />
  );
};

export default EditHeatingProgramModal;
