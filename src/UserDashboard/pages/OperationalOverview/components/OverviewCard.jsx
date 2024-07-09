/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState } from 'react';
import { FaRegCopy, FaEdit } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Button, Modal, Tooltip, Accordion, Progress } from "flowbite-react";
import { MdNotificationsActive } from "react-icons/md";
import HeatingScheduleTable from '../../HeatingSchedule/components/HeatingScheduleTable';
import bimg from '../../../../assets/images/Image.png'
import TemperatureSchedule from './TemperatureSchedule';

const OverviewCard = ({ formData }) => {
    // console.log("static", formData)
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [openAlertDeleteModal, setOpenAlertDeleteModal] = useState(false);

    const handleDelete = () => {
        setOpenDeleteModal(false);
        if (formData.heatingAssignmentData?.buildings.some(building => building.roomsAssigned !== 0)) {
            setOpenAlertDeleteModal(true);
        }
    };

    return (
        <>
            <div className='w-full relative flex flex-col bg-white rounded-[8px] px-4 py-4 justify-center items-center'>
              <div className=' flex items-start gap-4 w-full'>
                <div className=' w-[55px] h-[90px] rounded-md'>
                  <img src={bimg} className=' w-full h-full' />
                </div>
                <div className=' w-full h-full'>
                  <div className='w-full flex flex-row justify-start gap-[10px] items-end text-gray-900'>
                      <div className='w-[60%] flex flex-col justify-center items-start gap-2'>
                          <p className='text-[16px] font-[700]'>Building A</p>
                          <p className='text-[12px] font-[400] text-gray-500'>Devices Online</p>
                          <p className='text-[14px] font-[400]'>123/123</p>
                      </div>
                      <div className='w-[20%] flex flex-col justify-center items-start gap-1'>
                        <p className='text-[12px] font-[400] text-gray-500'>Room Assigned Rate</p>
                        <p className='text-[14px] font-[400]'>123/123</p>
                      </div>
                      <div className='w-[25%] flex flex-col justify-end items-end gap-1'>
                          <p className='text-[12px] text-gray-500 font-[500]'>50% rooms assigned</p>
                          <div className=' w-full max-w-[212px]'>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                              <div className="bg-green-500 h-2.5 rounded-full w-[45%]"></div>
                            </div>
                          </div>
                      </div>
                  </div>
                  <div className='w-full bg-[#a3a6ad] opacity-40 mt-3 mb-3 h-[1px]'></div>
                  <div className='w-full flex flex-row justify-start items-center'>
                      <Accordion className='w-full border-none' collapseAll>
                          <Accordion.Panel className=''>
                              <Accordion.Title className=' p-2 mb-1 flex-row-reverse items-center justify-end gap-1 border-none hover:bg-white focus:ring-none focus:ring-white bg-white focus:bg-white'>
                                  <p className="text-sm text-gray-900 font-bold">
                                      <span className={`text-xs font-normal py-0.5 px-2.5 ml-1 bg-gray-200 text-gray-900 rounded-md`}>
                                          6 floors
                                      </span>
                                  </p>
                              </Accordion.Title>
                              <Accordion.Content className='rounded-lg p-4 '>
                                  <div className='flex flex-row justify-between gap-4 items-start w-full '>
                                      <div className='flex flex-col justify-start items-start w-full'>
                                        <Accordion className='w-full border-none' collapseAll>
                                          <Accordion.Panel>
                                            <Accordion.Title className='w-full p-2 mb-1 flex-row-reverse items-center justify-end gap-3 border-none hover:bg-white focus:ring-none focus:ring-white bg-white focus:bg-white [&>h2]:w-full'>
                                              <div className=' w-full flex justify-between items-center'>
                                                <p className="text-sm w-full text-gray-900 font-bold">
                                                  Floor 1
                                                  <span className={`text-xs font-normal py-0.5 px-2.5 ml-1 bg-gray-200 text-gray-900 rounded-md`}>
                                                      6 floors
                                                  </span>
                                                </p>
                                                <div className='w-[25%] flex flex-col justify-end items-end gap-1'>
                                                    <p className='text-[12px] text-gray-500 font-[500]'>50% rooms assigned</p>
                                                    <div className=' w-full max-w-[212px]'>
                                                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                                        <div className="bg-green-500 h-2.5 rounded-full w-[45%]"></div>
                                                      </div>
                                                    </div>
                                                </div>
                                              </div>
                                            </Accordion.Title>
                                              <Accordion.Content className=' px-4 pt-0 pb-4 border-none'>
                                                <div className='w-full bg-[#a3a6ad] opacity-40 mt-3 mb-5 h-[1px]'></div>
                                                <div className=' px-7 flex flex-col gap-5 w-full'>
                                                  <TemperatureSchedule/>
                                                </div>
                                              </Accordion.Content>
                                            </Accordion.Panel>
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
    )
}

const DeleteModal = ({ openDeleteModal, setOpenDeleteModal, handleDelete }) => {
    return (
        <Modal show={openDeleteModal} size="lg" onClose={() => setOpenDeleteModal(false)} popup>
            <Modal.Header />
            <Modal.Body>
                <div className="text-center">
                    <RiDeleteBin6Line size={30} className="text-[#9CA3AF] mx-auto mb-4" />
                    <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete this heating program?
                    </h3>
                    <div className="flex justify-center gap-4">
                        <Button color="gray" onClick={() => setOpenDeleteModal(false)}>
                            Cancel
                        </Button>
                        <Button color="failure" onClick={handleDelete}>
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};

const AlertDeleteModal = ({ openAlertDeleteModal, setOpenAlertDeleteModal }) => {
    return (
        <Modal show={openAlertDeleteModal} size="lg" onClose={() => setOpenAlertDeleteModal(false)} popup>
            <Modal.Header />
            <Modal.Body>
                <div className="text-center">
                    <MdNotificationsActive size={30} className="text-[#9CA3AF] mx-auto mb-4" />
                    <h3 className="mb-1 text-lg font-normal text-gray-500 dark:text-gray-400">
                        Heating program can’t be deleted as there are rooms assigned to it.
                    </h3>
                    <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                        Reassign rooms to different program before proceeding with delete.
                    </h3>
                    <div className="flex justify-center gap-4">
                        <Button color="gray" onClick={() => setOpenAlertDeleteModal(false)}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default OverviewCard;
