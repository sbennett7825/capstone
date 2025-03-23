import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LandingPage from '../components/ui/sections/LandingPage/LandingPage';

<BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          {/* <Route path="/other" element={<OtherComponent />} /> */}
        </Routes>
      </BrowserRouter>