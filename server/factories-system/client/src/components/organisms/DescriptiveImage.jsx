import React from 'react';

function DescriptiveImage(props) {
  return (
    <div className="container px-10">
      <div className="row gx-5 align-items-center">
        <div className={`col-lg-6 order-lg-${props.imageRight ? 1 : 2}`}>
          <div className="p-5">
            <h2 className="display-4">{props.imageTitle}</h2>
            <p className="text-justify">{props.imageText}</p>
          </div>
        </div>
        <div className={`col-lg-6 order-lg-${props.imageRight ? 2 : 1}`}>
          <div
            className="p-5"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <img
              src={props.imageSrc}
              alt={props.imageAlt}
              className="img-fluid rounded-circle"
              style={{
                maxHeight: '20rem',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DescriptiveImage;
