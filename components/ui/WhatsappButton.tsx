import Link from 'next/link';
import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppButton = () => {
  return (
    <Link
      href="https://wa.link/h899dk"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="
        fixed bottom-6 right-6 z-50 
        flex items-center justify-center 
        w-14 h-14 
        bg-[#25D366] text-white 
        rounded-full shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] 
        hover:scale-110 hover:shadow-[0_6px_20px_rgba(37,211,102,0.23)] 
        transition-all duration-300 ease-in-out
      "
    >
      <FaWhatsapp size={32} />
      
      <span className="absolute top-0 right-0 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
      </span>
    </Link>
  );
};

export default WhatsAppButton;