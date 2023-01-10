import { useState } from 'react';
import './App.css';
import NewGame from './NewGame';

function App() {
  const [maze, setMaze] = useState(null);
  return (
    <div className="App">
      <NewGame maze={maze} setMaze={setMaze} />
    </div>
  );
}

export default App;
