import {
  BiUpArrow,
  BiDownArrow,
  BiLeftArrow,
  BiRightArrow,
} from 'react-icons/bi';
import './Button.css';

function PlayerControls() {
  return (
    <footer style={{ width: '100%' }}>
      <section
        style={{
          display: 'flex',
          margin: '0 auto',
          justifyContent: 'center',
        }}
      >
        <span className="btn">
          <BiLeftArrow />
        </span>
        <section
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span className="btn">
            <BiUpArrow />
          </span>
          <span className="btn">
            <BiDownArrow />
          </span>
        </section>
        <span className="btn">
          <BiRightArrow />
        </span>
      </section>
    </footer>
  );
}

export default PlayerControls;
