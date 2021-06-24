import { useEffect, useLayoutEffect, useRef } from 'react';

import './FullscreenSketch.css';

const FullscreenSketch = ( { sketch } ) => {
  const canvasRef = useRef(null);

  useEffect(() => {
      if(!sketch.initialized) {
          sketch.initialize(canvasRef.current);
      }

      sketch.start();

      return () => {
        sketch.stop();
      };
  }, [sketch]);

  useLayoutEffect(() => {
    const handleResize = () => sketch.handleResize();

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  });

  return (
    <div 
      className="sketch"
    >
      <canvas 
        className="canvas"
        key={"canvas"} 
        ref={canvasRef} 
      />
    </div>
  );
}

export default FullscreenSketch;