import React, { useState } from "react";

const CustomTabs = ({ tabs, defaultTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div>
      {/* Tab Headers */}
      <div className="flex items-center justify-start p-4">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => {
              if (!tab.disabled) {
                setActiveTab(index);
              }
            }}
            className={`px-4 py-3 rounded-md focus:outline-none transition-colors duration-300 text-sm font-medium
            ${
              activeTab === index
                ? "bg-primary text-white"
                : tab.disabled
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-500 hover:text-gray-700"
            }
          `}
            disabled={tab.disabled}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-2 p-2 ">{tabs[activeTab].content}</div>
    </div>
  );
};

export default CustomTabs;
