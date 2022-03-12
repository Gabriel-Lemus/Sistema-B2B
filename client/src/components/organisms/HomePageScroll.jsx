import React from 'react';
import DescriptiveImage from './DescriptiveImage';

function HomePageScroll(props) {
  return (
    <section id="scroll">
      {props.children.map((descriptiveImage, idx) => (
        <DescriptiveImage
          key={idx}
          imageRight={descriptiveImage.imageRight}
          imageTitle={descriptiveImage.imageTitle}
          imageText={descriptiveImage.imageText}
          imageSrc={descriptiveImage.imageSrc}
          imageAlt={descriptiveImage.imageAlt}
        />
      ))}
    </section>
  );
}

export default HomePageScroll;
