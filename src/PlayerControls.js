import {
  BiUpArrow,
  BiDownArrow,
  BiLeftArrow,
  BiRightArrow,
} from 'react-icons/bi';
import './Button.css';

function PlayerControls({ handlePositionUpdateGenerator }) {
  return (
    <footer style={{ width: '100%' }}>
      <section
        style={{
          display: 'flex',
          margin: '0 auto',
          justifyContent: 'center',
        }}
      >
        <span className="btn" onClick={handlePositionUpdateGenerator('left')}>
          <BiLeftArrow />
        </span>
        <section
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span className="btn" onClick={handlePositionUpdateGenerator('up')}>
            <BiUpArrow />
          </span>
          <span className="btn" onClick={handlePositionUpdateGenerator('down')}>
            <BiDownArrow />
          </span>
        </section>
        <span className="btn" onClick={handlePositionUpdateGenerator('right')}>
          <BiRightArrow />
        </span>
      </section>
    </footer>
  );
}

export default PlayerControls;
