import React from "react";

const SkeletonDeviceManagementTable = () => {
  return (
    <tbody>
      {[...Array(5)].map((_, index) => (
        <tr
          key={index}
          className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 animate-pulse"
        >
          <td className="px-4 py-4">
            <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
          </td>
          <td className="px-4 py-4">
            <div className="h-4 bg-gray-300 rounded w-32"></div>
          </td>
          <td className="px-4 py-4">
            <div className="h-4 bg-gray-300 rounded w-40"></div>
          </td>
          <td className="px-4 py-4">
            <div className="h-4 bg-gray-300 rounded w-28"></div>
          </td>
          <td className="px-4 py-4">
            <div className="h-4 bg-gray-300 rounded w-24"></div>
          </td>
          <td className="px-4 py-4">
            <div className="h-4 bg-gray-300 rounded w-24"></div>
          </td>
          <td className="px-4 py-4">
            <div className="h-4 bg-gray-300 rounded w-32"></div>
          </td>
          <td className="px-4 py-4">
            <div className="h-4 bg-gray-300 rounded w-20"></div>
          </td>
        </tr>
      ))}
    </tbody>
  );
};

export default SkeletonDeviceManagementTable;
