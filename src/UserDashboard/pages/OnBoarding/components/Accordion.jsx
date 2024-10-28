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
          <h3 className="text-base font-medium text-gray-900">{title}</h3>
          <span className="ml-6 flex-shrink-0">
            {isOpen ? (
              <FaChevronUp className="h-3 w-3 text-gray-900" />
            ) : (
              <FaChevronDown className="h-3 w-3 text-gray-900" />
            )}
          </span>
        </div>
      </div>
      {isOpen && (
        <div className="py-0 !pt-0 px-3 bg-gray-50">
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
