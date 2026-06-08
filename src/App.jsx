import React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";

import Header       from "./components/Header.jsx";
import Footer       from "./components/Footer.jsx";
import HomePage     from "./pages/HomePage.jsx";
import ProjectsPage from "./pages/ProjectsPage.jsx";
import PartnersPage from "./pages/PartnersPage.jsx";
import ContactPage  from "./pages/ContactPage.jsx";
import ShopPage     from "./pages/ShopPage.jsx";
import AdminPage    from "./pages/AdminPage.jsx";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Admin has its own layout (no site header/footer) */}
        <Route path="/admin" element={<AdminPage />} />

        {/* Public site */}
        <Route
          path="*"
          element={
            <>
              <Header />
              <main>
                <Routes>
                  <Route path="/"         element={<HomePage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/partners" element={<PartnersPage />} />
                  <Route path="/contact"  element={<ContactPage />} />
                  <Route path="/shop"     element={<ShopPage />} />
                  <Route path="*"         element={<HomePage />} />
                </Routes>
              </main>
              <Footer />
            </>
          }
        />
      </Routes>
    </HashRouter>
  );
}
