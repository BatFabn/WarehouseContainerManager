import React, { useState } from "react";
import AnimatedText from "./AnimatedText";

interface Props {
  verified: () => void;
}

const LoginPage = ({ verified }: Props) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Basic validation
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError(null);

    // Perform login logic here
    console.log("Email:", email);
    console.log("Password:", password);
    alert("Login successful!");
    verified();
  };

  return (
    <div className="hstack d-flex justify-content-evenly">
      <AnimatedText />
      <div
        className="d-flex justify-content-center align-items-center vh-100"
        // style={{ paddingLeft: "30rem" }}
      >
        <div className="card shadow p-4" style={{ width: "40rem" }}>
          <h3 className="card-title text-center mb-3">Login</h3>
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
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
