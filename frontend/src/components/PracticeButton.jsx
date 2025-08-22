import React from 'react'
import {Brain, ArrowRight } from 'lucide-react'

function PracticeButton() {
  return (
    <>
        <button className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold text-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3 mx-auto">
            <Brain className="w-6 h-6" />
            Start Your Practice Journey
            <ArrowRight className="w-6 h-6" />
          </button>
    </>
  )
}

export default PracticeButton
