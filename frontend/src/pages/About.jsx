import React from 'react'
import { 
  Users, Zap, Star 
} from 'lucide-react'
import { FaGithub, FaLinkedin } from "react-icons/fa"
import { MdEmail } from "react-icons/md"
import PracticeButton from '../components/PracticeButton'
import Marquee from "react-fast-marquee";

function About() {
  const techs = [
    { label: "LangGraph", desc: "Powered AI chatbot for intelligent interviews", color: "blue" },
    { label: "React.js", desc: "Modern UI framework for a seamless experience", color: "green" },
    { label: "MongoDB", desc: "Secure database to store progress & results", color: "purple" },
    { label: "Security", desc: "Privacy-first design for safe interview practice", color: "red" },
  ];

  const developers = [
    {
      name: "Himanshu Singh",
      role: "Full Stack Developer",
      education: "BTech ECE @ IIIT Una",
      interests: "AI/ML, Web Development",
      email: "himanshu.iiitu2027@gmail.com",
      linkedin: "https://www.linkedin.com/in/himanshu-singh23226/",
      github: "https://github.com/Himanshu0518"
    },
    {
      name: "Kumar Abhishek",
      role: "ML Engineer",
      education: "BTech ECE @ IIIT Una",
      interests: "AI/ML, GenAI, Web Development",
      email: "abhishek.kr0418@gmail.com",
      linkedin: "https://linkedin.com/in/kumar-abhishek-6b5828288",
      github: "https://github.com/kumarAbhishek2004"
    }
  ];

  return (
    <div className="bg-gradient-to-b from-white via-gray-50 to-blue-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-950">
      
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto py-16 text-center px-6">
        <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-6">
          Welcome to InterviewBot
        </h1>
        <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
          Everything you need for effective interview preparation .  
          InterviewBot helps job seekers practice and improve their skills 
          with <span className="font-semibold text-blue-600 dark:text-blue-400">personalized AI-driven questions</span> and instant feedback.
        </p>
      </div>

      {/* Target Audience Section */}
      <div className="py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Who Can Benefit</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-12">
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
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition transform hover:-translate-y-2"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technology Section */}
      <div className="py-16 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Technology Stack
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-12">
            Built with modern technologies for speed, scalability, and performance
          </p>

          {/* Marquee Section */}
          <Marquee gradient={false} speed={60} pauseOnHover>
            {techs.map((tech, i) => (
              <div
                key={i}
                className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow hover:shadow-xl transition w-64 mx-4"
              >
                <div
                  className={`w-14 h-14 mx-auto mb-4 flex items-center justify-center rounded-full bg-${tech.color}-100 dark:bg-${tech.color}-900`}
                >
                  <span
                    className={`text-${tech.color}-600 dark:text-${tech.color}-300 font-bold text-xl`}
                  >
                    {tech.label[0]}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  {tech.label}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {tech.desc}
                </p>
              </div>
            ))}
          </Marquee>
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

      {/* About Developers Section */}
      <div className="py-16 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Meet the Developers
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Built by passionate students from IIIT Una combining AI with real-world solutions
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {developers.map((dev, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    {dev.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{dev.name}</h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400">{dev.role}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm text-gray-700 dark:text-gray-300">
                  <p><strong>🎓 Education:</strong> {dev.education}</p>
                  <p><strong>💡 Interests:</strong> {dev.interests}</p>
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <a 
                    href={`mailto:${dev.email}`}
                    className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-800 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition shadow"
                    title="Email"
                  >
                    <MdEmail size={20} className="text-gray-700 dark:text-gray-300" />
                  </a>
                  <a 
                    href={dev.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-800 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition shadow"
                    title="LinkedIn"
                  >
                    <FaLinkedin size={20} className="text-gray-700 dark:text-gray-300" />
                  </a>
                  <a 
                    href={dev.github}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-800 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition shadow"
                    title="GitHub"
                  >
                    <FaGithub size={20} className="text-gray-700 dark:text-gray-300" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default About