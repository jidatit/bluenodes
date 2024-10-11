export const processLocationData = (data) => {
  return {
    buildings: data?.map((building) => {
      // Calculate the total rooms in the building
      const totalRooms = building?.children.reduce(
        (sum, floor) => sum + floor.children.length,
        0
      );
      const buildingAssignedRooms = building?.children.reduce((sum, floor) => {
        // Iterate over each room in the floor and sum the assignedNumberOfRooms values
        const assignedNumberOfRoomsSum = floor.children.reduce(
          (floorSum, room) => {
            return floorSum + (room.assignedNumberOfRooms || 0);
          },
          0
        );
        return sum + assignedNumberOfRoomsSum;
      }, 0);

      return {
        id: building.id,
        name: building.name,
        roomsAssigned: buildingAssignedRooms,
        totalRooms: totalRooms,
        floors: building.children.map((floor) => ({
          id: floor.id,
          name: floor.name,
          roomsAssigned: floor.assignedNumberOfRooms,
          totalRooms: floor.children.length,
          rooms: floor.children.map((room) => ({
            id: room.id,
            name: room.name,
            type: room.type,
            algorithmOn: false,
            programAssigned: room.heatingSchedule
              ? room.heatingSchedule.templateName
              : null,
            currentTemperature: room.roomTemperature,
            assigned: false,
          })),
        })),
      };
    }),
  };
};
