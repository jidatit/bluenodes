const ProgramSelector = ({
  label, // Label for the select element
  placeholder, // Placeholder for the default option
  errorMessage, // Error message for validation
  data, // List of programs
  room,
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
          value="Program"
          className={`mb-2 text-sm pt-3 font-semibold ${
            showError ? "text-red-500" : "text-gray-700"
          }`}
        >
          {" "}
        </label>

        {componentType === "edit" ? (
          <select
            id="program"
            required
            className={` mt-1.5 w-full rounded-lg border-gray-300 text-gray-700 sm:text-sm`}
            value={selectedProgram}
            onChange={handleProgramChange}
          >
            <option value="">Heizplan auswählen</option>
            {data.map((program) => (
              <option key={program.id} value={program.id}>
                {program.templateName.length > 50
                  ? `${program.templateName.slice(0, 50)}...`
                  : program.templateName}
              </option>
            ))}
          </select>
        ) : (
          <select
            id="program"
            required
            className={` mt-1.5 w-full rounded-lg border-gray-300 text-gray-700 sm:text-sm`}
            value={selectedProgram}
            onChange={handleProgramChange}
          >
            <option value="">Heizplan auswählen</option>
            {data.map((program) => (
              <option
                className={`block rounded-lg px-4 py-2 text-sm ${
                  program.id === room
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "hover:bg-blue-100 hover:text-blue-700"
                }`}
                key={program.id}
                value={program.id}
                disabled={program.id === room}
              >
                {program.templateName.length > 50
                  ? `${program.templateName.slice(0, 50)}...`
                  : program.templateName}
              </option>
            ))}
          </select>
        )}

        {showError && (
          <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
        )}
      </div>
    </div>
  );
};

export default ProgramSelector;
