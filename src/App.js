import './App.css';

import SketchComponent from './components/sketch/FullscreenSketch'
//import sketch from './three/sketches/template/Sketch'
import sketch from './three/sketches/mind-palace/MindSketch'  

function App() {
  return (
    <div className="App">
      <SketchComponent sketch={sketch}/>
    </div>
  );
}

export default App;
