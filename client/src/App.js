import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Web app pages
import Home from './components/pages/Home';
import Login from './components/pages/Login';
import SignUp from './components/pages/SignUp';
import NotFound from './components/pages/NotFound';
import DevicesCatalog from './components/pages/DevicesCatalog';
import DeviceData from './components/pages/DeviceData';
import ShoppingCart from './components/pages/ShoppingCart';
import UserProfile from './components/pages/UserProfile';
import SalesCatalog from './components/pages/SalesCatalog';
import Sales from './components/pages/Sales';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" exact element={<Home />} />
          <Route path="/Login" exact element={<Login />} />
          <Route path="/Sign-Up" element={<SignUp />} />
          <Route path="/Catalogo-Dispositivos" element={<DevicesCatalog />} />
          <Route path="/Datos-Dispositivo/:seller/:id" element={<DeviceData />} />
          <Route path="/Carrito-Compras" element={<ShoppingCart />} />
          <Route path="/Perfil" element={<UserProfile />} />
          <Route path="/Catalogo-Ventas/:seller" element={<SalesCatalog />} />
          <Route path="/Compras" element={<Sales />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
