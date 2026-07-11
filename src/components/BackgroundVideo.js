import React from 'react';

const BackgroundVideo = () => {
  return (
    <>
      <div className="bg-animated">
        {/* جسيمات عائمة */}
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
        <div className="floating-shape shape-5"></div>
        <div className="floating-shape shape-6"></div>
        
        {/* دوائر متحركة */}
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>
      
      <style>{`
        .bg-animated {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: -2;
          overflow: hidden;
          background: linear-gradient(135deg, #0a0a2e 0%, #1a0a3e 25%, #0d1b3e 50%, #1a0a2e 75%, #0a0a2e 100%);
          background-size: 400% 400%;
          animation: bgMove 15s ease infinite;
        }
        
        [data-theme="light"] .bg-animated {
          background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 25%, #e0f2fe 50%, #fef3c7 75%, #f5f3ff 100%);
          background-size: 400% 400%;
        }
        
        @keyframes bgMove {
          0% { background-position: 0% 50%; }
          25% { background-position: 100% 0%; }
          50% { background-position: 100% 100%; }
          75% { background-position: 0% 100%; }
          100% { background-position: 0% 50%; }
        }
        
        /* أشكال عائمة */
        .floating-shape {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.6;
          animation: floatAround 20s infinite ease-in-out;
        }
        
        .shape-1 {
          width: 400px; height: 400px;
          background: rgba(139, 92, 246, 0.4);
          top: 10%; left: 10%;
          animation-delay: 0s;
        }
        
        .shape-2 {
          width: 300px; height: 300px;
          background: rgba(245, 158, 11, 0.35);
          top: 60%; right: 15%;
          animation-delay: 3s;
        }
        
        .shape-3 {
          width: 350px; height: 350px;
          background: rgba(16, 185, 129, 0.35);
          bottom: 10%; left: 30%;
          animation-delay: 6s;
        }
        
        .shape-4 {
          width: 250px; height: 250px;
          background: rgba(219, 39, 119, 0.3);
          top: 40%; right: 40%;
          animation-delay: 9s;
        }
        
        .shape-5 {
          width: 280px; height: 280px;
          background: rgba(37, 99, 235, 0.35);
          top: 20%; right: 10%;
          animation-delay: 12s;
        }
        
        .shape-6 {
          width: 200px; height: 200px;
          background: rgba(236, 72, 153, 0.3);
          bottom: 30%; right: 30%;
          animation-delay: 15s;
        }
        
        @keyframes floatAround {
          0% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(100px, -50px) scale(1.1); }
          50% { transform: translate(50px, -100px) scale(0.9); }
          75% { transform: translate(-80px, -30px) scale(1.05); }
          100% { transform: translate(0, 0) scale(1); }
        }
        
        [data-theme="light"] .floating-shape {
          opacity: 0.5;
        }
        
        [data-theme="light"] .shape-1 {
          background: rgba(139, 92, 246, 0.25);
        }
        [data-theme="light"] .shape-2 {
          background: rgba(245, 158, 11, 0.2);
        }
        [data-theme="light"] .shape-3 {
          background: rgba(16, 185, 129, 0.2);
        }
        [data-theme="light"] .shape-4 {
          background: rgba(219, 39, 119, 0.18);
        }
        [data-theme="light"] .shape-5 {
          background: rgba(37, 99, 235, 0.2);
        }
        [data-theme="light"] .shape-6 {
          background: rgba(236, 72, 153, 0.18);
        }
        
        /* دوائر مدارية */
        .orb {
          position: absolute;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.15);
          animation: rotate 30s infinite linear;
        }
        
        .orb-1 {
          width: 600px; height: 600px;
          top: -150px; left: -150px;
          border-color: rgba(139, 92, 246, 0.2);
        }
        
        .orb-2 {
          width: 500px; height: 500px;
          bottom: -100px; right: -100px;
          border-color: rgba(245, 158, 11, 0.15);
          animation-duration: 25s;
          animation-direction: reverse;
        }
        
        .orb-3 {
          width: 400px; height: 400px;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          border-color: rgba(16, 185, 129, 0.12);
          animation-duration: 20s;
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .orb-3 {
          animation: rotate20 20s infinite linear;
        }
        
        @keyframes rotate20 {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        [data-theme="light"] .orb {
          border-color: rgba(0, 0, 0, 0.06);
        }
        
        /* نقاط صغيرة */
        .bg-animated::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background-image: 
            radial-gradient(circle at 15% 25%, rgba(255,255,255,0.03) 1px, transparent 1px),
            radial-gradient(circle at 35% 65%, rgba(255,255,255,0.04) 1px, transparent 1px),
            radial-gradient(circle at 55% 35%, rgba(255,255,255,0.03) 2px, transparent 2px),
            radial-gradient(circle at 75% 55%, rgba(255,255,255,0.04) 1px, transparent 1px),
            radial-gradient(circle at 85% 15%, rgba(255,255,255,0.03) 2px, transparent 2px),
            radial-gradient(circle at 25% 85%, rgba(255,255,255,0.04) 1px, transparent 1px),
            radial-gradient(circle at 65% 75%, rgba(255,255,255,0.03) 1px, transparent 1px),
            radial-gradient(circle at 45% 45%, rgba(255,255,255,0.05) 2px, transparent 2px);
          background-size: 200px 200px;
          animation: dotsMove 10s linear infinite;
        }
        
        @keyframes dotsMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        [data-theme="light"] .bg-animated::before {
          background-image: 
            radial-gradient(circle at 15% 25%, rgba(0,0,0,0.04) 1px, transparent 1px),
            radial-gradient(circle at 35% 65%, rgba(0,0,0,0.05) 1px, transparent 1px),
            radial-gradient(circle at 55% 35%, rgba(0,0,0,0.04) 2px, transparent 2px),
            radial-gradient(circle at 75% 55%, rgba(0,0,0,0.05) 1px, transparent 1px),
            radial-gradient(circle at 85% 15%, rgba(0,0,0,0.04) 2px, transparent 2px);
          background-size: 200px 200px;
        }
      `}</style>
    </>
  );
};

export default BackgroundVideo;
