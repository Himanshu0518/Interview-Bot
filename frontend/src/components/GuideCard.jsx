// HomeGuideCard.jsx
import React from 'react';
import { ArrowRight } from 'lucide-react';

function GuideCard({ name, description, index, arrow = true, image }) {
  return (
    <div className="relative flex-shrink-0 w-80 h-96">
      
      {/* Card */}
      <div 
        className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col justify-end"
        style={{
          backgroundImage: image ? `url(${image})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 dark:bg-black/50"></div>

        {/* Content */}
        <div className="relative p-6 flex flex-col justify-end h-full text-center">
          
          {/* Step Number */}
          <div className="absolute top-4 left-4 bg-blue-600 dark:bg-blue-500 text-white font-bold w-10 h-10 flex items-center justify-center rounded-full shadow-md">
            {index}
          </div>

          {/* Text Container */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-xl p-4 shadow-md">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{name}</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{description}</p>
          </div>
        </div>
      </div>

      {/* Arrow between cards */}
      {arrow && (
        <ArrowRight className="hidden md:block absolute top-1/2 -right-10 w-12 h-8 text-blue-500 dark:text-blue-400 transform -translate-y-1/2 drop-shadow-md transition-all duration-300" />
      )}
    </div>
  );
}

export default GuideCard;
