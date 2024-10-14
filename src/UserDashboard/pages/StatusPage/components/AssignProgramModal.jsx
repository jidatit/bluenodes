import { useEffect, useRef, useState } from "react";
import { Button, Modal, Tooltip } from "flowbite-react";
import { IoInformationCircleOutline } from "react-icons/io5";
import customTheme from "../../HeatingSchedule/CreateHeating/ModalTheme";
import { errorMessages as errors } from "../../../../globals/errorMessages"; // Import error messages
import HeatingScheduleTable from "../../HeatingSchedule/components/HeatingScheduleTable";
import axios from "axios";
import ApiUrls from "../../../../globals/apiURL.js";
import { daysOfWeek } from "../../../../globals/daysofWeek.js";
import { useToast } from "../../OperationalOverview/components/ToastContext.jsx";
import HeatingPlanTempDetails from "../../../../shared/components/HeatingPlanTempDetails.jsx";
import { handleConfirmReplaceHelper } from "../../../../shared/EditAndAssignHelper/helper/ConfirmReplaceHelper.js";
import { validateForm } from "../../../../shared/EditAndAssignHelper/helper/UseFormValidationEffct.js";
import { validateFieldHelper } from "../../../../shared/EditAndAssignHelper/helper/ValidateFieldHelper.js";
import { validateTemperaturesHelper } from "../../../../shared/EditAndAssignHelper/helper/ValidateTempratureHelper.js";
import { handleSubmitHelper } from "../../../../shared/EditAndAssignHelper/helper/HandleSubmitHelper.js";
import { handleCreateHelper } from "../../../../shared/EditAndAssignHelper/helper/HandleCreateHelper.js";
import { convertScheduleDataFunc } from "../../../../shared/EditAndAssignHelper/helper/ConvertScheduleDataHelper.js";
import ConfirmModal from "../../../../shared/components/ConfirmReplaceModal.jsx";
import ProgramSelector from "../../../../shared/components/ProgramSelector.jsx";

const AssignProgramModal = ({
  openModal,
  handleOpenModal,
  room,
  fetchList,
  assignSuccess,
}) => {
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [showError, setShowError] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { generateToast } = useToast();
  const handleCloseModal = () => {
    handleCancelReplace();
    handleOpenModal();
    setSelectedProgram("");
    resetModalState();
    fetchList();
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
    if (!selectedProgram) {
      setShowError(true);
    } else {
      handleConfirmReplace();
    }
  };

  const handleConfirmReplace = () => {
    handleConfirmReplaceHelper({
      roomId: room.locationId,
      selectedProgram,
      generateToast,
      setSelectedProgram,
      ApiUrls,
      errors,
      specificCallback: assignSuccess,
      handleCloseModal,
      setShowConfirmModal,
      isAssign: true, // This flag indicates a slight difference in behavior
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
  //   console.log("id", heatingScheduleId);
  //   try {
  //     const resp = await axios.get(
  //       ApiUrls.SMARTHEATING_HEATINGSCHEDULE.HEATINGSCHEDULE_ID(
  //         heatingScheduleId
  //       )
  //     );
  //     const data = await resp.data;

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
  useEffect(() => {
    console.log("item", room);
    // if (room) {
    // 	fetchHeatingScheduleForRoom(room.heatingSchedule?.id);
    // }
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
      // Call the reusable form validation function with custom validation
      const { newErrors, allFieldsFilled } = validateForm({
        formData,
        errors,
        createdHeatingScheduleNames: "createdHeatingScheduleNames", // Different programs for Component 2
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
    });
  }, [formData]);

  const handleSubmit = () => {
    const returnValue = handleSubmitHelper({
      formData,
      errors,
      ApiUrls,
      setErrorMessages,
      setFormSubmitted,
      fetchHeatingSchedules: "fetchHeatingSchedules",
      createdHeatingScheduleNames: "createdHeatingScheduleNames", // No need to fetch schedule names in this component
      checkProgramName: false,
      assign: true,
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
  }, [formData, finalScheduleData]);

  function convertScheduleData(data) {
    const result = convertScheduleDataFunc(data, daysOfWeek);

    return result;
  }

  const handleCreate = async () => {
    try {
      await handleCreateHelper({
        handleCheckRef,
        newCheck,
        layoutsRef,
        setFinalScheduleData,
        convertScheduleData,
        combinedData,
        formData,
        room,
        ApiUrls,
        setCreatedHeatingScheduleNames: "setCreatedHeatingScheduleNames",
        errors,
        setErrorMessages,
        createdHeatingScheduleNames: "createdHeatingScheduleNames",
        generateToast,
        resetModalState,
        handleCloseModal,
        fetchFloorDetails: "fetchFloorDetails",
        updateReplaced: "updateReplaced",
        handleOpenModal,
      });
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
              Heizplan zuweisen - {room.name}
            </Modal.Header>
            <Modal.Body className="p-5 overflow-y-auto h-auto">
              <div className="w-full flex flex-col justify-center items-start">
                <p>Heizplan auswählen</p>

                <div className="w-full flex flex-col  mb-3 justify-center items-center">
                  <ReplaceProgram
                    selectedProgram={selectedProgram}
                    handleProgramChange={handleProgramChange}
                    showError={showError}
                    room={room}
                  />
                  {/* )
									)} */}
                </div>

                {selectedProgram && (
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
    // <div className="w-full flex flex-col md:flex-row justify-start items-start md:items-center gap-4">
    //   <div className="flex flex-col justify-start items-start w-full md:w-1/3">
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
    //         <option key={program.id} value={program.id}>
    //           {program.templateName.length > 50
    //             ? `${program.templateName.slice(0, 50)}...`
    //             : program.templateName}
    //         </option>
    //       ))}
    //     </select>

    //     {showError && (
    //       <p className="text-red-500 text-sm mt-1">
    //         Ein Programm muss ausgewählt werden.
    //       </p>
    //     )}
    //   </div>
    // </div>
    <ProgramSelector
      label="Program"
      placeholder="Heizplan auswählen"
      errorMessage="Ein Programm muss ausgewählt werden."
      data={data}
      selectedProgram={selectedProgram}
      handleProgramChange={handleProgramChange}
      showError={showError}
      disabledProgramId={room?.heatingSchedule?.id}
      componentType="assign"
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
      isAlternate={false}
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
      title="Zuweisung des Programms bestätigen"
      bodyText="Das Zuweisen eines Programms wird alle Informationen des vorherigen Programms entfernen. Sind Sie sicher, dass Sie fortfahren möchten?"
    />
  );
};

export default AssignProgramModal;
