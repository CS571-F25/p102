import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import AddEvent from "./components/AddEvent";
import MyRSVPs from "./components/MyRSVPs";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/AddEvent" element={<AddEvent />} />
        <Route path="/MyRSVPs" element={<MyRSVPs />} />
      </Routes>
    </HashRouter>
  );
}