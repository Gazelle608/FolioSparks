import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { router } from "./router";
// Global styles — this imports fonts.css, tailwind.css,
// variables.css, and typography.css internally
// CSS is handled by the bundler; TypeScript has no module declaration for it.
// @ts-expect-error -- side-effect CSS import
import "./styles/globals.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root not found in index.html");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
