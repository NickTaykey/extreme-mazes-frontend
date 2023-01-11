import { useHistory } from 'react-router-dom';

const API_URL = 'http://localhost:8888';

function NewGame() {
  const history = useHistory();

  const handleClick = async () => {
    const res = await fetch(`${API_URL}/mazes`, { method: 'POST' });
    const maze = await res.json();
    localStorage.setItem(`maze-${maze.id}`, JSON.stringify(maze));
    history.replace(`/mazes/${maze.id}`);
  };

  return <button onClick={handleClick}>GENERATE NEW MAZE!</button>;
}
export default NewGame;
