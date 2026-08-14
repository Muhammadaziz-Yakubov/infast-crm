import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import EnrollmentModal from './EnrollmentModal';

const LandingLayout = ({ children, activeCourse = '' }) => {
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(activeCourse);

  const handleOpenEnrollment = (courseName = '') => {
    if (courseName) {
      setSelectedCourse(courseName);
    }
    setIsEnrollmentOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#FF6A00] selection:text-black overflow-x-hidden">
      <Navbar onOpenEnrollment={() => handleOpenEnrollment()} />
      <main className="relative z-10">
        {typeof children === 'function' ? children({ openEnrollment: handleOpenEnrollment }) : React.cloneElement(children, { openEnrollment: handleOpenEnrollment })}
      </main>
      <Footer onOpenEnrollment={() => handleOpenEnrollment()} />
      <EnrollmentModal
        isOpen={isEnrollmentOpen}
        onClose={() => setIsEnrollmentOpen(false)}
        defaultCourse={selectedCourse}
      />
    </div>
  );
};

export default LandingLayout;
