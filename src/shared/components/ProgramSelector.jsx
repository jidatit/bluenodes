const ProgramSelector = ({
  label, // Label for the select element
  placeholder, // Placeholder for the default option
  errorMessage, // Error message for validation
  data, // List of programs
  selectedProgram, // Currently selected program
  handleProgramChange, // Function to handle the program change
  showError, // Error flag to show error message
  disabledProgramId, // ID of the program that should be disabled
  componentType, // To conditionally render based on 'edit' or 'assign'
}) => {
  return (
    <div className="w-full flex flex-col md:flex-row justify-start items-start md:items-center gap-4">
      <div className="flex flex-col justify-start items-start w-full md:w-1/3">
        <label
          htmlFor="program"
          className={`mb-2 text-sm pt-3 font-semibold ${
            showError ? "text-red-500" : "text-gray-700"
          }`}
        >
          {label}
        </label>
        <select
          id="program"
          required
          className="mt-1.5 w-full rounded-lg border-gray-300 text-gray-700 sm:text-sm"
          value={selectedProgram}
          onChange={handleProgramChange}
        >
          <option value="">{placeholder}</option>
          {data.map((program) => (
            <option
              key={program.id}
              value={program.id}
              className={`block rounded-lg px-4 py-2 text-sm ${
                program.id === disabledProgramId
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "hover:bg-blue-100 hover:text-blue-700"
              }`}
              disabled={program.id === disabledProgramId}
            >
              {program.templateName.length > 50
                ? `${program.templateName.slice(0, 50)}...`
                : program.templateName}
            </option>
          ))}
        </select>

        {showError && (
          <p className="mt-1 text-sm text-red-500">{errorMessage}</p>
        )}
      </div>
    </div>
  );
};

export default ProgramSelector;
