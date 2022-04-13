import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';

// Web app pages
import Home from './components/pages/Home';
import Login from './components/pages/Login';
import SignUp from './components/pages/SignUp';
import NotFound from './components/pages/NotFound';
import DevicesCatalog from './components/pages/DevicesCatalog';
import DevicesCatalogSearch from './components/pages/DevicesCatalogSearch';
import DeviceData from './components/pages/DeviceData';
import ShoppingCart from './components/pages/ShoppingCart';
import UserProfile from './components/pages/UserProfile';
import SalesCatalog from './components/pages/SalesCatalog';
import Sales from './components/pages/Sales';
import SpecializedSearch from './components/pages/SpecializedSearch';
import Clients from './components/pages/Clients';
import Sellers from './components/pages/Sellers';
import Brands from './components/pages/Brands';
import SellersSales from './components/pages/SellersSales';
import SellersPurchases from './components/pages/SellersPurchases';
import DevicesCatalogSearchWait from './components/pages/DevicesCatalogSearchWait';

function App() {
  return (
    <div className="App">
      <HashRouter>
        <Routes>
          {/* Common pages */}
          <Route path="/" exact element={<Home />} />
          <Route path="/Login" exact element={<Login />} />
          <Route path="/Sign-Up" element={<SignUp />} />

          {/* Clients pages */}
          <Route path="/Catalogo-Dispositivos" element={<DevicesCatalog />} />
          <Route path="/Catalogo-Dispositivos-Busqueda/" element={<DevicesCatalogSearch />} />
          <Route path="/Catalogo-Dispositivos-Busqueda-Espera/" element={<DevicesCatalogSearchWait />} />
          <Route path="/Busqueda-Especializada" element={<SpecializedSearch />} />
          <Route path="/Datos-Dispositivo/:seller/:id" element={<DeviceData />} />
          <Route path="/Carrito-Compras" element={<ShoppingCart />} />
          <Route path="/Perfil" element={<UserProfile />} />
          <Route path="/Compras" element={<Sales />} />

          {/* Seller pages */}
          <Route path="/Catalogo-Ventas" element={<SalesCatalog />} />
          <Route path="/Clientes" element={<Clients />} />
          <Route path="/Vendedores" element={<Sellers />} />
          <Route path="/Ventas" element={<SellersSales />} />
          <Route path="/Compras-B2B" element={<SellersPurchases />} />
          <Route path="/Marcas" element={<Brands />} />

          {/* 404 page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
