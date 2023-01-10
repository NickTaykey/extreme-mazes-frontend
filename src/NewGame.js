const API_URL = 'http://localhost:8888';

function NewGame(props) {
  const handleClick = async () => {
    const res = await fetch(`${API_URL}/mazes`, { method: 'POST' });
    const maze = await res.json();
    props.setMaze(maze);
  };

  return (
    <>
      <button onClick={handleClick}>GENERATE NEW MAZE!</button>
      {!!props.maze && (
        <section>
          <pre>{props.maze.id}</pre>
        </section>
      )}
    </>
  );
}
export default NewGame;
