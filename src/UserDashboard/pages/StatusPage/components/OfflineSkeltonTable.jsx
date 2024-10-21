import React from "react";

const OfflineSkeletonTable = () => {
  const rows = [...Array(5)]; // Number of skeleton rows

  return (
    <tbody>
      {rows.map((_, index) => (
        <tr
          key={index}
          className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          {/* Skeleton for Device Name */}
          <td className="px-4 py-4">
            <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-4 w-32 rounded"></div>
          </td>

          {/* Skeleton for Device Type */}
          <td className="px-4 py-4">
            <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-4 w-24 rounded"></div>
          </td>

          {/* Skeleton for Building Floor String */}
          <td className="px-4 py-4">
            <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-4 w-32 rounded"></div>
          </td>

          {/* Skeleton for Room Name */}
          <td className="px-4 py-4">
            <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-4 w-28 rounded"></div>
          </td>

          {/* Skeleton for Last Seen */}
          <td className="px-4 py-4">
            <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-4 w-24 rounded"></div>
          </td>

          {/* Skeleton for Battery Level */}
          <td className="px-4 py-4">
            <div className="flex items-center gap-1">
              <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-4 w-4 rounded mr-2"></div>
              <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-4 w-16 rounded"></div>
            </div>
          </td>

          {/* Skeleton for Status */}
          <td className="px-4 py-4">
            <div className="flex items-center justify-center">
              <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-4 w-20 rounded flex items-center justify-center">
                <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-4 w-4 rounded"></div>
              </div>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  );
};

export default OfflineSkeletonTable;
