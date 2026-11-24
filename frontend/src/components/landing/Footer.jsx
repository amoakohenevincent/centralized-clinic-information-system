import React from 'react';
import { MapPin, Phone, Mail, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer id="contact" className="bg-slate-50 border-t border-slate-200/80 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Brand & Mission (Col 1) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z"/>
                </svg>
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-slate-900 block leading-none">
                  MediWell
                </span>
                <span className="text-[10px] font-bold tracking-widest text-teal-600 uppercase">
                  PHARMA & CLINIC
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">
              Committed to a healthier tomorrow through innovation, care, and trusted medicine.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a href="#facebook" className="w-9 h-9 rounded-full bg-white border border-slate-200 text-teal-600 hover:bg-teal-500 hover:text-white flex items-center justify-center transition-all shadow-2xs">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#twitter" className="w-9 h-9 rounded-full bg-white border border-slate-200 text-teal-600 hover:bg-teal-500 hover:text-white flex items-center justify-center transition-all shadow-2xs">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#linkedin" className="w-9 h-9 rounded-full bg-white border border-slate-200 text-teal-600 hover:bg-teal-500 hover:text-white flex items-center justify-center transition-all shadow-2xs">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#instagram" className="w-9 h-9 rounded-full bg-white border border-slate-200 text-teal-600 hover:bg-teal-500 hover:text-white flex items-center justify-center transition-all shadow-2xs">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links (Col 2) */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-sm text-slate-900 mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-500">
              <li><a href="#home" className="hover:text-teal-600 transition-colors">Home</a></li>
              <li><a href="#about" className="hover:text-teal-600 transition-colors">About Us</a></li>
              <li><a href="#services" className="hover:text-teal-600 transition-colors">Our Services</a></li>
              <li><Link to="/prescriptions/catalogue" className="hover:text-teal-600 transition-colors">Products</Link></li>
              <li><a href="#contact" className="hover:text-teal-600 transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Our Services (Col 3) */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-sm text-slate-900 mb-4">Our Services</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-500">
              <li><Link to="/prescriptions/catalogue" className="hover:text-teal-600 transition-colors">Pharmacy</Link></li>
              <li><a href="#services" className="hover:text-teal-600 transition-colors">Cardiology</a></li>
              <li><a href="#services" className="hover:text-teal-600 transition-colors">Neurology</a></li>
              <li><a href="#services" className="hover:text-teal-600 transition-colors">Lab Tests</a></li>
              <li><a href="#services" className="hover:text-teal-600 transition-colors">Pediatrics</a></li>
            </ul>
          </div>

          {/* Support (Col 4) */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-sm text-slate-900 mb-4">Support</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-500">
              <li><a href="#help" className="hover:text-teal-600 transition-colors">Help Center</a></li>
              <li><a href="#faqs" className="hover:text-teal-600 transition-colors">FAQs</a></li>
              <li><a href="#privacy" className="hover:text-teal-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#terms" className="hover:text-teal-600 transition-colors">Terms & Conditions</a></li>
              <li><a href="#sitemap" className="hover:text-teal-600 transition-colors">Sitemap</a></li>
            </ul>
          </div>

          {/* Contact Us (Col 5) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-bold text-sm text-slate-900 mb-4">Contact Us</h4>
            <div className="flex items-start gap-2.5 text-xs text-slate-500">
              <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span>123 HealthCare Street, New York, USA 10001</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-500">
              <Phone className="w-4 h-4 text-teal-600 shrink-0" />
              <span>+1 234 567 8900</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-500">
              <Mail className="w-4 h-4 text-teal-600 shrink-0" />
              <span className="truncate">info@mediwellpharma.com</span>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Copyright Strip */}
      <div className="bg-[#0b1c2d] text-slate-400 py-4 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs">
          <p>© 2024 MediWell Pharma. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}

