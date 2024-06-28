/* eslint-disable react/prop-types */

const ProgressStepper = ({ currentStep }) => {
  return (
    <div className="flex space-x-2">
      <div className={`rounded-full transition-all duration-300 ${currentStep === 1 ? 'bg-primary w-9 h-3' : 'bg-[#E5E7EB] w-4 h-3'}`}></div>
      <div className={`rounded-full transition-all duration-300 ${currentStep === 2 ? 'bg-primary w-9 h-3' : 'bg-[#E5E7EB] w-4 h-3'}`}></div>
      <div className={`rounded-full transition-all duration-300 ${currentStep === 3 ? 'bg-primary w-9 h-3' : 'bg-[#E5E7EB] w-4 h-3'}`}></div>
    </div>
  );
};

export default ProgressStepper;
