import { useEffect, useState } from "react";
import OverviewCard from "./components/OverviewCard";
import { Spinner } from "flowbite-react";
import axios from "axios";
import ApiUrls from "../../../globals/apiURL.js";

function OverviewPage() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [Loader, setLoader] = useState(true);

  const fetchAll = () => {
    axios
      .get(ApiUrls.SMARTHEATING_OPERATIONALVIEW.LIST)
      .then((response) => response.data)
      .then((data) => {
        setData(data);
        setLoader(false);
      })
      .catch((error) => console.error("Error:", error));
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filteredData = data?.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex flex-col gap-6 ">
        <h2 className="text-[24px] text-gray-900">Operational Overview</h2>
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-4 ">
            <form className="w-[380px] ">
              <label
                htmlFor="default-search"
                className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
              >
                Suche
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-4">
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                </div>
                <input
                  type="search"
                  id="default-search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full p-4 px-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg ps-10 bg-gray-50 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary"
                  placeholder="Gebäude suchen"
                  required
                />
              </div>
            </form>
            {/* <div className=" flex items-center justify-center gap-1.5 text-[#6B7280] cursor-pointer">
							<FaFilter />
							<p className="text-sm ">Filter</p>
						</div> */}
          </div>
        </div>
        {Loader && (
          <div className="flex flex-col items-center justify-center w-full">
            <Spinner aria-label="Extra large spinner example" size="xl" />
          </div>
        )}
        {filteredData?.map((item) => (
          <OverviewCard key={item.id} formData={item} />
        ))}
      </div>
    </>
  );
}

export default OverviewPage;
