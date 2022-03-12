import React from 'react';
import Footer from '../molecules/Footer';
import Navbar from '../organisms/Navbar';

function HeaderFooterTemplate(props) {
  return (
    <>
      <Navbar activePageIdx={props.activePageIdx} />
      {props.children}
      <Footer />
    </>
  );
}

export default HeaderFooterTemplate;
