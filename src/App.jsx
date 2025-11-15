import './App.css'
import { HashRouter, Routes, Route } from 'react-router';
import Home from './components/Home';
import AboutMe from './components/AddEvent';


function App() {
  return <HashRouter>
    <Routes>
      <Route path="/" element={<Home />} ></Route>
      <Route path="/about" element={<AddEvent />}></Route>
    </Routes>
  </HashRouter>
}

export default App
