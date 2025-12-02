import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainPage from './pages/MainPage';

function App() {

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<MainPage />}>

          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
