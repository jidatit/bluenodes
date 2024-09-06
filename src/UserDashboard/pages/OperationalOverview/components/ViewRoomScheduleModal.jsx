/* eslint-disable react/prop-types */
// Parent Component
import { Button, Modal, ToggleSwitch, Tooltip } from "flowbite-react";
import customTheme from "../../HeatingSchedule/CreateHeating/ModalTheme";
import { IoInformationCircleOutline } from "react-icons/io5";
import { useEffect, useState } from "react";
import HeatingScheduleTable from "../../HeatingSchedule/components/HeatingScheduleTable";
import HeatingScheduleComparison from "./HeatingScheduleComparison";
import HeatingScheduleTableStatic from "../../HeatingSchedule/components/HeatingScheduleTableStatic";
import { Spinner } from "flowbite-react";
import axios from "axios";
import ApiUrls from "../../../../globals/apiURL.js";

export function ViewRoomScheduleModal({
  openModal,
  handleOpenModal,
  algo,
  heatingScheduleId,
  roomName,
  handleOpenEditModal,
  room,
}) {
  const [switch1, setSwitch1] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [locationDetails, setLocationDetails] = useState(null);
  const [loading, setloading] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };
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
                <div className="flex flex-col w-1/3 gap-4 ">
                  <h3 className="text-[16px] text-gray-500 font-semibold">
                    Übersicht
                  </h3>
                  <div className="flex flex-col gap-2 text-sm font-normal text-gray-900">
                    <div className="flex flex-col gap-2">
                      <p className="font-semibold ">Name des Heizplans</p>
                      <p className="">{locationDetails.templateName}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="font-semibold ">Kindersicherung</p>
                      <p className="">
                        {locationDetails.allowDeviceOverride ? "No" : "Yes"}
                      </p>
                    </div>

                    {locationDetails.allowDeviceOverride && (
                      <>
                        <div className="flex flex-col gap-2">
                          <p className="flex items-center gap-1 font-semibold">
                          Mindesttemperatur
                          <Tooltip
                              className="px-3 py-1.5 text-center max-w-96"
                              content="Die Mindesttemperatur, die am Thermostat manuell eingestellt werden kann."
                              style="light"
                            >
                              <IoInformationCircleOutline color="#6B7280" />
                            </Tooltip>
                          </p>
                          <p className="">
                            {locationDetails.deviceOverrideTemperatureMin}°C
                          </p>
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
                          <p className="">
                            {locationDetails.deviceOverrideTemperatureMax}°C
                          </p>
                        </div>
                      </>
                    )}

                    <div className="flex flex-col gap-2">
                      <p className="flex items-center gap-1 font-semibold ">
                        Algorithmus aktivieren
                        <Tooltip
                          className="px-3 py-1.5 text-center max-w-96"
                          content="Der Algorithmus passt dynamisch den Heizplan an."
                          style="light"
                        >
                          <IoInformationCircleOutline color="#6B7280" />
                        </Tooltip>
                      </p>
                      <p className="">{algo ? "Yes" : "No"}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col w-full gap-4 pl-4 border-l border-gray-200 ">
                  <h3 className="text-[16px] text-gray-500 font-semibold">
                    Heizplan
                  </h3>
                  {/* <ToggleSwitch checked={switch1} label="Toggle me" onChange={setSwitch1} /> */}
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={handleCheckboxChange}
                          className="sr-only"
                        />
                        <div
                          className={`box block h-5 !w-10 rounded-full ${
                            isChecked ? "bg-primary" : " bg-gray-200"
                          }`}
                        ></div>
                        <div
                          className={`absolute left-1 top-[2px] flex h-4 w-4 items-center justify-center rounded-full bg-white transition ${
                            isChecked ? "translate-x-full" : ""
                          }`}
                        ></div>
                      </div>
                      {!isChecked ? (
                        <div className="text-sm font-medium text-gray-900 ">
                          Vergleich zum intelligenten Heizplan
                        </div>
                      ) : (
                        <div className="text-sm font-medium text-gray-900 ">
                          Ursprünglichen Heizplan anzeigen
                        </div>
                      )}
                    </label>
                  </div>
                  {!isChecked ? (
                    <div className="max-h-[400px] overflow-y-auto overflow-x-hidden pr-2">
                      {locationDetails && (
                        <HeatingScheduleTableStatic
                          locationDetails={locationDetails}
                          // noHeading={true}
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
