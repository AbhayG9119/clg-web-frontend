import React, { useState, useRef, useEffect, memo } from 'react';

const LazyImage = memo(({ src, srcSet, sizes, alt, width, height, webpSrc, webpSrcSet, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  // Check if browser supports WebP
  const supportsWebP = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  };

  const useWebP = supportsWebP();

  return (
    <picture>
      {isInView && webpSrc && (
        <source srcSet={webpSrcSet || webpSrc} type="image/webp" sizes={sizes} />
      )}
      <img
        ref={imgRef}
        src={isInView ? src : undefined}
        srcSet={isInView ? srcSet : undefined}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        onLoad={handleLoad}
        style={{
          opacity: isLoaded ? 1 : 0.5,
          transition: 'opacity 0.3s',
          willChange: 'opacity'
        }}
        loading="lazy"
        {...props}
      />
    </picture>
  );
});

export default LazyImage;
