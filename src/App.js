import './App.css';

import SketchComponent from './components/sketch/FullscreenSketch'
//import sketch from './three/sketches/template/Sketch'
//import sketch from './three/sketches/mind-palace/MindSketch'  
import sketch from './three/sketches/mind-palace/ParallaxSketch';


function App() {
  return (
    <div className="App">
      <SketchComponent 
        sketch={sketch}
      />
    </div>
  );
}

export default App;
