import React from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa"
import { MdEmail } from "react-icons/md"

function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-6 ">
      <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Brand / About */}
        <div>
          <h2 className="text-xl font-bold text-white">MyWebsite</h2>
          <p className="mt-3 text-sm">
            Building modern solutions with React & Tailwind.  
            Stay connected for updates and resources.
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

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold text-white">Follow Us</h3>
          <div className="flex mt-3 space-x-4">
            <a href="https://github.com/Himanshu0518" target="_blank" rel="noreferrer" className="hover:text-white">
              <FaGithub size={20} />
            </a>
            <a href="https://www.linkedin.com/in/himanshu-singh23226/" target="_blank" rel="noreferrer" className="hover:text-white">
              <FaLinkedin size={20} />
            </a>
           
            <a href="mailto:himanshu.iiitu2027@gmail.com" className="hover:text-white">
              <MdEmail size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm">
        © {new Date().getFullYear()} MyWebsite. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
