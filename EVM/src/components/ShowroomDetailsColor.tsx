// Type for individual vehicle (minimal interface for color display)
type IndividualVehicle = {
  color: string;
};

interface ShowroomDetailsColorProps {
  selectedVehicle: IndividualVehicle;
}

export function ShowroomDetailsColor({ selectedVehicle }: ShowroomDetailsColorProps) {
  // Function to get color class based on color name
  const getColorClass = (color: string): string => {
    const colorLower = color.toLowerCase();
    
    if (colorLower.includes('đen') || colorLower.includes('black')) {
      return 'bg-black';
    } else if (colorLower.includes('trắng') || colorLower.includes('white')) {
      return 'bg-white';
    } else if (colorLower.includes('xám') || colorLower.includes('gray')) {
      return 'bg-gray-500';
    } else if (colorLower.includes('xanh') || colorLower.includes('blue')) {
      return 'bg-blue-500';
    } else if (colorLower.includes('đỏ') || colorLower.includes('red')) {
      return 'bg-red-500';
    }
    return 'bg-gray-300';
  };

  if (!selectedVehicle.color) {
    return null;
  }

  return (
    <div className="mb-6">
      <h4 className="font-medium mb-3">Màu sắc:</h4>
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 rounded-full border-2 border-border ${getColorClass(selectedVehicle.color)}`} />
        <span className="text-sm">{selectedVehicle.color}</span>
      </div>
    </div>
  );
}