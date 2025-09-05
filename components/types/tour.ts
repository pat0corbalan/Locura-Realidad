interface Tour {
  title: string;
  description: string;
  destination: string;
  dates: string[];
  price: number;
  image: string;
  grupo?: string; // opcional si usas el campo grupo
}

interface TourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tour: Tour) => void;
  tour: Tour;
}

function TourModal({ isOpen, onClose, onSave, tour }: TourModalProps) {
  // ...
}
