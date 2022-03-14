import React, { useEffect } from 'react';
import LoginForm from '../organisms/LoginForm';
import HeaderFooterTemplate from '../templates/HeaderFooterTemplate';

function Login() {
  useEffect(() => {
    document.title = 'Inicio de Sesión';
  }, []);
  
  return (
    <>
      <HeaderFooterTemplate activePageIdx={1}>
        <LoginForm />
      </HeaderFooterTemplate>
    </>
  );
}

export default Login;
