import { useEffect } from 'react'
import './App.css'
import ColorSelector from './ColorSelector'

function App() {
  useEffect(() => {
    document.body.addEventListener("touchmove", function (e) {
      e.preventDefault();
    });
    document.body.addEventListener("scroll", function (e) {
      e.preventDefault();
    });
    document.body.addEventListener("wheel", function (e) {
      e.preventDefault();
    }, false);
  }, [])
  return (
    <>
      <ColorSelector />
    </>
  )
}

export default App
