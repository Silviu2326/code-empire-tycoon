import { assets } from '../data/assets.js';
import { findById, candidates } from '../data/catalog.js';
import { Avatar } from './ui.jsx';

export function PixelOffice({ hero = false, stage }) {
  const scene = hero ? assets.hero : stage === undefined ? assets.office : assets.stages[stage];
  return (
    <div className={`pixel-office has-asset ${hero ? 'hero' : ''}`}>
      <img className="scene-asset" src={scene} alt="" />
      <div className="window">
        <span />
        <span />
      </div>
      <div className="poster">CODE</div>
      <div className="shelf">
        <i />
        <i />
        <i />
      </div>
      <div className="plant">
        <i />
        <i />
        <i />
      </div>
      <div className="desk">
        <div className="monitor left">
          010
          <br />
          dev
        </div>
        <div className="monitor right">
          app
          <br />
          run
        </div>
        <div className="keyboard" />
      </div>
      <div className="coder">
        <Avatar person={findById(candidates, 'alice')} label="Coder" />
      </div>
      <div className="mug" />
      <div className="beanbag" />
    </div>
  );
}

export function PixelLandscape() {
  return (
    <div className="pixel-landscape has-asset">
      <img className="scene-asset" src={assets.landscape} alt="" />
      <div className="cliff" />
      <div className="hero-sprite">
        <Avatar person={findById(candidates, 'charlie')} label="Héroe" />
      </div>
      {Array.from({ length: 7 }).map((_, index) => (
        <span key={index} className={`tree t${index}`} />
      ))}
      <div className="path" />
    </div>
  );
}
