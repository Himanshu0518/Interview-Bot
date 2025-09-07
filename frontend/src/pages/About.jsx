import React from 'react'
import { 
  Users, Zap, Star 
} from 'lucide-react'
import { FaGithub, FaLinkedin } from "react-icons/fa"
import { MdEmail } from "react-icons/md"
import PracticeButton from '../components/PracticeButton'

function About() {
  return (
    <div className="bg-gradient-to-b from-white via-gray-50 to-blue-50">
      
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto py-16 text-center px-6">
        <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-6">
          Welcome to InterviewBot
        </h1>
        <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
          Everything you need for effective interview preparation 🚀.  
          InterviewBot helps job seekers practice and improve their skills 
          with <span className="font-semibold text-blue-600">personalized AI-driven questions</span> and instant feedback.
        </p>
      </div>

      {/* Target Audience Section */}
      <div className="py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Who Can Benefit</h2>
          <p className="text-lg text-gray-600 mb-12">
            InterviewBot is designed to help various types of job seekers
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="w-10 h-10 text-blue-600" />,
                title: "Students & Graduates",
                desc: "Perfect for college students and freshers preparing for their first interviews."
              },
              {
                icon: <Zap className="w-10 h-10 text-blue-600" />,
                title: "Career Switchers",
                desc: "Ideal for professionals transitioning to new fields needing targeted practice."
              },
              {
                icon: <Star className="w-10 h-10 text-blue-600" />,
                title: "Working Professionals",
                desc: "Great for experienced professionals refreshing their interview skills."
              }
            ].map((item, i) => (
              <div 
                key={i} 
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition transform hover:-translate-y-2"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technology Section */}
      <div className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Technology Stack</h2>
          <p className="text-lg text-gray-600 mb-12">
            Built with modern technologies for speed, scalability, and performance
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: "Artificial Intelligence", desc: "LangChain-powered intelligent interview engine", color: "blue" },
              { label: "React.js", desc: "Modern UI framework for a seamless experience", color: "green" },
              { label: "MongoDB", desc: "Secure database to store progress & results", color: "purple" },
              { label: "Security", desc: "Privacy-first design for safe interview practice", color: "orange" }
            ].map((tech, i) => (
              <div key={i} className="bg-gray-50 p-6 rounded-2xl shadow hover:shadow-xl transition">
                <div className={`w-14 h-14 mx-auto mb-4 flex items-center justify-center rounded-full bg-${tech.color}-100`}>
                  <span className={`text-${tech.color}-600 font-bold text-xl`}>
                    {tech.label[0]}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{tech.label}</h3>
                <p className="text-sm text-gray-600">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
          Ready to Boost Your Interview Skills?
        </h2>
        <PracticeButton path={"/test_setup"}/>
           <div className="mt-4">
             <PracticeButton description={"Start Your Mock Interview"} path={"/mock_setup"}/>
           </div>
      </div>

      {/* About Developer Section */}
      <div className="py-16 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-6">
              About the Developer
            </h2>
            <p className="text-lg text-gray-700 mb-4">
              Hi! I'm <span className="font-semibold">Himanshu Singh</span>, a BTech ECE student at 
              <span className="font-semibold"> IIIT Una</span>, passionate about blending 
              <span className="text-blue-600 font-medium"> AI</span> with real-world solutions 
              to help people excel in their careers.
            </p>
            <p className="text-gray-700 mb-4">
              InterviewBot was born from my own challenges during interview prep.  
              I wanted to build a tool that provides personalized, AI-driven practice 
              to make preparation smarter and more effective.
            </p>
            <div className="bg-blue-50 p-5 rounded-xl border-l-4 border-blue-600">
              <ul className="space-y-2 text-gray-700">
                <li><strong>🎓 Academic:</strong> BTech in ECE @ IIIT Una</li>
                <li><strong>🤖 Interests:</strong> AI/ML, NLP, Software Development</li>
                <li><strong>🚀 Goal:</strong> Make interview prep accessible to everyone</li>
              </ul>
            </div>
          </div>

          <div className="bg-white shadow-xl rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">📬 Get in Touch</h3>
            <p className="text-gray-600 mb-4">Let's connect! Reach me here:</p>

            <a href="mailto:himanshu.iiitu2027@gmail.com" className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition">
              <MdEmail size={24} /> himanshu.iiitu2027@gmail.com
            </a>
            <a href="https://www.linkedin.com/in/himanshu-singh23226/" target="_blank" rel="noreferrer"
              className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition">
              <FaLinkedin size={24} /> linkedin.com/in/himanshu-singh23226
            </a>
            <a href="https://github.com/Himanshu0518" target="_blank" rel="noreferrer"
              className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition">
              <FaGithub size={24} /> github.com/Himanshu0518
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
