import React, { useEffect, useState } from "react";
import axios from "axios";
import AnimatedText from "./AnimatedText";
import { useNavigate } from "react-router-dom";

const warehouseUrl = import.meta.env.VITE_WAREHOUSE_URL || "Connection error";

const LoginPage = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("user")) navigate("/dashboard");
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError(null);

    const endpoint = isLogin ? "/login" : "/signup";

    try {
      const response = await axios.post(`http://${warehouseUrl}${endpoint}`, {
        email,
        password,
      });

      const token: string = response.data.access_token;
      localStorage.setItem("user", JSON.stringify([email, token]));
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);

      // Most FastAPI responses return error in `detail`
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          // If detail is an array (like from validation errors)
          setError(err.response.data.detail.map((d: any) => d.msg).join(", "));
        } else {
          // Simple string error
          setError(err.response.data.detail);
        }
      } else {
        setError(`${isLogin ? "Login" : "Signup"} failed. Please try again.`);
      }
    }
  };

  return (
    <div className="hstack d-flex justify-content-evenly">
      <AnimatedText />
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="card shadow p-4" style={{ width: "40rem" }}>
          <h3 className="card-title text-center mb-3">
            {isLogin ? "Login" : "Sign Up"}
          </h3>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              {isLogin ? "Login" : "Sign Up"}
            </button>
          </form>
          <div className="text-center mt-3">
            {isLogin ? (
              <>
                Don't have an account?{" "}
                <button
                  className="btn btn-link p-0"
                  onClick={() => setIsLogin(false)}
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  className="btn btn-link p-0"
                  onClick={() => setIsLogin(true)}
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
