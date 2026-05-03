import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./routes/Home";
import Incident from "./routes/Incident";

/**
 * Resets the scroll position to the top whenever the URL path
 * changes. Without this, React Router preserves the previous page's
 * scroll position — so clicking into an incident from a card halfway
 * down the home page would land the reader past the cinematic stage,
 * directly on the timeline.
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/incident/:id" element={<Incident />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
