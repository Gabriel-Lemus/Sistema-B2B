import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';

// Web app pages
import Home from './components/pages/Home';
import Login from './components/pages/Login';
import SignUp from './components/pages/SignUp';
import NotFound from './components/pages/NotFound';
import DevicesCatalog from './components/pages/DevicesCatalog';
import SoldOutDevicesCatalog from './components/pages/SoldOutDevicesCatalog';
import DevicesCatalogSearch from './components/pages/DevicesCatalogSearch';
import DeviceData from './components/pages/DeviceData';
import SoldOutDeviceData from './components/pages/SoldOutDeviceData';
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
import FactoriesDevicesCatalog from './components/pages/FactoriesDevicesCatalog';
import OrderToFactories from './components/pages/OrderToFactories';
import FactoriesOrdersControl from './components/pages/FactoriesOrdersControl';
import FactoriesDeviceData from './components/pages/FactoriesDeviceData';
import FactoryDevicesCatalogSearch from './components/pages/FactoryDevicesCatalogSearch';
import FactoryDevicesCatalogSearchWait from './components/pages/FactoryDevicesCatalogSearchWait';
import FactoryDevicesSpecializedSearch from './components/pages/FactoryDevicesSpecializedSearch';
import Orders from './components/pages/Orders';
import OrdersControl from './components/pages/OrdersControl';

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
          <Route path="/Datos-Dispositivo-Agotado/:seller/:id" element={<SoldOutDeviceData />} />
          <Route path="/Carrito-Compras" element={<ShoppingCart />} />
          <Route path="/Perfil" element={<UserProfile />} />
          <Route path="/Compras" element={<Sales />} />
          <Route path="/Dispositivos-Agotados" element={<SoldOutDevicesCatalog />} />
          <Route path="/Ordenes" element={<Orders />} />
          <Route path="/Gestion-Ordenes" element={<OrdersControl />} />

          {/* Seller pages */}
          <Route path="/Catalogo-Ventas" element={<SalesCatalog />} />
          <Route path="/Clientes" element={<Clients />} />
          <Route path="/Vendedores" element={<Sellers />} />
          <Route path="/Ventas" element={<SellersSales />} />
          <Route path="/Compras-B2B" element={<SellersPurchases />} />
          <Route path="/Marcas" element={<Brands />} />
          <Route path="/Catalogo-Dispositivos-Fabricas" element={<FactoriesDevicesCatalog />} />
          <Route path="/Datos-Dispositivo-Fabricas/:factoryId/:id" element={<FactoriesDeviceData />} />
          <Route path="/Ordenes-A-Fabricas" element={<OrderToFactories />} />
          <Route path="/Gestion-Ordenes-A-Fabricas" element={<FactoriesOrdersControl />} />
          <Route path="/Catalogo-Fabrica-Dispositivos-Busqueda/" element={<FactoryDevicesCatalogSearch />} />
          <Route path="/Catalogo-Fabrica-Dispositivos-Busqueda-Espera/" element={<FactoryDevicesCatalogSearchWait />} />
          <Route path="/Busqueda-Fabrica-Especializada" element={<FactoryDevicesSpecializedSearch />} />

          {/* 404 page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
