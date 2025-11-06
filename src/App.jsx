import './App.css'
import { HashRouter, Routes, Route } from 'react-router';
import Home from './componets/Home';
import AboutMe from './componets/AboutMe';


function App() {
  return <HashRouter>
    <Routes>
      <Route path="/" element={<Home />} ></Route>
      <Route path="/about" element={<AboutMe />}></Route>
    </Routes>
  </HashRouter>
}

export default App
