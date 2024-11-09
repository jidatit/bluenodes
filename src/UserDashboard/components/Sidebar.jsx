import classNames from "classnames";
import { Dropdown, Sidebar } from "flowbite-react";
import { useEffect, useState } from "react";
import { HiHome } from "react-icons/hi";
import logoIcon from "../../assets/logos/Logo-sm.png";
import logoText from "../../assets/logos/logo-text.png";
import { useSidebarContext } from "../../context/SidebarContext";
import isSmallScreen from "../helpers/is-small-screen";
import { FaBuilding, FaRegWindowRestore } from "react-icons/fa";
import { HiMiniCog6Tooth } from "react-icons/hi2";
import customTheme from "./sidebarTheme";
import Avatar from "../../assets/dummy/Avatar.png";
import { NavLink, useLocation } from "react-router-dom";
import { NAVIGATION_PATH } from "../../globals/navPaths";
import { IoLogOut } from "react-icons/io5";
import { useAuth } from "../../AuthContext";
import { Modal } from "flowbite-react";
import { Button } from "flowbite-react";
import axios from "axios";
import ApiUrls from "../../globals/apiURL";
import GetStartedCard from "./GetStartedCard";
import CompactGetStartedCard from "./GetStartedCard";
const STAGE = import.meta.env.VITE_APP_STAGE;
const user = {
  name: "Bonnie Green",
  email: "name@company.com",
  avatar: Avatar,
};

const ExampleSidebar = () => {
  const {
    isOpenOnSmallScreens: isSidebarOpenOnSmallScreens,
    isCollapsed,
    setIsCollapsed,
    isHovered,
    handleMouseEnter,
    handleMouseLeave,
    toggleCollapsedState,
  } = useSidebarContext();

  const [currentPage, setCurrentPage] = useState("");
  const location = useLocation();

  useEffect(() => {
    const newPage = location.pathname;
    setCurrentPage(newPage);
  }, [location]);

  useEffect(() => {
    setIsCollapsed(isSmallScreen());
  }, []);

  return (
    <div
      className={classNames("lg:!block", {
        hidden: isSmallScreen() && !isSidebarOpenOnSmallScreens,
      })}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Sidebar
        collapsed={isSmallScreen() ? isCollapsed : isCollapsed && !isHovered}
        theme={customTheme}
      >
        <div className="flex h-full min-h-[98vh] flex-col justify-between py-2 bg-white">
          <div className="text-lg ">
            <div
              className={classNames("flex items-center mb-6 ", {
                "justify-center": isCollapsed, // Hide button when sidebar is collapsed
                "!justify-between": (isHovered && isCollapsed) || !isCollapsed, // Hide button when sidebar is collapsed
              })}
            >
              <div className="flex items-center gap-3 ">
                <img src={logoIcon} onClick={toggleCollapsedState} />
                <img
                  src={logoText}
                  className={classNames({
                    "hidden ": isCollapsed, // Hide button when sidebar is collapsed
                    "!block ": isHovered && isCollapsed, // Hide button when sidebar is collapsed
                  })}
                />
              </div>

              <button
                onClick={toggleCollapsedState}
                className={classNames(
                  " cursor-pointer rounded p-2 text-gray-600 dark:text-gray-400 ",
                  {
                    "hidden ": isCollapsed, // Hide button when sidebar is collapsed
                    "!inline ": isHovered && isCollapsed, // Hide button when sidebar is collapsed
                  }
                )}
              >
                <span className="sr-only">Toggle collapsed state</span>
                <svg
                  className={`w-6 h-6 text-gray-800 dark:text-white transform transition-transform duration-1000 ${
                    isCollapsed ||
                    (isSmallScreen() && !isSidebarOpenOnSmallScreens)
                      ? "rotate-0"
                      : "rotate-180"
                  }`}
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 12H4m12 0-4 4m4-4-4-4m3-4h2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-2"
                  />
                </svg>
              </button>
            </div>
            <Sidebar.Items>
              <Sidebar.ItemGroup>
                <Sidebar.Item
                  as={NavLink}
                  to={NAVIGATION_PATH.dashboardLayout}
                  icon={HiHome}
                  className={
                    NAVIGATION_PATH.dashboardLayout === currentPage
                      ? "bg-gray-100 dark:bg-gray-700"
                      : ""
                  }
                >
                  Startseite
                </Sidebar.Item>

                <Sidebar.Item
                  as={NavLink}
                  to={NAVIGATION_PATH.operationalOverview}
                  icon={FaRegWindowRestore}
                  className={
                    currentPage.includes(NAVIGATION_PATH.operationalOverview)
                      ? "bg-gray-100 dark:bg-gray-700"
                      : ""
                  }
                >
                  Betriebsübersicht
                </Sidebar.Item>
                <Sidebar.Item
                  as={NavLink}
                  to={NAVIGATION_PATH.heatingprograms}
                  icon={FaBuilding}
                  className={
                    currentPage.includes(NAVIGATION_PATH.heatingprograms)
                      ? "bg-gray-100 dark:bg-gray-700"
                      : ""
                  }
                >
                  Heizpläne
                </Sidebar.Item>
                <Sidebar.Item
                  as={NavLink}
                  to={NAVIGATION_PATH.deviceManagement}
                  icon={HiMiniCog6Tooth}
                  className={
                    currentPage.includes(NAVIGATION_PATH.deviceManagement)
                      ? "bg-gray-100 dark:bg-gray-700"
                      : ""
                  }
                >
                  Geräteverwaltung
                </Sidebar.Item>
              </Sidebar.ItemGroup>
            </Sidebar.Items>
          </div>
          <BottomMenu isCollapsed={isCollapsed} isHovered={isHovered} />
        </div>
      </Sidebar>
    </div>
  );
};

