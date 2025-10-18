// components/icons/ElectricGuitarIcon.tsx
import React from "react";

const ElectricGuitarIcon = ({ className = "" }: { className?: string }) => (
  <img
    src="https://res.cloudinary.com/ddfojw7jj/image/upload/c_fill,w_64,h_64,q_auto,f_auto/v1760749223/guitar_gp3kug.png
" // Asegúrate del nombre exacto
    alt="Guitarra eléctrica"
    className={`h-8 w-8 ${className}`}
  />
);

export default ElectricGuitarIcon;
