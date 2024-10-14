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
import { daysOfWeek } from "../../../../globals/daysofWeek.js";
import { useToast } from "../../OperationalOverview/components/ToastContext.jsx";
import setFormDataHelper from "../../../../shared/helper/formDataHelper.js";
import validateFormData from "../../../../shared/helper/ValidateFormData.js";
import validateFieldHelper from "../../../../shared/helper/ValidateFieldHelper.js";
import validateTemperatureHelper from "../../../../shared/helper/ValidateTemperatureHelper.js";
import handleFormChangeHelper from "../../../../shared/helper/FormChangeValidationCheckHelper.js";
import validateAndSubmit from "../../../../shared/helper/HandleSubmitHelper.js";
import { prepareApiPayload } from "../../../../shared/helper/createEditHeatingHelper.js";
import handleCheckNameHelper from "../../../../shared/helper/HandleCheckNameHelper.js";

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
  const component = "edit";
  useEffect(() => {
    if (openEditModal) {
      const formData = setFormDataHelper(program, component); // No clone, so isClone is false or omitted
      setFormData(formData);
      setFormDataApi(program);
    }
  }, [openEditModal, program]);

  useEffect(() => {
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

  useEffect(() => {
    validateTemperatureHelper(formData, setErrorMessages, errors, "edit");
  }, [formData]);

  const handleChange = (e) => {
    handleFormChangeHelper(
      e,
      formData,
      setFormData,
      formDataApi,
      validateFieldHelper,
      setErrorMessages,
      errors,
      setGeneralErrorMessage,
      "edit"
    );
  };

  const handleSubmit = () => {
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
      "edit"
    );

    if (!valid) {
      return false; // Form is invalid
    }

    // Proceed with form submission or other logic
    return true; // Form is valid
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

        // Use the reusable helper to prepare API data
        const finalObj = prepareApiPayload(
          combinedData,
          scheduleDataTemp,
          daysOfWeek
        );

        axios
          .put(
            ApiUrls.SMARTHEATING_HEATINGSCHEDULE.HEATINGSCHEDULE_ID(program.id),
            finalObj
          )
          .then((response) => {
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
    handleCheckNameHelper(
      ApiUrls,
      setCreatedHeatingScheduleNames,
      formData,
      program,
      setErrorMessages,
      errors,
      "edit"
    );
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
