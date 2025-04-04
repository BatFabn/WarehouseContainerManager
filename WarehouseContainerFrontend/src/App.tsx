import React, { useEffect } from "react";
import LoginPage from "./components/LoginPage";
import { useNavigate } from "react-router-dom";

const App: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/dashboard");
  });

  return (
    <div>
      <LoginPage />
    </div>
  );
};

export default App;
