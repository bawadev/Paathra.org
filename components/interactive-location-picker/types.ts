export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface InteractiveLocationPickerProps {
  initialLocation?: Location | null;
  onLocationSelect: (location: Location) => void;
  height?: string;
  searchPlaceholder?: string;
  showSearchBar?: boolean;
  className?: string;
}

export interface MapSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export interface LocationMarkerProps {
  position: [number, number];
  isDragging?: boolean;
}