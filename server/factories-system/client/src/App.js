import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';

// Web app pages
import Home from './components/pages/Home';
import Login from './components/pages/Login';
import SignUp from './components/pages/SignUp';
import NotFound from './components/pages/NotFound';
import SalesCatalog from './components/pages/SalesCatalog';
import Clients from './components/pages/Clients';
import FactoryOrders from './components/pages/FactoryOrders';
import DevicesCatalog from './components/pages/DevicesCatalog';
import DeviceData from './components/pages/DeviceData';
import Orders from './components/pages/Orders';
import OrdersControl from './components/pages/OrdersControl';
import DevicesCatalogSearch from './components/pages/DevicesCatalogSearch';
import UserProfile from './components/pages/UserProfile';
import Sales from './components/pages/Sales';
import SpecializedSearch from './components/pages/SpecializedSearch';
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

          {/* Factories system clients/sales system sellers pages */}
          <Route path="/Catalogo-Dispositivos" element={<DevicesCatalog />} />
          <Route path="/Ordenes" element={<Orders />} />
          <Route path="/Gestion-Ordenes" element={<OrdersControl />} />
          <Route path="/Datos-Dispositivo/:factoryId/:id" element={<DeviceData />} />

          {/* Factories pages */}
          <Route path="/Catalogo-Ventas" element={<SalesCatalog />} />
          <Route path="/Clientes" element={<Clients />} />
          <Route path="/Ordenes-Fabricas" element={<FactoryOrders />} />

          {/* <Route path="/Catalogo-Dispositivos" element={<DevicesCatalog />} />
          <Route path="/Catalogo-Dispositivos-Busqueda/" element={<DevicesCatalogSearch />} />
          <Route path="/Catalogo-Dispositivos-Busqueda-Espera/" element={<DevicesCatalogSearchWait />} />
          <Route path="/Busqueda-Especializada" element={<SpecializedSearch />} />
          <Route path="/Datos-Dispositivo/:seller/:id" element={<DeviceData />} />
          <Route path="/Carrito-Compras" element={<ShoppingCart />} />
          <Route path="/Perfil" element={<UserProfile />} />
          <Route path="/Compras" element={<Sales />} />
          <Route path="/Catalogo-Ventas" element={<SalesCatalog />} />
          <Route path="/Clientes" element={<Clients />} />
          <Route path="/Vendedores" element={<Sellers />} />
          <Route path="/Ventas" element={<SellersSales />} />
          <Route path="/Compras-B2B" element={<SellersPurchases />} />
          <Route path="/Marcas" element={<Brands />} /> */}

          {/* 404 page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;

