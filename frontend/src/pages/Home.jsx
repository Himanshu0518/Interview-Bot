import React from 'react'
import { ArrowRight } from 'lucide-react'
import PracticeButton from '../components/PracticeButton'
function Home() {
  return (
    <div className="p-4">

           <div className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How InterviewBot Works</h2>
            <p className="text-xl text-gray-600">Three simple steps to better interview preparation</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6 mx-auto">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Upload Resume</h3>
                <p className="text-gray-600 text-center">Upload your resume and let our AI analyze your skills, experience, and background</p>
              </div>
              <ArrowRight className="hidden md:block absolute top-1/2 -right-4 w-8 h-8 text-blue-500 transform -translate-y-1/2" />
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6 mx-auto">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Practice Interviews</h3>
                <p className="text-gray-600 text-center">Answer personalized questions generated specifically for your background and target roles</p>
              </div>
              <ArrowRight className="hidden md:block absolute top-1/2 -right-4 w-8 h-8 text-blue-500 transform -translate-y-1/2" />
            </div>
            
            <div>
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6 mx-auto">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Get Feedback</h3>
                <p className="text-gray-600 text-center">Receive detailed feedback and improvement suggestions to enhance your interview performance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

         <div className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-gray-900">Ready to Boost Your Interview Confidence?</h2>
          <p className="text-xl text-gray-600 mb-10">
            Start practicing now and increase your chances of landing your dream job
          </p>
           <PracticeButton />
        </div>
      </div>
  
        
    </div>
  )
}

export default Home
