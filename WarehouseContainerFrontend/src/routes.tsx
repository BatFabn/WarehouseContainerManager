import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import RackPage from "./components/RackPage";
import Dashboard from "./components/Dashboard";
import MemberManagement from "./components/Members";
import ChooseAccount from "./components/ChooseAccount";

const router = createBrowserRouter([
  {
    children: [
      { path: "/", element: <App /> },
      { path: "/account", element: <ChooseAccount /> },
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/members", element: <MemberManagement /> },
      {
        path: "/rack/:containerId/:rackId",
        element: <RackPage />,
      },
    ],
  },
]);

export default router;
