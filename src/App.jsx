import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import AddEvent from "./components/AddEvent";
import MyRSVPs from "./components/MyRSVPs";
import EditEvent from "./components/EditEvent";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/AddEvent" element={<AddEvent />} />
        <Route path="/MyRSVPs" element={<MyRSVPs />} />
        <Route path="/EditEvent/:id" element={<EditEvent />} />
      </Routes>
    </HashRouter>
  );
}