import React, { useEffect } from 'react';
import Header from '../organisms/Header';
import HomePageScroll from '../organisms/HomePageScroll';
import HeaderFooterTemplate from '../templates/HeaderFooterTemplate';

function Home() {
  useEffect(() => {
    document.title = 'Sistema B2B';
  }, []);

  const descriptiveImages = [
    {
      imageRight: true,
      imageTitle: "Alta disponibilidad de dispositivos electrónicos",
      imageText:
        "El sistema de ventas cuenta con una gran cantidad de dispositivos electrónicos disponibles para su compra. La búsqueda de los dispositivos electrónicos se realiza mediante su  categoría, marca, modelo y otras características.",
      imageSrc:
        'https://st2.depositphotos.com/6198262/11688/v/950/depositphotos_116884724-stock-illustration-household-appliances-and-electronic-devices.jpg',
      imageAlt: 'Various food ingredients',
    },
    {
      imageRight: false,
      imageTitle: 'Facilidad de compras',
      imageText:
        'Después de realizar la búsqueda de los dispositivos electrónicos, solamente es necesario agregarlos al carrito de compras y proceder a realizar el pago. ¡Es un proceso muy sencillo!',
      imageSrc:
        'https://thumbs.dreamstime.com/b/hand-giving-shopping-paper-taking-credit-card-monochrome-sketch-outline-seller-buyer-market-paying-products-bought-165749194.jpg',
      imageAlt: 'Person preparing a meal',
    },
    {
      imageRight: true,
      imageTitle: 'Registro de compras',
      imageText:
        "Las compras realizadas quedan registradas y pueden ser visualizadas en cualquier momento, de forma que queden disponibles para el futuro.",
      imageSrc:
        'https://images.fineartamerica.com/images/artworkimages/mediumlarge/3/clipboard-checklist-symbol-drawing-frank-ramspott.jpg',
      imageAlt: 'Lemon chicke plate',
    },
  ];

  return (
    <>
      <HeaderFooterTemplate activePageIdx={0}>
        <Header />
        <HomePageScroll>{descriptiveImages}</HomePageScroll>
      </HeaderFooterTemplate>
    </>
  );
}

export default Home;
