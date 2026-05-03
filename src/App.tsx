import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./routes/Home";
import Incident from "./routes/Incident";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/incident/:id" element={<Incident />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
