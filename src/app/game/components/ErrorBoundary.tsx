"use client";

import React, { ReactNode } from "react";
import styles from "../game.module.css";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary para capturar errores en componentes y prevenir que todo el juego se caiga
 *
 * Uso:
 * <ErrorBoundary>
 *   <GameComponent />
 * </ErrorBoundary>
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Actualizar estado para que el siguiente render muestre la UI de error
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Loguear el error (en producción, esto iría a un servicio de logging)
    console.error("Error capturado por ErrorBoundary:", error);
    console.error("Stack de componentes:", errorInfo.componentStack);

    // Actualizar estado con detalles del error
    this.setState({
      error,
      errorInfo,
    });

    // Aquí podrías enviar el error a un servicio de logging (Sentry, LogRocket, etc.)
    // try {
    //   await reportErrorToService(error, errorInfo);
    // } catch (reportError) {
    //   console.error('Failed to report error:', reportError);
    // }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div style={errorContainerStyle}>
            <div style={errorCardStyle}>
              <h1 style={errorTitleStyle}>⚠️ ¡Algo salió mal!</h1>

              <p style={errorDescriptionStyle}>
                Encontramos un error inesperado en el juego. Tu progreso se ha
                guardado automáticamente.
              </p>

              <div style={errorDetailsStyle}>
                <h3 style={errorDetailsTitleStyle}>Detalles del error:</h3>
                <pre style={errorPreStyle}>{this.state.error?.toString()}</pre>

                {process.env.NODE_ENV === "development" && (
                  <details style={devDetailsStyle}>
                    <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
                      Stack de componentes (solo desarrollo)
                    </summary>
                    <pre style={errorPreStyle}>
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                )}
              </div>

              <div style={errorButtonContainerStyle}>
                <button
                  onClick={this.handleReset}
                  style={primaryButtonStyle}
                  onMouseOver={(e) => {
                    (
                      e.currentTarget as HTMLButtonElement
                    ).style.backgroundColor = "#d32f2f";
                  }}
                  onMouseOut={(e) => {
                    (
                      e.currentTarget as HTMLButtonElement
                    ).style.backgroundColor = "#f44336";
                  }}
                >
                  🔄 Intentar de nuevo
                </button>

                <button
                  onClick={() => (window.location.href = "/")}
                  style={secondaryButtonStyle}
                  onMouseOver={(e) => {
                    (
                      e.currentTarget as HTMLButtonElement
                    ).style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                  }}
                  onMouseOut={(e) => {
                    (
                      e.currentTarget as HTMLButtonElement
                    ).style.backgroundColor = "transparent";
                  }}
                >
                  🏠 Volver al inicio
                </button>
              </div>

              <p style={errorFooterStyle}>
                Si el error persiste, por favor intenta refrescar la página o
                contacta con soporte.
              </p>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Estilos inline para el error boundary (fallback si el CSS falla)
const errorContainerStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "oklch(15% 0 0)",
  zIndex: 10000,
  fontFamily: "system-ui, -apple-system, sans-serif",
};

const errorCardStyle: React.CSSProperties = {
  backgroundColor: "oklch(25% 0 0)",
  border: "2px solid oklch(68% 0.14 50)",
  borderRadius: "16px",
  padding: "32px",
  maxWidth: "600px",
  width: "90%",
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
  color: "oklch(95% 0 0)",
};

const errorTitleStyle: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: 700,
  margin: "0 0 16px 0",
  color: "oklch(75% 0.16 30)",
};

const errorDescriptionStyle: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: 1.6,
  margin: "0 0 24px 0",
  color: "oklch(85% 0 0)",
};

const errorDetailsStyle: React.CSSProperties = {
  backgroundColor: "oklch(20% 0 0)",
  border: "1px solid oklch(35% 0 0)",
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
};

const errorDetailsTitleStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 600,
  margin: "0 0 12px 0",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  color: "oklch(68% 0.14 50)",
};

const errorPreStyle: React.CSSProperties = {
  backgroundColor: "oklch(15% 0 0)",
  border: "1px solid oklch(30% 0 0)",
  borderRadius: "4px",
  padding: "12px",
  fontSize: "12px",
  fontFamily: "monospace",
  overflowX: "auto",
  margin: 0,
  color: "oklch(80% 0 0)",
  maxHeight: "200px",
};

const devDetailsStyle: React.CSSProperties = {
  marginTop: "12px",
  cursor: "pointer",
};

const errorButtonContainerStyle: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  marginTop: "24px",
  justifyContent: "center",
};

const primaryButtonStyle: React.CSSProperties = {
  backgroundColor: "#f44336",
  color: "white",
  border: "none",
  borderRadius: "8px",
  padding: "12px 24px",
  fontSize: "16px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
};

const secondaryButtonStyle: React.CSSProperties = {
  backgroundColor: "transparent",
  color: "oklch(75% 0.16 30)",
  border: "2px solid oklch(75% 0.16 30)",
  borderRadius: "8px",
  padding: "10px 22px",
  fontSize: "16px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
};

const errorFooterStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "oklch(70% 0 0)",
  margin: "20px 0 0 0",
  textAlign: "center",
};
