// components/icons/ElectricGuitarIcon.tsx
import React from "react";

const ElectricGuitarIcon = ({ className = "" }: { className?: string }) => (
  <img
    src="/guitar.png" // Asegúrate del nombre exacto
    alt="Guitarra eléctrica"
    className={`h-8 w-8 ${className}`}
  />
);

export default ElectricGuitarIcon;
