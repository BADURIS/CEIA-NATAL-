import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "./lib/router";
import App from "./App";
import { CeiaProvider } from "./store/ceia";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <CeiaProvider>
        <App />
      </CeiaProvider>
    </HashRouter>
  </React.StrictMode>,
);
