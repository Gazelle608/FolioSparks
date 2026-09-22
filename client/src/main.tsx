/// <reference types="vite/client" />

import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { router } from "./router";

// CSS — Vite handles this at build time, types come from `vite/client`
import "./styles/globals.css";

// Fonts — bundled via @fontsource
import "@fontsource/merriweather/400.css";
import "@fontsource/merriweather/700.css";
import "@fontsource-variable/inter/index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root not found in index.html");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
