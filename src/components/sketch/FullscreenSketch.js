import { useState, useEffect, useLayoutEffect, useRef } from 'react';

import './FullscreenSketch.css';

import LoadingPage from '../../pages/loading/loadingPage';

const FullscreenSketch = ( { sketch } ) => {
  const canvasRef = useRef(null);

  const [loaded, setLoaded] = useState(false);
  const [transitionDone, setTransitionDone] = useState(false);

  useEffect(() => {
      if(!sketch.initialized) {
          sketch.initialize(canvasRef.current, () => {
            setLoaded(true);
          });
      }

      sketch.start();

      return () => {
        sketch.stop();
        sketch.cleanup();
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
      { /*!transitionDone
      ? <LoadingPage 
          loaded={loaded}
          fadeOutTime={1800}
          onFadeOut={() => {
            setTransitionDone(true);
          }}
        /> 
        : null */}
      <canvas 
        className={"canvas" + (transitionDone ? " loaded" : "")}
        key={"canvas"} 
        ref={canvasRef} 
      />
    </div>
  );
}

export default FullscreenSketch;
