import { useState, useEffect, useLayoutEffect, useRef } from 'react';

import './FullscreenSketch.css';

import LoadingPage from '../../pages/loading/loadingPage';

const FullscreenSketch = ( { sketch } ) => {
  const canvasRef = useRef(null);

  const [loaded, setLoaded] = useState(false);
  const [transitionDone, setTransitionDone] = useState(false);

  const registerListeners = () => {
    const onKeyPressed = event => {
      switch(event.key) {
        case 'c': {
          sketch.captureFrame(dataURL => {
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = "sketch";
            link.click(); 
          });
        }
      }

      console.log(event.key);

    };

    window.addEventListener("keydown", onKeyPressed);
  };

  useEffect(() => {
      if(!sketch.initialized) {
          sketch.initialize(canvasRef.current, () => {
            setLoaded(true);
          });
      }

      sketch.start();

      registerListeners();

      return () => {
        sketch.stop();
        sketch.cleanup();
      };
  }, [sketch]);

  useLayoutEffect(() => {
    const handleResize = () => {
      sketch.handleResize();
    }

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
