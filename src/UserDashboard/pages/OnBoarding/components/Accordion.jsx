import React from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const AccordionItem = ({ title, children, isOpen, onToggle }) => {
  return (
    <div className="">
      <div
        className={`cursor-pointer transition-all duration-300 ease-in-out ${
          isOpen ? "bg-gray-50" : "hover:bg-gray-50"
        }`}
        onClick={onToggle}
      >
        <div className="flex justify-between items-center py-4 px-6">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <span className="ml-6 flex-shrink-0">
            {isOpen ? (
              <FaChevronUp className="h-5 w-5 text-gray-600" />
            ) : (
              <FaChevronDown className="h-5 w-5 text-gray-600" />
            )}
          </span>
        </div>
      </div>
      {isOpen && (
        <div className="py-4 !pt-0 px-3 bg-gray-50">
          <div className="prose max-w-none text-gray-700">{children}</div>
        </div>
      )}
    </div>
  );
};

const Accordion = ({ items, openIndices, onItemClick }) => {
  return (
    <div className="overflow-hidden">
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          title={item.title}
          isOpen={openIndices.includes(index)}
          onToggle={() => onItemClick(index)}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
};

export default Accordion;
