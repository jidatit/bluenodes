import { Button, Modal } from "flowbite-react";
import ProgressStepper from "../../UserDashboard/pages/HeatingSchedule/CreateHeating/components/ProgressStepper";
import GeneralInformation from "../../UserDashboard/pages/HeatingSchedule/CreateHeating/Steps/GeneralInformation/GeneralInformation";
import HeatingSchedule from "../../UserDashboard/pages/HeatingSchedule/CreateHeating/Steps/HeatingSchedule/HeatingSchedule";

const EditModal = () => {
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
};

export default EditModal;
