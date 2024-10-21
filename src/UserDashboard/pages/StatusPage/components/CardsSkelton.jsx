import React from "react";

const SkeletonLoader = () => {
  return (
    <div className="flex gap-4">
      {/* General Error Skeleton Loader */}
      <div className="w-1/3 bg-white flex p-6 gap-4 rounded-lg shadow-sm items-center justify-start animate-pulse">
        <div className="bg-gray-200 p-3 text-2xl rounded-lg h-10 w-10" />
        <div className="flex flex-col">
          <div className="bg-gray-200 h-4 w-16 rounded mb-2" />
          <div className="bg-gray-200 h-3 w-24 rounded" />
        </div>
      </div>

      <div className="w-1/3 bg-white flex p-6 gap-4 rounded-lg shadow-sm items-center justify-start animate-pulse">
        <div className="bg-gray-200 p-3 text-2xl rounded-lg h-10 w-10" />
        <div className="flex flex-col">
          <div className="bg-gray-200 h-4 w-16 rounded mb-2" />
          <div className="bg-gray-200 h-3 w-24 rounded" />
        </div>
      </div>

      <div className="w-1/3 bg-white flex p-6 gap-4 rounded-lg shadow-sm items-center justify-start animate-pulse">
        <div className="bg-gray-200 p-3 text-2xl rounded-lg h-10 w-10" />
        <div className="flex flex-col">
          <div className="bg-gray-200 h-4 w-16 rounded mb-2" />
          <div className="bg-gray-200 h-3 w-24 rounded" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
