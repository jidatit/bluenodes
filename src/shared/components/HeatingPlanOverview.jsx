import { Tooltip } from "flowbite-react";
import React from "react";
import { IoInformationCircleOutline } from "react-icons/io5";

const HeatingPlanOverview = ({ locationDetails }) => {
  return (
    <div className="flex flex-col w-1/3 gap-4 ">
      <h3 className="text-[16px] text-gray-500 font-semibold">Übersicht</h3>
      <div className="flex flex-col gap-2 text-sm font-normal text-gray-900">
        <div className="flex flex-col gap-2">
          <p className="font-semibold ">Name des Heizplans</p>
          <p className="">{locationDetails.templateName}</p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-semibold ">Kindersicherung</p>
          <p className="">
            {locationDetails.allowDeviceOverride ? "Aus" : "An"}
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
      </div>
    </div>
  );
};

export default HeatingPlanOverview;
