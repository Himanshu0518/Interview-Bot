import React from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa"
import { MdEmail } from "react-icons/md"

function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-6">
      <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Brand / About */}
        <div>
          <h2 className="text-xl font-bold text-white">Interview Bot</h2>
          <p className="mt-3 text-sm">
            AI-powered interview preparation platform built with modern technologies.
            Practice, learn, and ace your interviews with confidence.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white">Quick Links</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href="#about" className="hover:text-white">About</a></li>
            <li><a href="#services" className="hover:text-white">Services</a></li>
            <li><a href="#contact" className="hover:text-white">Contact</a></li>
            <li><a href="#faq" className="hover:text-white">FAQ</a></li>
          </ul>
        </div>

        {/* Developers */}
        <div>
          <h3 className="text-lg font-semibold text-white">Developers</h3>
          
          {/* Himanshu */}
          <div className="mt-3">
            <p className="text-sm font-medium text-white">Himanshu Singh</p>
            <div className="flex mt-2 space-x-3">
              <a href="https://github.com/Himanshu0518" target="_blank" rel="noreferrer" className="hover:text-white" title="Himanshu's GitHub">
                <FaGithub size={18} />
              </a>
              <a href="https://www.linkedin.com/in/himanshu-singh23226/" target="_blank" rel="noreferrer" className="hover:text-white" title="Himanshu's LinkedIn">
                <FaLinkedin size={18} />
              </a>
              <a href="mailto:himanshu.iiitu2027@gmail.com" className="hover:text-white" title="Email Himanshu">
                <MdEmail size={18} />
              </a>
            </div>
          </div>

          {/* Abhishek */}
          <div className="mt-4">
            <p className="text-sm font-medium text-white">Kumar Abhishek</p>
            <div className="flex mt-2 space-x-3">
              <a href="https://github.com/kumarAbhishek2004" target="_blank" rel="noreferrer" className="hover:text-white" title="Abhishek's GitHub">
                <FaGithub size={18} />
              </a>
              <a href="https://linkedin.com/in/kumar-abhishek-6b5828288" target="_blank" rel="noreferrer" className="hover:text-white" title="Abhishek's LinkedIn">
                <FaLinkedin size={18} />
              </a>
              <a href="mailto:abhishek.kr0418@gmail.com" className="hover:text-white" title="Email Abhishek">
                <MdEmail size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm">
        © {new Date().getFullYear()} Interview Bot. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;