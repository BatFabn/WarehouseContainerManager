import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import ContainerPage from "./components/ContainerPage";
import Dashboard from "./components/Dashboard";

const router = createBrowserRouter([
  {
    path: "/",
    children: [
      { path: "/", element: <App /> },
      { path: "/dashboard", element: <Dashboard verified={() => {}} /> },
      { path: "/container", element: <ContainerPage verified={() => {}} /> },
    ],
  },
]);

export default router;
