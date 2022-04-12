import React, { useEffect } from 'react';
import helpers from '../../helpers/helpers';
import { css } from '@emotion/react';
import DotLoader from 'react-spinners/DotLoader';
import $ from 'jquery';

const override = css`
  position: absolute;
  top: 35%;
  left: 45%;
  margin-top: -50px;
  margin-left: -50px;
`;

function Loader(props) {
  useEffect(() => {
    setTimeout(() => {
      $('.background-div').css('height', $(document).height());
    }, 1000);
  }, []);

  return (
    <div className="background-div">
      <DotLoader
        color={helpers.PALETTE.green}
        loading={props.loading}
        css={override}
        size={275}
      />
    </div>
  );
}

export default Loader;
