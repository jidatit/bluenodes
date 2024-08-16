const SkeletonLoader = () => {
	return (
		<div className="w-full animate-pulse flex flex-col gap-4">
			<div className="h-6 bg-gray-300 rounded w-1/4 mb-2"></div>
			<div className="relative w-full overflow-x-auto bg-white shadow-md sm:rounded-lg">
				<div className="flex flex-col my-2 mx-2 space-y-4">
					<div className="h-10 bg-gray-200 rounded w-1/3"></div>
					<div className="h-10 bg-gray-200 rounded w-1/2"></div>
				</div>
				<table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
					<thead className="text-xs font-semibold text-gray-500 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
						<tr>
							<th className="p-4">
								<div className="h-4 bg-gray-200 rounded w-16"></div>
							</th>
							<th className="p-4">
								<div className="h-4 bg-gray-200 rounded w-32"></div>
							</th>
							<th className="p-4">
								<div className="h-4 bg-gray-200 rounded w-20"></div>
							</th>
							<th className="p-4">
								<div className="h-4 bg-gray-200 rounded w-24"></div>
							</th>
							<th className="p-4">
								<div className="h-4 bg-gray-200 rounded w-16"></div>
							</th>
						</tr>
					</thead>
					<tbody>
						{Array.from({ length: 10 }).map((_, index) => (
							<tr
								key={index}
								className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
							>
								<td className="px-4 py-4">
									<div className="h-4 bg-gray-200 rounded w-24"></div>
								</td>
								<td className="px-4 py-4">
									<div className="h-4 bg-gray-200 rounded w-32"></div>
								</td>
								<td className="px-4 py-4">
									<div className="h-4 bg-gray-200 rounded w-28"></div>
								</td>
								<td className="px-4 py-4">
									<div className="h-4 bg-gray-200 rounded w-20"></div>
								</td>
								<td className="px-4 py-4">
									<div className="h-4 bg-gray-200 rounded w-16"></div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default SkeletonLoader;
