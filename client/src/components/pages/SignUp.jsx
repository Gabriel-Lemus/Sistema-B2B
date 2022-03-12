import React, { useEffect } from 'react';
import SignUpForm from '../organisms/SignUpForm';
import HeaderFooterTemplate from '../templates/HeaderFooterTemplate';

function SignUp() {
  useEffect(() => {
    document.title = 'Sign Up';
  }, []);
  
  return (
    <>
      <HeaderFooterTemplate activePageIdx={2}>
        <SignUpForm />
      </HeaderFooterTemplate>
    </>
  );
}

export default SignUp;
