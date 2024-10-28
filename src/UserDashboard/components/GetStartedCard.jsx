import React, { useState } from "react";
import { Card, Progress } from "flowbite-react";
import { Link } from "react-router-dom";
import { NAVIGATION_PATH } from "../../globals/navPaths";
import VideoSVG from "./VideoSvg"; // No need to specify the extension if you use .jsx

const CompactGetStartedCard = ({ isCollapsed, isHovered }) => {
  const [progress, setProgress] = useState(25);
  const [isStarted, setIsStarted] = useState(false);

  const handleStart = () => {
    setIsStarted(true);
    // Simulating progress increase
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prevProgress + 25;
      });
    }, 1000);
  };

  if (isCollapsed && !isHovered) {
    return (
      <Link to={NAVIGATION_PATH.onboarding}>
        <div className="flex items-center mb-4 justify-center">
          <VideoSVG />
        </div>
      </Link>
    ); // Render SVG when sidebar is collapsed and not hovered
  }

  if (progress >= 100) {
    return (
      <Link to={NAVIGATION_PATH.onboarding}>
        <div className="flex items-center mb-4 justify-start ml-4">
          <VideoSVG />
          <span className="ml-2 text-base text-gray/900 font-semibold">
            Onboarding
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Card className="w-full bg-gray-50  shadow-none mb-4 border-0  ">
      <h6 className="text-lg font-medium font-inter text-black dark:text-white">
        Get Started
      </h6>
      <p className="text-sm font-normal font-inter text-[#6B7280] -mt-2  dark:text-gray-400 ">
        Watch quick videos to master your smart heating system.
      </p>
      <div className="flex justify-between items-center ">
        <span className="text-xs font-medium font-inter text-[#6B7280] dark:text-gray-300">
          Your Progress
        </span>
        <span className="text-xs font-medium text-[#6B7280] dark:text-gray-300">
          {progress}%
        </span>
      </div>
      <Progress
        progress={progress}
        size="sm"
        className="mb-2 -mt-3 text-primary-700 [&>div]:bg-[#0BAAC9]"
      />
      <Link to={NAVIGATION_PATH.onboarding}>
        <button
          onClick={handleStart}
          disabled={isStarted}
          className="w-full px-2 py-2 text-sm font-medium text-center text-gray-900 bg-[white] focus:bg-gray-100 rounded-lg hover:bg-gray-50 focus:outline-none border border-gray-200"
        >
          {isStarted ? "Onboarding..." : "Start onboarding"}
        </button>
      </Link>
    </Card>
  );
};

export default CompactGetStartedCard;
