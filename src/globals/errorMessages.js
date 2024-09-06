// errors.js
export const errorMessages = {
	allFieldsRequired: "Alle Felder sind erforderlich",
	missingSelectionOrInformation: "Auswahl oder Informationen fehlen",
	minTempInvalid: "Die Mindesttemperatur muss zwischen 10°C und 29°C liegen",
	maxTempInvalid: "Die Höchsttemperatur muss zwischen 11°C und 30°C liegen",
	maxTempLowerThanMinTemp:
		"Die Höchsttemperatur darf nicht niedriger als die Mindesttemperatur sein",
	successfulCreation: "Programm erfolgreich erstellt.",
	FailedCreation: "Erstellung des Programms fehlgeschlagen.",
	batteryLifeAlert: "Akkulaufzeit-Warnung",
	batteryLifeAlertMessage:
		"Wenn es mehr als 3 verschiedene Zeitpläne pro Tag gibt, ist dies nicht optimal für die Akkulaufzeit.",
	noRoomSelected: "Kein Raum wurde ausgewählt",
	roomSelectionMust: "Mindestens ein Raum muss ausgewählt werden.",
	roomAssignSuccessfull: "Räume erfolgreich zugewiesen.",
	roomAssignFailed: "Zuweisung der Räume fehlgeschlagen.",
	cloneSuccessfull: "Programm erfolgreich geklont.",
	cloneFailed: "Klonen des Programms fehlgeschlagen.",
	editSuccessfull: "Programm erfolgreich bearbeitet.",
	editFailed: "Bearbeitung des Programms fehlgeschlagen.",
	deleteFailed: "Löschen fehlgeschlagen.",
	deleteSuccessfull: "Erfolgreich gelöscht.",
	heatingScheduleEditedSuccessfull: "Heizplan erfolgreich bearbeitet",
	heatingScheduleEditedFailed: "Bearbeitung des Heizplans fehlgeschlagen",
	ProgramReplacedSuccessfully: "Programm erfolgreich ersetzt",
	ProgramReplacedFailed: "Ersetzung des Programms fehlgeschlagen",
	ProgramWithNameAlreadyCreated:
		"Ein Programm mit diesem Namen wurde bereits erstellt",
	PorgramAssignedSuccessfully: "Programm erfolgreich zugewiesen",
	PorgramAssignedFailed: "Zuweisung des Programms fehlgeschlagen",
	DeviceNameUpdatedSuccessfully: "Device Name Updated Successfully",
	DeviceNameUpdatedFailed: "Device Name Updated Failed",
};
