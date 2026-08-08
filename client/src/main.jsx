import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import { rfqApi } from "./services/rfqApi";
import App from "./App.jsx";
import "./index.css";

const store = configureStore({
  reducer: { [rfqApi.reducerPath]: rfqApi.reducer },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(rfqApi.middleware),
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><Provider store={store}><BrowserRouter><App /></BrowserRouter></Provider></React.StrictMode>
);
