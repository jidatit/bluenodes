import { Button, Modal, Tooltip } from "flowbite-react";
import customTheme from "../../HeatingSchedule/CreateHeating/ModalTheme";
import { IoInformationCircleOutline } from "react-icons/io5";
import { useEffect, useState } from "react";
import HeatingScheduleComparison from "./HeatingScheduleComparison";
import HeatingScheduleTableStatic from "../../HeatingSchedule/components/HeatingScheduleTableStatic";
import { Spinner } from "flowbite-react";
import axios from "axios";
import ApiUrls from "../../../../globals/apiURL.js";
import HeatingPlanOverview from "../../../../shared/components/HeatingPlanOverview.jsx";

export function ViewRoomScheduleModal({
  openModal,
  handleOpenModal,
  heatingScheduleId,
  roomName,
  handleOpenEditModal,
  room,
}) {
  const [isChecked, setIsChecked] = useState(false);
  const [locationDetails, setLocationDetails] = useState(null);
  const [loading, setloading] = useState(false);

  const handleCloseModal = () => {
    handleOpenModal();
  };

  useEffect(() => {
    if (heatingScheduleId !== null) {
      setloading(true);
      axios
        .get(ApiUrls.SMARTHEATING_HEATINGSCHEDULE.DETAILS(heatingScheduleId))

        .then((response) => response.data)
        .then((data) => {
          setLocationDetails(data);
        })
        .catch((error) => console.error("Error:", error))
        .finally(() => setloading(false)); // Corrected here
    }
  }, [heatingScheduleId]);

  return (
    <>
      <Modal
        theme={customTheme}
        size={"7xl"}
        show={openModal}
        onClose={handleCloseModal}
      >
        {loading && (
          <Modal.Body className="flex flex-col items-center justify-center h-auto p-5 overflow-hidden">
            <Spinner />
          </Modal.Body>
        )}
        {locationDetails && (
          <>
            <Modal.Header className=" text-lg text-gray-900 [&>*]:font-semibold">
              {roomName}
            </Modal.Header>
            <Modal.Body className="h-auto p-5 overflow-hidden">
              <div className="flex items-start ">
                <HeatingPlanOverview locationDetails={locationDetails} />
                <div className="flex flex-col w-full gap-4 pl-4 border-l border-gray-200 ">
                  <h3 className="text-[16px] text-gray-500 font-semibold">
                    Heizplan
                  </h3>

                  {!isChecked ? (
                    <div className="max-h-[400px] overflow-y-auto overflow-x-hidden pr-2">
                      {locationDetails && (
                        <HeatingScheduleTableStatic
                          locationDetails={locationDetails}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="max-h-[400px] overflow-y-auto overflow-x-hidden">
                      <HeatingScheduleComparison
                        initialLayouts={locationDetails}
                        noHeading={true}
                      />
                    </div>
                  )}
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                onClick={() => {
                  if (room.heatingSchedule !== null) {
                    handleCloseModal();
                    handleOpenEditModal(room ? room : null);
                  }
                }}
                className="bg-primary"
              >
                Bearbeiten
              </Button>

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
    </>
  );
}
