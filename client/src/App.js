import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Web app pages
import Home from './components/pages/Home';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" exact element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
