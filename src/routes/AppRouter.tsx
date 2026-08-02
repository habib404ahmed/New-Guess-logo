import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/Landing/LandingPage';
import HomePage from '../pages/Home/HomePage';
import LogoChallengePage from '../pages/LogoChallenge/LogoChallengePage';
import MovieChallengePage from '../pages/MovieChallenge/MovieChallengePage';
import AdminPage from '../pages/Admin/AdminPage';
import SettingsPage from '../pages/Settings/SettingsPage';
import ThankYouPage from '../pages/ThankYou/ThankYouPage';

export const AppRouter: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/play/logo" element={<LogoChallengePage />} />
        <Route path="/play/movie" element={<MovieChallengePage />} />
        <Route path="/admin/*" element={<AdminPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};
