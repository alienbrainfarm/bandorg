import React, { useEffect } from 'react';
import alienImage from '../assets/alien.png'; // Placeholder for alien image
import logoutAudio from '../assets/logout_succeeded.mp3'; // Placeholder for audio

const LogoutSuccessPage = () => {
  useEffect(() => {
    const audio = new Audio(logoutAudio);
    audio.play();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <img src={alienImage} alt="Alien Figure" className="w-64 h-64" />
      {/* Audio will play automatically via useEffect */}
    </div>
  );
};

export default LogoutSuccessPage;
