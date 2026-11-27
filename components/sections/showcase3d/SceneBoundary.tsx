import { Component, type ReactNode } from "react";

// Si algo de la escena 3D falla al montar (contexto WebGL perdido, shader que no
// compila, chunk que no carga) se cae al monitor estático en vez de romper el hero.
interface Props {
  onError: () => void;
  children: ReactNode;
}

export class SceneBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
