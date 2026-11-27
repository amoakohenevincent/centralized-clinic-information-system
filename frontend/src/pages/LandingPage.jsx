import React, { useState } from 'react';
import LandingNavbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import QuickActions from '../components/landing/QuickActions';
import ServicesSection from '../components/landing/ServicesSection';
import StatsBanner from '../components/landing/StatsBanner';
import WhyChooseUs from '../components/landing/WhyChooseUs';
import HealthTipsSection from '../components/landing/HealthTipsSection';
import PriorityBanner from '../components/landing/PriorityBanner';
import Footer from '../components/landing/Footer';
import BookingModal from '../components/landing/BookingModal';
import FindDoctorModal from '../components/landing/FindDoctorModal';

export default function LandingPage() {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [doctorModalOpen, setDoctorModalOpen] = useState(false);

  const handleOpenBooking = () => {
    setBookingModalOpen(true);
  };

  const handleOpenDoctors = () => {
    setDoctorModalOpen(true);
  };

  const handleBookWithDoctor = (doctor) => {
    setBookingModalOpen(true);
  };

  const handleServiceSelect = (serviceName) => {
    setBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 antialiased selection:bg-teal-500 selection:text-white">
      {/* 1. Header / Navbar */}
      <LandingNavbar onBookClick={handleOpenBooking} />

      {/* 2. Hero Section */}
      <HeroSection
        onExploreClick={() => {
          const el = document.getElementById('services');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onFindDoctorClick={handleOpenDoctors}
      />

      {/* 3. Floating Quick Action Bar */}
      <QuickActions
        onBookClick={handleOpenBooking}
        onFindDoctorClick={handleOpenDoctors}
      />

      {/* 4. Healthcare Services Section */}
      <ServicesSection onServiceSelect={handleServiceSelect} />

      {/* 5. Stats Ribbon Banner */}
      <StatsBanner />

      {/* 6. Why Choose Us & Emergency Card */}
      <WhyChooseUs
        onLearnMoreClick={() => {
          const el = document.getElementById('about');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onEmergencyCall={() => {
          window.location.href = 'tel:+233302123456';
        }}
      />

      {/* 7. Health Tips & News (Blog) */}
      <HealthTipsSection
        onArticleClick={(title) => {
          alert(`Reading article: "${title}". Stay tuned for more medical insights from MediWell!`);
        }}
      />

      {/* 8. Call To Action Ribbon */}
      <PriorityBanner onBookClick={handleOpenBooking} />

      {/* 9. Footer */}
      <Footer />

      {/* Interactive Modals */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
      />

      <FindDoctorModal
        isOpen={doctorModalOpen}
        onClose={() => setDoctorModalOpen(false)}
        onBookWithDoctor={handleBookWithDoctor}
      />
    </div>
  );
}

