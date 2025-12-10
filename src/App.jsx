import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import AddEvent from "./components/AddEvent";
import MyRSVPs from "./components/MyRSVPs";
import EditEvent from "./components/EditEvent";
import Groups from "./components/Groups";
import Memories from "./components/Memories";
import AppNavbar from "./components/Navbar";

export default function App() {
  return (
    <HashRouter>
      <AppNavbar />   {/* NAVBAR ALWAYS VISIBLE */}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/AddEvent" element={<AddEvent />} />
        <Route path="/MyRSVPs" element={<MyRSVPs />} />
        <Route path="/EditEvent/:id" element={<EditEvent />} />
        <Route path="/Groups" element={<Groups />} />
        <Route path="/Memories" element={<Memories />} />  {/* <-- NEW */}
      </Routes>
    </HashRouter>
  );
}