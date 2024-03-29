const ColourPicker = ({ colour, setColour }) => {
  const setRed   = e => setColour([parseInt(e.target.value, 10), colour[1], colour[2], colour[3]]);
  const setGreen = e => setColour([colour[0], parseInt(e.target.value, 10), colour[2], colour[3]]);
  const setBlue  = e => setColour([colour[0], colour[1], parseInt(e.target.value, 10), colour[3]]);
  const setAlpha = e => setColour([colour[0], colour[1], colour[2], parseInt(e.target.value, 10)]);

  const hexColour = rgba => '#' 
    + rgba[0].toString(16) 
    + rgba[1].toString(16) 
    + rgba[2].toString(16) 
    + rgba[3].toString(16);

  return (
    <div style={{display: 'flex'}}>
      <form name="colour-picker" style={{display: 'flex', flexDirection: 'column'}}>
        <input type="range" min="0" max="255" value={colour[0]} step="1" name="red" onChange={setRed}></input>
        <input type="range" min="0" max="255" value={colour[1]} step="1" name="green" onChange={setGreen}></input>
        <input type="range" min="0" max="255" value={colour[2]} step="1" name="blue" onChange={setBlue}></input>
        <input type="range" min="0" max="255" value={colour[3]} step="1" name="alpha" onChange={setAlpha}></input>
      </form>
      <div style={{backgroundColor: hexColour(colour), width:'2em', height:'2em'}}></div>
    </div>
  )
};

export default ColourPicker;
