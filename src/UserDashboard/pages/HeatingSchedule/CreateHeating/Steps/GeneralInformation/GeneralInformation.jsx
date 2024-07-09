/* eslint-disable react/prop-types */
import { Label, Radio, TextInput, Tooltip } from "flowbite-react";
import { FaCircleCheck } from "react-icons/fa6";
import { IoInformationCircleOutline } from "react-icons/io5";

function GeneralInformation({ formData, handleChange, errorMessages, generalErrorMessage }) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <h3 className="text-[16px] text-gray-500 font-semibold">General information</h3>
      {generalErrorMessage && (
        <div className="text-red-800 p-4 bg-[#FDF2F2] w-fit text-[16px] font-semibold flex items-center gap-2">
          <FaCircleCheck />
          {generalErrorMessage}
        </div>
      )}
      <form className="flex flex-col gap-6">
        {/* row 1 */}
        <div className="flex items-start gap-6">
          {/* program name */}
          <div>
            <div className="mb-2 block">
              <Label className=" text-sm text-gray-900" htmlFor="program-name" value="Program name" />
            </div>
            <TextInput
              id="programName"
              type="text"
              sizing="sm"
              placeholder="Program name"
              className="w-[250px]"
              onChange={handleChange}
              required
              color={errorMessages.programName ? "failure" : undefined}
              helperText={
                errorMessages.programName && (
                  <>
                    <span className="font-medium">Oops!</span> {errorMessages.programName}
                  </>
                )
              }
              value={formData.programName}
            />
          </div>
          {/* child safety */}
          <div>
            <div className="mb-2 block">
              <Label className=" text-sm text-gray-900" htmlFor="child-safety" value="Child Safety" />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Radio
                  id="childSafetyYes"
                  name="child-safety"
                  value="Yes"
                  onChange={handleChange}
                  required
                  checked={formData.childSafety === "Yes"}
                />
                <Label className="text-sm text-gray-900" htmlFor="childSafetyYes">Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <Radio
                  id="childSafetyNo"
                  name="child-safety"
                  value="No"
                  onChange={handleChange}
                  required
                  checked={formData.childSafety === "No"}
                />
                <Label className="text-sm text-gray-900" htmlFor="childSafetyNo">No</Label>
              </div>
            </div>

            {errorMessages.childSafety && (
              <div className="text-red-600 text-sm mt-1">
                {errorMessages.childSafety}
              </div>
            )}
          </div>
        </div>

        {/* row 2 */}
        <div className="flex items-start gap-6">
          {/* Minimum temperature */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Label className=" text-sm text-gray-900" htmlFor="min-temp" value="Minimum temperature" />
              <Tooltip
                className="px-3 py-1.5 text-center max-w-96"
                content="The minimum temperature that can be manually adjusted on the thermometer by physical means."
                style="light"
              >
                <IoInformationCircleOutline color="#6B7280" />
              </Tooltip>
            </div>
            <TextInput
              id="minTemp"
              type="text"
              sizing="sm"
              placeholder="Minimum temperature"
              className="w-[250px]"
              onChange={handleChange}
              required
              color={errorMessages.minTemp ? "failure" : undefined}
              helperText={
                errorMessages.minTemp && (
                  <>
                    <span className="font-medium">Oops!</span> {errorMessages.minTemp}
                  </>
                )
              }
              value={formData.minTemp}
            />
          </div>
          {/* Maximum temperature */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Label className=" text-sm text-gray-900" htmlFor="max-temp" value="Maximum temperature" />
              <Tooltip
                className="px-3 py-1.5 text-center max-w-96"
                content="The maximum temperature that can be manually adjusted on the thermometer by physical means."
                style="light"
              >
                <IoInformationCircleOutline color="#6B7280" />
              </Tooltip>
            </div>
            <TextInput
              id="maxTemp"
              type="text"
              sizing="sm"
              placeholder="Maximum temperature"
              className="w-[250px]"
              onChange={handleChange}
              required
              color={errorMessages.maxTemp ? "failure" : undefined}
              helperText={
                errorMessages.maxTemp && (
                  <>
                    <span className="font-medium">Oops!</span> {errorMessages.maxTemp}
                  </>
                )
              }
              value={formData.maxTemp}
            />
          </div>
          {/* Apply algorithm? */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Label className=" text-sm text-gray-900" htmlFor="apply-algorithm" value="Apply algorithm?" />
              <Tooltip
                className="px-3 py-1.5 text-center max-w-96"
                content="The minimum temperature that can be manually adjusted on the thermometer by physical means."
                style="light"
              >
                <IoInformationCircleOutline color="#6B7280" />
              </Tooltip>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Radio
                    id="applyAlgorithmYes"
                    name="applyAlgorithm"
                    value="Yes"
                    onChange={handleChange}
                    required
                    checked={formData.applyAlgorithm === "Yes"}
                  />
                  <Label className="text-sm text-gray-900" htmlFor="applyAlgorithmYes">Yes</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Radio
                    id="applyAlgorithmNo"
                    name="applyAlgorithm"
                    value="No"
                    onChange={handleChange}
                    required
                    checked={formData.applyAlgorithm === "No"}
                  />
                  <Label className="text-sm text-gray-900" htmlFor="applyAlgorithmNo">No</Label>
                </div>
              </div>

            </div>
            {errorMessages.applyAlgorithm && (
              <div className="text-red-600 text-sm mt-1">
                {errorMessages.applyAlgorithm}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default GeneralInformation;
