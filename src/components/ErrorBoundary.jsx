import { Component } from 'react';
import { reportError } from '../telemetry.js';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    reportError(error, { source: 'react', componentStack: String(info?.componentStack || '').slice(0, 2000) });
    console.error('Error en Code Empire Tycoon', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="start-shell">
        <section className="start-card error-card" role="alert">
          <h1>Algo ha fallado</h1>
          <p>
            El juego ha encontrado un error inesperado. Tu partida se guarda automáticamente, así que puedes recargar la página.
          </p>
          <button type="button" className="primary big" onClick={() => window.location.reload()}>
            Recargar
          </button>
          {this.props.onReset && (
            <button type="button" className="secondary" onClick={this.props.onReset}>
              Borrar partida y empezar de cero
            </button>
          )}
        </section>
      </main>
    );
  }
}
