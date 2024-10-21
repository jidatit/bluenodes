import React from "react";

const UnassignedSkeletonTable = () => {
  const rows = [...Array(5)]; // Number of skeleton rows

  return (
    <tbody>
      {rows.map((_, index) => (
        <tr
          key={index}
          className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          {/* Skeleton for Location ID */}
          <td className="px-4 py-4 w-[20%]">
            <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-4 w-24 rounded"></div>
          </td>

          {/* Skeleton for Name */}
          <td className="px-4 py-4 w-[30%]">
            <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-4 w-32 rounded"></div>
          </td>

          {/* Skeleton for Building Floor String */}
          <td className="px-4 py-4 w-[60%]">
            <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-4 w-32 rounded"></div>
          </td>

          {/* Skeleton for Action Button */}
          <td className="px-4 py-4">
            <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-6 w-40 rounded"></div>
          </td>
        </tr>
      ))}
    </tbody>
  );
};

export default UnassignedSkeletonTable;
