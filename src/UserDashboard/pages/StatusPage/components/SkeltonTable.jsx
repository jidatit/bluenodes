import React from "react";

const SkeletonTable = () => {
  // Array of skeleton rows to be rendered
  const rows = [...Array(5)]; // Adjust the number of rows as needed

  return (
    <tbody>
      {rows.map((_, index) => (
        <tr
          key={index}
          className="text-sm bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          {/* Skeleton for ID */}
          <td className="px-4 py-4 w-[9%]">
            <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-4 w-16 rounded"></div>
          </td>

          {/* Skeleton for Room Name */}
          <td className="px-4 py-4 w-[15%]">
            <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-4 w-24 rounded"></div>
          </td>

          {/* Skeleton for Building Floor String */}
          <td className="px-4 py-4 w-[16%]">
            <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-4 w-32 rounded"></div>
            <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-4 w-24 mt-2 rounded"></div>
          </td>

          {/* Skeleton for Created At */}
          <td className="px-4 py-4 w-[13%]">
            <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-4 w-20 rounded"></div>
          </td>

          {/* Skeleton for Event Type */}
          <td className="px-4 py-4 w-[15%]">
            <div className="flex items-center gap-x-2">
              <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-4 w-4 rounded-full"></div>
              <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-4 w-24 rounded"></div>
            </div>
          </td>

          {/* Skeleton for Message */}
          <td className="px-4 py-4 w-[26%]">
            <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-4 w-full rounded"></div>
          </td>
        </tr>
      ))}
    </tbody>
  );
};

export default SkeletonTable;
