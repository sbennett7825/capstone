import React, { useState } from 'react';

import LandingPage from './components/ui/sections/LandingPage/LandingPage.tsx';
import Communicator from './components/ui/sections/Communicator.tsx';



const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.clear();
    alert("You are logged out.");
  };

  return(
      <div>
        {isLoggedIn ? (
          <Communicator onLogout={handleLogout} />
        ) : (
          <LandingPage onLoginSuccess={() => setIsLoggedIn(true)} />
        )}
      </div>
  );
};

export default App;
