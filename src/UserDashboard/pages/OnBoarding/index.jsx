import React, { useState } from "react";
import { Progress, Button } from "flowbite-react";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa";
import { IoPlayCircleOutline } from "react-icons/io5";

import CheckIcon from "./components/CheckCircle";
import Accordion from "./components/Accordion"; // Import the custom Accordion component

const OnboardingStep = ({ title, completed, onClick }) => {
  return (
    <div
      className={`flex justify-between items-center px-2 py-2 rounded-md mb-2 cursor-pointer hover:bg-gray-100`}
      onClick={onClick}
    >
      <span>{title}</span>
      <CheckIcon checked={completed} />
    </div>
  );
};

const VideoPlayer = ({ videoSrc }) => (
  <div className="relative aspect-video rounded-lg overflow-hidden">
    <img
      src={videoSrc}
      alt="Video thumbnail"
      className="w-full h-full object-cover p-4"
    />
    <div className="absolute inset-0 flex items-center justify-center">
      <IoPlayCircleOutline className="w-16 h-16 text-black opacity-80" />
    </div>
  </div>
);

const Onboarding = () => {
  const sections = [
    {
      title: "Getting Started",
      steps: ["Introduction to BlueNodes", "Setting Up Your Account"],
    },
    {
      title: "Managing Your Devices",
      steps: [
        "Adding and Configuring Thermostats",
        "Scheduling and Automation",
      ],
    },
    {
      title: "Monitoring and Optimization",
      steps: [
        "Real-Time Monitoring and Insights",
        "Energy Savings and Reports",
      ],
    },
    {
      title: "Advanced Features and Support",
      steps: ["Advanced Customization Options", "Troubleshooting and Support"],
    },
  ];

  const videos = [
    "/api/placeholder/640/360",
    "/api/placeholder/640/360?2",
    "/api/placeholder/640/360?3",
    "/api/placeholder/640/360?4",
    "/api/placeholder/640/360?5",
    "/api/placeholder/640/360?6",
    "/api/placeholder/640/360?7",
    "/api/placeholder/640/360?8",
  ];

  const [progress, setProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState({});
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [openSectionIndex, setOpenSectionIndex] = useState(0);

  const allSteps = sections.flatMap((section) => section.steps);

  const handleStepComplete = () => {
    const currentStep = allSteps[currentStepIndex];
    setCompletedSteps((prev) => ({ ...prev, [currentStep]: true }));
    setProgress((prev) => Math.min(prev + 100 / allSteps.length, 100));

    // Increment current step index
    if (currentStepIndex < allSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }

    // Check if two steps are completed in the current section
    const currentSectionIndex = sections.findIndex((section) =>
      section.steps.includes(currentStep)
    );
    const completedInSection = sections[currentSectionIndex].steps.filter(
      (step) => completedSteps[step] || step === currentStep
    ).length;

    if (completedInSection === 2 && openSectionIndex < sections.length - 1) {
      setOpenSectionIndex((prev) => prev + 1);
    }
  };

  const accordionItems = sections.map((section) => ({
    title: section.title,
    content: (
      <div>
        {section.steps.map((step, stepIndex) => (
          <OnboardingStep
            key={stepIndex}
            title={step}
            completed={false}
            onClick={() => {}}
          />
        ))}
      </div>
    ),
  }));

  const [openIndices, setOpenIndices] = useState([]);

  const handleToggle = (index) => {
    setOpenIndices((prev) => {
      if (prev.includes(index)) {
        // If the index is already open, remove it (toggle close)
        return prev.filter((i) => i !== index);
      } else {
        // Otherwise, add it to the open indices (toggle open)
        return [...prev, index];
      }
    });
  };

  return (
    <div className="container mx-auto p-4 flex">
      <div className="w-1/3 pr-4">
        <h2 className="text-2xl font-bold mb-4">Onboarding</h2>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-base text-gray-900 font-medium">
              Your progress
            </span>
            <span className="text-gray-500 text-sm">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress progress={progress} color="cyan" size="md" />
        </div>
        <Accordion
          items={accordionItems}
          openIndices={openIndices}
          onItemClick={handleToggle}
        />
      </div>
      <div className="w-2/3 p-4 bg-white border-gray-200 rounded-lg">
        <VideoPlayer videoSrc={videos[currentStepIndex]} />
        <div className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <div className="text-primary text-xl font-semibold">
              {allSteps[currentStepIndex]}
            </div>
            <CheckIcon checked={completedSteps[allSteps[currentStepIndex]]} />
          </div>
          <div className="text-black text-xl font-semibold">
            {allSteps[currentStepIndex]}
          </div>
          <p className="text-gray-600 mt-2">
            Learn the basics of how BlueNodes can automate your heating system
            for maximum efficiency and comfort. Understand the key features that
            will help you save energy and reduce costs.
          </p>
          <div className="mt-4 mb-4">
            <div className="flex justify-between mt-4">
              <Button
                color="gray"
                disabled={currentStepIndex === 0}
                onClick={() => setCurrentStepIndex((prev) => prev - 1)}
              >
                <FaAngleLeft className="mr-2 h-5 w-5" />
                Previous
              </Button>
              <Button color="cyan" onClick={handleStepComplete}>
                Next
                <FaAngleRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
