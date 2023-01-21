import { useHistory } from 'react-router-dom';
import './Button.css';

const API_URL = 'http://localhost:8888';

function NewGame() {
  const history = useHistory();

  const handleClick = async () => {
    const res = await fetch(`${API_URL}/mazes`, { method: 'POST' });
    const maze = await res.json();
    localStorage.setItem(`maze-${maze.id}`, JSON.stringify(maze));
    history.replace(`/mazes/${maze.id}`);
  };

  return (
    <main style={{ height: '80vh', alignItems: 'center', display: 'flex' }}>
      <button
        onClick={handleClick}
        className="btn"
        style={{
          margin: '0 auto',
          padding: '15px',
          width: '90%',
          fontSize: '1rem',
          letterSpacing: '1.5px',
          lineHeight: '1.25',
        }}
      >
        GENERATE NEW MAZE!
      </button>
    </main>
  );
}
export default NewGame;
