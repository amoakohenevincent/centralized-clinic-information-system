import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer id="contact" className="bg-slate-50 border-t border-slate-200 pt-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          
          {/* Brand & Mission (Col 1) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-xs">
                MW
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-slate-900 block leading-none">
                  MediWell
                </span>
                <span className="text-[10px] font-bold tracking-widest text-teal-700 uppercase">
                  Pharma & Clinic
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 max-w-sm leading-relaxed">
              Committed to a healthier tomorrow through innovation, care, and trusted medicine.
            </p>

            {/* Social Text Links */}
            <div className="flex items-center gap-2 pt-1 text-xs font-bold text-teal-700">
              <a href="#facebook" className="hover:underline">Facebook</a>
              <span className="text-slate-300">•</span>
              <a href="#twitter" className="hover:underline">Twitter</a>
              <span className="text-slate-300">•</span>
              <a href="#linkedin" className="hover:underline">LinkedIn</a>
              <span className="text-slate-300">•</span>
              <a href="#instagram" className="hover:underline">Instagram</a>
            </div>
          </div>

          {/* Quick Links (Col 2) */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-sm text-slate-900 mb-3">Quick Links</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              <li><a href="#home" className="hover:text-teal-700 transition-colors">Home</a></li>
              <li><a href="#about" className="hover:text-teal-700 transition-colors">About Us</a></li>
              <li><a href="#services" className="hover:text-teal-700 transition-colors">Our Services</a></li>
              <li><Link to="/prescriptions/catalogue" className="hover:text-teal-700 transition-colors">Products</Link></li>
              <li><a href="#contact" className="hover:text-teal-700 transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Our Services (Col 3) */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-sm text-slate-900 mb-3">Our Services</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              <li><Link to="/prescriptions/catalogue" className="hover:text-teal-700 transition-colors">Pharmacy</Link></li>
              <li><a href="#services" className="hover:text-teal-700 transition-colors">Cardiology</a></li>
              <li><a href="#services" className="hover:text-teal-700 transition-colors">Neurology</a></li>
              <li><a href="#services" className="hover:text-teal-700 transition-colors">Lab Tests</a></li>
              <li><a href="#services" className="hover:text-teal-700 transition-colors">Pediatrics</a></li>
            </ul>
          </div>

          {/* Support (Col 4) */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-sm text-slate-900 mb-3">Support</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              <li><a href="#help" className="hover:text-teal-700 transition-colors">Help Center</a></li>
              <li><a href="#faqs" className="hover:text-teal-700 transition-colors">FAQs</a></li>
              <li><a href="#privacy" className="hover:text-teal-700 transition-colors">Privacy Policy</a></li>
              <li><a href="#terms" className="hover:text-teal-700 transition-colors">Terms & Conditions</a></li>
              <li><a href="#sitemap" className="hover:text-teal-700 transition-colors">Sitemap</a></li>
            </ul>
          </div>

          {/* Contact Us (Col 5) */}
          <div className="lg:col-span-2 space-y-2 text-xs text-slate-600">
            <h4 className="font-bold text-sm text-slate-900 mb-3">Contact Us</h4>
            <p>123 HealthCare Street, New York, USA 10001</p>
            <p className="font-semibold text-slate-900">+1 234 567 8900</p>
            <p className="text-teal-700 truncate">info@mediwellpharma.com</p>
          </div>

        </div>
      </div>

      {/* Bottom Copyright Strip */}
      <div className="bg-slate-900 text-slate-400 py-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs">
          <p>© 2024 MediWell Pharma. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