const BottomMenu = ({ isCollapsed, isHovered }) => {
  const [userDetails, setUserDetails] = useState({});

  const fetchUserDetails = () => {
    axios
      .get(ApiUrls.USER.PROFILE)
      .then((response) => {
        const data = response.data;
        setUserDetails(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  return (
    <div className="flex flex-col w-full">
       {STAGE === "dev" && (
        <CompactGetStartedCard isCollapsed={isCollapsed} isHovered={isHovered} />
      )}
      <div className="h-px bg-gray-200 my-1" />
      <div className="flex items-center justify-between w-full ">
        <img src={user.avatar} />
        <div
          className={classNames(" flex flex-col", {
            "hidden ": isCollapsed, // Hide button when sidebar is collapsed
            "!block ": isHovered && isCollapsed, // Hide button when sidebar is collapsed
          })}
        >
          <p className=" font-bold text-[#111928]">{userDetails.customer}</p>
          <p className=" text-xs text-[#6B7280]">{userDetails.email}</p>
        </div>
        <div
          className={classNames({
            "hidden ": isCollapsed, // Hide button when sidebar is collapsed
            "!block ": isHovered && isCollapsed, // Hide button when sidebar is collapsed
          })}
        >
          <OptionsDropdown />
        </div>
      </div>
    </div>
  );
};

const OptionsDropdown = () => {
  const { logout } = useAuth();
  const [isSignoutModalOpen, setIsSignoutModalOpen] = useState(false);

  const handleSignout = () => {
    logout();
  };
  return (
    <>
      <Dropdown
        arrowIcon={false}
        inline
        label={
          <span className="inline-flex justify-center p-1 text-gray-500 rounded cursor-pointer hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white">
            <span className="sr-only">Current User</span>
            <svg
              className="w-5 h-5 text-gray-800 dark:text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="4"
                d="M6 12h.01m6 0h.01m5.99 0h.01"
              />
            </svg>
          </span>
        }
      >
        <Dropdown.Item
          onClick={() => setIsSignoutModalOpen(true)}
          className="flex flex-row items-center justify-center gap-1"
        >
          <IoLogOut size={20} />
          Sign out
        </Dropdown.Item>
      </Dropdown>
      <ConfirmSignOutModal
        isSignoutModalOpen={isSignoutModalOpen}
        setIsSignoutModalOpen={setIsSignoutModalOpen}
        handleSignout={handleSignout}
      />
    </>
  );
};

const ConfirmSignOutModal = ({
  isSignoutModalOpen,
  setIsSignoutModalOpen,
  handleSignout,
}) => {
  return (
    <Modal
      show={isSignoutModalOpen}
      size="lg"
      onClose={() => setIsSignoutModalOpen(false)}
      popup
    >
      <Modal.Header />
      <Modal.Body>
        <div className="text-center">
          <IoLogOut size={30} className="text-[#9CA3AF] mx-auto mb-4" />
          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            Möchten Sie sich wirklich ausloggen?
          </h3>
          <div className="flex justify-center gap-4">
            <Button color="gray" onClick={() => setIsSignoutModalOpen(false)}>
              Abbrechen
            </Button>
            <Button color="failure" onClick={handleSignout}>
              Ausloggen
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ExampleSidebar;
