import { useEffect, useRef } from 'react';
import { assets, spritePositions } from '../data/assets.js';

export function Stat({ icon, label, value, tone }) {
  return (
    <div className="stat">
      {icon && <span aria-hidden="true">{icon}</span>}
      <small>{label}</small>
      <strong className={tone || ''}>{value}</strong>
    </div>
  );
}

export function Stars({ value }) {
  const stars = Math.round(value / 20);
  return (
    <div className="stars" role="img" aria-label={`Calidad ${stars} de 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className={index < stars ? 'on' : ''} aria-hidden="true">
          ★
        </span>
      ))}
    </div>
  );
}

export function Bar({ value, big = false, label }) {
  return (
    <div
      className={big ? 'bar big' : 'bar'}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
    >
      <span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function Avatar({ person, label }) {
  const style = person.image
    ? { backgroundImage: `url(${assets.founder.early})`, backgroundSize: 'cover', backgroundPosition: 'center top' }
    : { backgroundImage: `url(${assets.portraits})`, backgroundPosition: spritePositions[person.portrait || 0] };
  return (
    <span
      className="avatar portrait-avatar"
      title={label || person.name}
      role="img"
      aria-label={label || person.name}
      style={style}
    />
  );
}

// Hojas 3x3 (sheet-upgrades, sheet-products): cada celda ocupa ~30% con márgenes.
const GRID3 = ['4%', '50%', '96%'];
// Hoja de managers 3x2 con tarjetas verticales.
const EXEC_X = ['2%', '50%', '98%'];
const EXEC_Y = ['13%', '83%'];

export function GridSprite({ image, index, className = '' }) {
  return (
    <span
      className={`grid-sprite ${className}`}
      aria-hidden="true"
      style={{
        backgroundImage: `url(${image})`,
        backgroundPosition: `${GRID3[index % 3]} ${GRID3[Math.floor(index / 3)]}`
      }}
    />
  );
}

export function ExecutivePortrait({ index, label }) {
  return (
    <span
      className="executive-portrait"
      role="img"
      aria-label={label}
      style={{
        backgroundImage: `url(${assets.empire.executives})`,
        backgroundPosition: `${EXEC_X[index % 3]} ${EXEC_Y[Math.floor(index / 3)]}`
      }}
    />
  );
}

export function ProjectIcon({ project, locked = false }) {
  const image = typeof project.icon === 'string' ? assets.projects[project.icon] : null;
  return (
    <div className={`project-icon ${locked ? 'locked' : ''}`}>
      {image ? (
        <img src={image} alt="" />
      ) : (
        <GridSprite image={assets.empire.products} index={project.icon || 0} className="fill" />
      )}
      {project.status === 'idea' && (
        <span className="icon-lock" aria-hidden="true">
          💡
        </span>
      )}
    </div>
  );
}

export function Sprite({ image, index, className }) {
  return (
    <div
      className={`${className} asset-sprite`}
      aria-hidden="true"
      style={{ backgroundImage: `url(${image})`, backgroundPosition: spritePositions[index || 0] }}
    />
  );
}

export function ScreenTitle({ title, back, right }) {
  return (
    <div className="screen-title">
      {back && (
        <button type="button" className="back" onClick={back} aria-label="Volver">
          ‹
        </button>
      )}
      <h2>{title}</h2>
      {right}
    </div>
  );
}

export function Tabs({ tabs, value, onChange, label }) {
  return (
    <div className="tabs" role="tablist" aria-label={label} style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
      {tabs.map((tab) => (
        <button
          type="button"
          role="tab"
          key={tab.id}
          aria-selected={value === tab.id}
          className={value === tab.id ? 'active' : ''}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {tab.count !== undefined && <small> ({tab.count})</small>}
        </button>
      ))}
    </div>
  );
}

export function ChoiceGrid({ title, options, value, onChange }) {
  return (
    <section className="choice-section">
      <h2>{title}</h2>
      <div className="choice-grid" role="radiogroup" aria-label={title}>
        {options.map((option) => (
          <button
            type="button"
            role="radio"
            aria-checked={value === option.id}
            className={value === option.id ? 'selected' : ''}
            key={option.id}
            onClick={() => onChange(option.id)}
          >
            <span aria-hidden="true">{option.icon}</span>
            {option.label || option.id}
          </button>
        ))}
      </div>
    </section>
  );
}

export function Modal({ title, onClose, children, actions }) {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const previous = document.activeElement;
    dialogRef.current?.querySelector('button, [href], input')?.focus();
    const onKey = (event) => {
      if (event.key === 'Escape') onCloseRef.current?.();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, []);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={dialogRef}
        onClick={(event) => event.stopPropagation()}
      >
        <h2>{title}</h2>
        <div className="modal-body">{children}</div>
        {actions && <div className="modal-actions">{actions}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ request, onClose }) {
  return (
    <Modal
      title={request.title}
      onClose={onClose}
      actions={
        <>
          <button type="button" className="secondary" onClick={onClose}>
            {request.cancelLabel || 'Cancelar'}
          </button>
          <button
            type="button"
            className={request.danger ? 'danger' : 'primary'}
            onClick={() => {
              onClose();
              request.onConfirm();
            }}
          >
            {request.confirmLabel || 'Confirmar'}
          </button>
        </>
      }
    >
      <p>{request.text}</p>
    </Modal>
  );
}

export function Toast({ feedback }) {
  if (!feedback) return null;
  return (
    <div key={feedback.seq} className={`toast ${feedback.tone}`} role="status" aria-live="polite">
      {feedback.text}
    </div>
  );
}
