// HomeGuideCard.jsx
import React from 'react'
import { ArrowRight } from 'lucide-react'

function GuideCard({ name, description, index, arrow = true }) {
  return (
    <div className="relative flex-shrink-0 w-80 h-80"> {/* fixed size */}
      <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl p-8 border border-gray-100 transition-all duration-300 hover:-translate-y-2 h-full flex flex-col justify-between">
        
        {/* Step Number */}
        <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6 mx-auto shadow-md">
          <span className="text-2xl font-bold text-white">{index}</span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
          {name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-center leading-relaxed flex-grow">
          {description}
        </p>
      </div>

      {/* Arrow between cards */}
      {arrow && (
        <ArrowRight className="hidden md:block absolute top-1/2 -right-10 w-12 h-8 text-blue-500 transform -translate-y-1/2 drop-shadow-md transition-all duration-300" />
      )}
    </div>
  )
}

export default GuideCard
