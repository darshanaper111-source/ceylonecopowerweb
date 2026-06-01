import React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";

import Header      from "./components/Header.jsx";
import Footer      from "./components/Footer.jsx";
import HomePage    from "./pages/HomePage.jsx";
import ProjectsPage from "./pages/ProjectsPage.jsx";
import PartnersPage from "./pages/PartnersPage.jsx";
import ContactPage  from "./pages/ContactPage.jsx";

export default function App() {
  return (
    <HashRouter>
      <Header />
      <main>
        <Routes>
          <Route path="/"         element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/partners" element={<PartnersPage />} />
          <Route path="/contact"  element={<ContactPage />} />
          {/* Fallback */}
          <Route path="*"         element={<HomePage />} />
        </Routes>
      </main>
      <Footer />
    </HashRouter>
  );
}
