import React from 'react'
import { 
  Brain, Target, BookOpen, TrendingUp, 
  CheckCircle, Users, Zap, Star 
} from 'lucide-react'
import { FaGithub, FaLinkedin } from "react-icons/fa"
import { MdEmail } from "react-icons/md"

function About() {
  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Analysis",
      description: "Upload your resume and get personalized interview questions tailored to your skills and experience"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Role-Specific Practice",
      description: "Practice interviews for your specific field - from software engineering to product management"
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Comprehensive Feedback",
      description: "Get detailed feedback on your answers with suggestions for improvement"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Progress Tracking",
      description: "Monitor your improvement over time with detailed analytics and performance metrics"
    }
  ]

  const benefits = [
    "Build confidence through realistic interview simulations",
    "Identify and strengthen weak areas in your responses", 
    "Practice with industry-standard interview formats",
    "Get instant feedback without scheduling with others",
    "Prepare for both technical and behavioral questions"
  ]

  return (
    <div className="bg-white">

      {/* Features Section */}
      <div className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Key Features</h2>
            <p className="text-xl text-gray-600">Everything you need for effective interview preparation</p>
            <p className="text-xl text-gray-600 leading-relaxed mt-4">
              InterviewBot is an AI-powered interview preparation platform that helps job seekers practice and improve their interview skills through personalized questions and intelligent feedback.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-600 rounded-lg text-white shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Use InterviewBot?</h2>
              <p className="text-xl text-gray-600 mb-8">
                Whether you're a student preparing for your first job or a professional looking to switch careers, InterviewBot adapts to your unique needs and helps you practice effectively.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-blue-600 rounded-2xl p-8 text-white">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Project Vision</h3>
                <p className="text-blue-100 mb-6">
                  InterviewBot is being developed as part of my BTech ECE journey at IIIT Una. The goal is to create an intelligent system that helps students and professionals prepare for interviews more effectively using AI technology.
                </p>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-blue-200 text-sm">
                    Currently in development - Building features step by step to create a comprehensive interview preparation platform
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Target Audience Section */}
      <div className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Who Can Benefit</h2>
            <p className="text-xl text-gray-600">InterviewBot is designed to help various types of job seekers</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">Students & Graduates</h3>
              <p className="text-gray-600">Perfect for college students and recent graduates preparing for their first job interviews</p>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <Zap className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">Career Switchers</h3>
              <p className="text-gray-600">Ideal for professionals transitioning to new fields who need targeted practice</p>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <Star className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">Working Professionals</h3>
              <p className="text-gray-600">Great for experienced professionals looking to refresh their interview skills</p>
            </div>
          </div>
        </div>
      </div>

      {/* Technology & Development */}
      <div className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Technology Stack</h2>
            <p className="text-xl text-gray-600">Built with modern technologies for optimal performance</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold">AI</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Artificial Intelligence</h3>
              <p className="text-gray-600 text-sm">Natural Language Processing for question generation</p>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">⚛️</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">React.js</h3>
              <p className="text-gray-600 text-sm">Modern frontend framework for user interface</p>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold">🗄️</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Database</h3>
              <p className="text-gray-600 text-sm">Secure storage for user data and progress</p>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-600 font-bold">🔒</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Security</h3>
              <p className="text-gray-600 text-sm">Data privacy and secure file handling</p>
            </div>
          </div>
        </div>
      </div>

      {/* About the Developer */}
      <div className="py-20 px-6 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Text Content */}
            <div>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  About the Developer
                </span>
              </h2>

              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Hi! I'm a BTech ECE student at <span className="font-semibold">IIIT Una</span>, passionate about
                combining <span className="text-blue-600 font-medium">artificial intelligence</span> with practical
                solutions that help people succeed in their careers.
              </p>

              <p className="text-gray-700 leading-relaxed mb-6">
                InterviewBot started as an idea to help fellow students and professionals prepare better for interviews.
                Having faced the challenges of preparation myself, I wanted to build a tool that provides
                personalized practice opportunities powered by AI.
              </p>

              <div className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-blue-500">
                <ul className="space-y-3 text-gray-700">
                  <li>
                    <strong className="text-gray-900">🎓 Academic Focus:</strong> Electronics & Communication Engineering at IIIT Una
                  </li>
                  <li>
                    <strong className="text-gray-900">🤖 Interest Areas:</strong> AI/ML, NLP, Software Development
                  </li>
                  <li>
                    <strong className="text-gray-900">🚀 Goal:</strong> Making interview preparation accessible and effective for everyone
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white shadow-xl rounded-2xl p-8 flex flex-col gap-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">📬 Get in Touch</h3>
              <p className="text-gray-600 mb-4">I’d love to connect! Reach out via:</p>

              <div className="space-y-4">
                <a href="mailto:himanshu.iiitu2027@gmail.com" className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition">
                  <MdEmail size={24} />
                  himanshu.iiitu2027@gmail.com
                </a>

                <a href="https://www.linkedin.com/in/himanshu-singh23226/" target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition">
                  <FaLinkedin size={24} />
                  linkedin.com/in/himanshu-singh23226
                </a>

                <a href="https://github.com/Himanshu0518" target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition">
                  <FaGithub size={24} />
                  github.com/Himanshu0518
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  )
}

export default About
