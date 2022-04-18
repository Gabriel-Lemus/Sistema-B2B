import React from 'react';
import TextCenter from '../atoms/TextCenter';
import helpers from '../../helpers/helpers';

function Footer() {
  return (
    <footer className="text-muted page-footer">
      <div className="container text-light">
        <TextCenter>{helpers.getCopyrightText()}</TextCenter>
        <TextCenter>{helpers.getAuthors()}</TextCenter>
      </div>
    </footer>
  );
}

export default Footer;
