import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "./lib/router";
import App from "./App";
import { CeiaProvider } from "./store/ceia";
import { AuthProvider } from "./lib/auth";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <CeiaProvider>
          <App />
        </CeiaProvider>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>,
);
