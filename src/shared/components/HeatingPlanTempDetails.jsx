import { Tooltip } from "flowbite-react";

import { IoInformationCircleOutline } from "react-icons/io5";
import HeatingScheduleTable from "../../UserDashboard/pages/HeatingSchedule/components/HeatingScheduleTable";

const HeatingPlanTempDetails = ({
  temperatureDetails,
  isAlternate = false, // A flag to differentiate between the two versions
  title = "Einstellungen", // Customizable title
  showTemplateName = true, // Toggle for showing template name
}) => {
  return (
    <div className="p-5 w-full">
      <div className="flex w-full items-start">
        <div className="w-[25%] flex flex-col gap-4">
          <h3 className="text-[16px] text-gray-500 font-semibold">{title}</h3>
          <div className="flex flex-col gap-2 text-sm text-gray-900 font-normal">
            {showTemplateName && (
              <div className="flex flex-col gap-2">
                <p className="font-semibold">
                  {isAlternate ? "Kindersicherung" : "Name des Heizplans"}
                </p>
                <p>{temperatureDetails?.templateName || "--"}</p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <p className="font-semibold">Kindersicherung</p>
              <p>{temperatureDetails?.allowDeviceOverride ? "Aus" : "An"}</p>
            </div>

            {temperatureDetails?.allowDeviceOverride && (
              <>
                <div className="flex flex-col gap-2">
                  <p className="font-semibold flex items-center gap-1">
                    Mindesttemperatur
                    <Tooltip
                      className="px-3 py-1.5 text-center max-w-96"
                      content="Die Mindesttemperatur, die am Thermostat manuell eingestellt werden kann."
                      style="light"
                    >
                      <IoInformationCircleOutline color="#6B7280" />
                    </Tooltip>
                  </p>
                  <p>
                    {temperatureDetails?.deviceOverrideTemperatureMin || "--"}
                    °C
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="font-semibold flex items-center gap-1">
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
                    {temperatureDetails?.deviceOverrideTemperatureMax || "--"}
                    °C
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="w-[75%] border-l flex flex-col gap-4 border-gray-200 pl-4">
          <div className="max-h-[400px] overflow-y-auto overflow-x-hidden">
            {temperatureDetails && (
              <HeatingScheduleTable locationDetails={temperatureDetails} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatingPlanTempDetails;
