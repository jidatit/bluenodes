import React from "react";

const SkeletonErrorTable = () => {
  const rows = [...Array(5)]; // Number of skeleton rows

  return (
    <tbody>
      {rows.map((_, index) => (
        <tr
          key={index}
          className="text-sm bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          {/* Skeleton for Room Name */}
          <td className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
            <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-4 w-32 rounded"></div>
          </td>

          {/* Skeleton for Building Floor String */}
          <td className="px-4 py-4">
            <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-4 w-24 rounded"></div>
          </td>

          {/* Skeleton for Created At */}
          <td className="px-4 py-4">
            <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-4 w-32 rounded"></div>
          </td>

          {/* Skeleton for Event Type and Message */}
          <td className="px-4 py-4">
            <div className="flex items-center gap-x-2">
              <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-4 w-4 rounded"></div>
              <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-4 w-20 rounded"></div>
            </div>
          </td>

          {/* Skeleton for Tooltip Message */}
          <td className="px-4 py-4">
            <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-4 w-40 rounded"></div>
          </td>
        </tr>
      ))}
    </tbody>
  );
};

export default SkeletonErrorTable;
