import { useEffect, useState } from "react";
import { FaFilter } from "react-icons/fa6";
import OverviewCard from "./components/OverviewCard";
import { Spinner } from "flowbite-react";
import { useHeatingSchedule } from "../../../hooks/HeatingScheduleContext";

function OverviewPage() {
	const [data, setData] = useState([]);
	const token = localStorage.getItem("token");
	const [searchTerm, setSearchTerm] = useState("");
	const [Loader, setLoader] = useState(true);
	const { setCreatedHeatingScheduleNames } = useHeatingSchedule()

	const fetchAll = () => {
		fetch(
			`https://api-dev.blue-nodes.app/dev/smartheating/operationaloverview/list`,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		)
			.then((response) => response.json())
			.then((data) => {
				setData(data);
				setLoader(false);
			})
			.catch((error) => console.error("Error:", error));
	}

	const fetchAllHeatingSchedules = () => {
		fetch(
			"https://api-dev.blue-nodes.app/dev/smartheating/heatingschedule/list",
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		)
			.then((response) => response.json())
			.then((data) => {
				const templateNames = data.length > 0 ? data.map((template, index) => {
					return template.templateName
				}) : []
				setCreatedHeatingScheduleNames(templateNames)
			})
			.catch((error) => console.error("Error:", error));
	}

	useEffect(() => {
		fetchAll()
		fetchAllHeatingSchedules()
	}, []);

	const filteredData = data.filter((item) =>
		item.name.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	return (
		<>
			<div className="flex flex-col gap-6 ">
				<h2 className="text-[24px] text-gray-900">Operational Overview</h2>
				<div className=" flex items-center justify-between">
					<div className=" flex gap-4 items-center">
						<form className="w-[380px] ">
							<label
								htmlFor="default-search"
								className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
							>
								Search
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
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
									className="block  w-full p-4 px-4 ps-10 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary"
									placeholder="Search building"
									required
								/>
							</div>
						</form>
						{/* <div className=" flex items-center justify-center gap-1.5 text-[#6B7280] cursor-pointer">
							<FaFilter />
							<p className=" text-sm">Filter</p>
						</div> */}
					</div>
				</div>
				{Loader && (
					<div className="w-full flex flex-col justify-center items-center">
						<Spinner aria-label="Extra large spinner example" size="xl" />
					</div>
				)}
				{filteredData.map((item) => (
					<OverviewCard key={item.id} formData={item} />
				))}
			</div>
		</>
	);
}

export default OverviewPage;
