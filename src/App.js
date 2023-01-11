import { BrowserRouter, Switch, Route } from 'react-router-dom';
import MazeCanvas from './MazeCanvas';
import NewGame from './NewGame';
import './App.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route path="/mazes/new">
            <NewGame />
          </Route>
          <Route path="/mazes/:id">
            <MazeCanvas />
          </Route>
          <Route path="*">
            <h1>404 Page not found!</h1>
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
