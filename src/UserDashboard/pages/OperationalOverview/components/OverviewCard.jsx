/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { FaRegCopy, FaEdit } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import {
  Button,
  Modal,
  Tooltip,
  Accordion,
  Progress,
  List,
} from "flowbite-react";
import { MdNotificationsActive } from "react-icons/md";
import HeatingScheduleTable from "../../HeatingSchedule/components/HeatingScheduleTable";
import bimg from "../../../../assets/images/Image.png";
import TemperatureSchedule from "./TemperatureSchedule";
import { FaCircleExclamation } from "react-icons/fa6";
import { errorMessages as errors } from "../../../../globals/errorMessages"; // Import error messages
import React, { memo } from "react";

const OverviewCard = ({ formData }) => {
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openAlertDeleteModal, setOpenAlertDeleteModal] = useState(false);
  const [buildError, setBuildError] = useState(true);
  const [accordianOpened, setaccordianOpened] = useState(false);
  const [accordianOpened2, setaccordianOpened2] = useState(false);

  const [opened, setOpened] = useState(false);
  const handleDelete = () => {
    setOpenDeleteModal(false);
    if (formData.children.some((child) => child.roomsAssigned !== 0)) {
      setOpenAlertDeleteModal(true);
    }
  };
  const [count, setCount] = useState(0);
  const [indexCount, setIndexCount] = useState();

  const triggerCount = () => {
    setCount(count + 1);
    if (count % 2 === 0) {
      setaccordianOpened(true);
    }
  };
  const [openedIndex, setOpenedIndex] = useState(null);

  const triggerCount2 = (index) => {
    if (openedIndex === index) {
      setOpenedIndex(null);
      setaccordianOpened2(false);
    } else {
      setOpenedIndex(index);
      setaccordianOpened2(true);
    }
  };

  return (
    <>
      <div className="w-full relative flex flex-col border-gray-200 border-[1px] bg-white rounded-[8px] px-4 py-4 justify-center items-center">
        <div className="flex items-start w-full gap-4">
          <div className="w-[55px] h-[90px] rounded-md">
            <img
              src={bimg || "default-image-url"}
              className="w-full h-full"
              alt="Building"
            />
          </div>
          <div className="w-full h-full">
            <div className="w-full flex flex-row justify-start gap-[10px] items-end text-gray-900">
              <div className="w-[60%] flex flex-col justify-center items-start gap-2">
                <div className="flex items-center gap-1">
                  <p className="text-[16px] font-[700]">{formData.name}</p>
                </div>
                <p className="text-[12px] font-[400] text-gray-500">
                  Geräte online
                </p>
                <p className="text-[14px] font-[400]">
                  {formData.numberOfDevicesOnline}/{formData.numberOfDevices}
                </p>
              </div>
              <div className="w-[20%] flex flex-col justify-center items-start gap-1">
                <p className="text-[12px] font-[400] text-gray-500">
                  Räume mit Heizplan
                </p>
                <p className="text-[14px] font-[400]">
                  {formData.assignedNumberOfRooms}/{formData.numberOfRooms}
                </p>
              </div>
              <div className="w-[25%] flex flex-col justify-end items-end gap-1">
                <p className="text-[12px] text-gray-500 font-[500]">
                  {(
                    (formData.assignedNumberOfRooms / formData.numberOfRooms) *
                    100
                  ).toFixed(0)}
                  % automatisierte Räume
                </p>
                <div className="w-full max-w-[212px]">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="bg-green-500 h-2.5 rounded-full"
                      style={{
                        width: `${
                          (formData.assignedNumberOfRooms /
                            formData.numberOfRooms) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full bg-[#a3a6ad] opacity-40 mt-3 mb-3 h-[1px]"></div>
            <div className="flex flex-row items-center justify-start w-full">
              <Accordion className="w-full border-none" collapseAll>
                <Accordion.Panel>
                  <Accordion.Title className="relative flex-row-reverse items-center justify-end gap-1 p-2 mb-1 bg-white border-none hover:bg-white focus:ring-none focus:ring-white focus:bg-white outline-0">
                    <div
                      onClick={() => triggerCount()}
                      className="absolute top-0 bottom-0 left-0 right-0 z-50 bg-transparent"
                    ></div>
                    <p className="text-sm font-bold text-gray-900">
                      <span className="text-xs font-normal py-0.5 px-2.5 ml-1 bg-gray-200 text-gray-900 rounded-md">
                        {formData.numberOfFloors} Etagen
                      </span>
                    </p>
                  </Accordion.Title>
                  <Accordion.Content className="rounded-lg p-[16px]">
                    <div className="flex flex-row items-start justify-between w-full gap-4">
                      <div className="flex flex-col items-start justify-start w-full">
                        <Accordion className="w-full border-none" collapseAll>
                          {formData.children.map((child, index) => (
                            <Accordion.Panel key={index}>
                              <Accordion.Title className="w-full relative p-2 mb-1 flex-row-reverse items-center justify-end gap-3 border-none hover:bg-white focus:ring-none focus:ring-white bg-white focus:bg-white outline-0 [&>h2]:w-full">
                                <div
                                  onClick={() => {
                                    triggerCount2(index);
                                  }}
                                  className="absolute top-0 bottom-0 left-0 right-0 z-50 bg-transparent"
                                ></div>
                                <div className="flex items-center justify-between w-full">
                                  <p className="w-full text-sm font-bold text-gray-900">
                                    {child.name}
                                    <span className="text-xs font-normal py-0.5 px-2.5 ml-1 bg-gray-200 text-gray-900 rounded-md">
                                      {child.numberOfRooms} Räume
                                    </span>
                                  </p>
                                  <div className="w-[25%] flex flex-col justify-end items-end gap-1">
                                    <p className="text-[12px] text-gray-500 font-[500]">
                                      {(
                                        (child.assignedNumberOfRooms /
                                          child.numberOfRooms) *
                                        100
                                      ).toFixed(0)}
                                      % automatisierte Räume
                                    </p>
                                    <div className="w-full max-w-[212px]">
                                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                        <div
                                          className="bg-green-500 h-2.5 rounded-full"
                                          style={{
                                            width: `${
                                              (child.assignedNumberOfRooms /
                                                child.numberOfRooms) *
                                              100
                                            }%`,
                                          }}
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </Accordion.Title>
                              <Accordion.Content className="px-4 pt-0 pb-4 border-none">
                                <div className="w-full bg-[#a3a6ad] opacity-40 mt-3 mb-5 h-[1px]"></div>
                                <div className="flex flex-col w-full gap-5 px-7">
                                  <TemperatureSchedule
                                    accordianOpened2={accordianOpened2}
                                    setaccordianOpened2={setaccordianOpened2}
                                    accordianOpened={accordianOpened}
                                    setaccordianOpened={setaccordianOpened}
                                    floorId={child.id}
                                  />
                                </div>
                              </Accordion.Content>
                            </Accordion.Panel>
                          ))}
                        </Accordion>
                      </div>
                    </div>
                  </Accordion.Content>
                </Accordion.Panel>
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const DeleteModal = ({ openDeleteModal, setOpenDeleteModal, handleDelete }) => {
  return (
    <Modal
      show={openDeleteModal}
      size="lg"
      onClose={() => setOpenDeleteModal(false)}
      popup
    >
      <Modal.Header />
      <Modal.Body>
        <div className="text-center">
          <RiDeleteBin6Line size={30} className="text-[#9CA3AF] mx-auto mb-4" />
          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            Möchten Sie diesen Heizplan wirklich löschen?
          </h3>
          <div className="flex justify-center gap-4">
            <Button color="gray" onClick={() => setOpenDeleteModal(false)}>
              Abbrechen
            </Button>
            <Button color="failure" onClick={handleDelete}>
              Löschen
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

const AlertDeleteModal = ({
  openAlertDeleteModal,
  setOpenAlertDeleteModal,
}) => {
  return (
    <Modal
      show={openAlertDeleteModal}
      size="lg"
      onClose={() => setOpenAlertDeleteModal(false)}
      popup
    >
      <Modal.Header />
      <Modal.Body>
        <div className="text-center">
          <MdNotificationsActive
            size={30}
            className="text-[#9CA3AF] mx-auto mb-4"
          />
          <h3 className="mb-1 text-lg font-normal text-gray-500 dark:text-gray-400">
            Der Heizplan kann nicht gelöscht werden, da Räume ihn noch nutzen.
          </h3>
          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            Stellen Sie sicher, dass die Räume einem anderen Heizplan zugewiesen
            sind, bevor Sie den Heizplan löschen.
          </h3>
          <div className="flex justify-center gap-4">
            <Button color="gray" onClick={() => setOpenAlertDeleteModal(false)}>
              Abbrechen
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default OverviewCard;
