import { createBrowserRouter } from "react-router";
import { MainPage } from "./pages/MainPage";
import { AboutPage } from "./pages/AboutPage";
import { BatchPage } from "./pages/BatchPage";
import { Layout } from "./components/Layout";
import { Navigate } from "react-router";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: MainPage },
      { path: "about", Component: AboutPage },
      { path: "batch", Component: BatchPage },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);