import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, UserCheck } from "lucide-react";
import { useCurrentActor } from "../store/currentActor";

interface AccountOption {
  label: string;
  description: string;
  type: "original" | "member";
  onClick: () => void;
}

const ChooseAccount: React.FC = () => {
  const navigate = useNavigate();
  const { updateCurrentActor } = useCurrentActor();
  useEffect(() => {
    localStorage.removeItem("containers_managed");
    if (!localStorage.getItem("user")) navigate("/");
  }, [navigate]);

  const accountOptions: AccountOption[] = [
    {
      label: "My Original Account",
      description: "Access and manage your own containers and racks.",
      type: "original",
      onClick: () => {
        if (!localStorage.getItem("user")) navigate("/");
        updateCurrentActor(
          "Owner",
          JSON.parse(localStorage.getItem("user")!)[0]
        );
        navigate(`/dashboard`);
      },
    },
    {
      label: "Manage for John Doe",
      description: "Manage John’s warehouse as a delegated member.",
      type: "member",
      onClick: () => {
        updateCurrentActor("John", "john.doe@example.com");
        navigate("/dashboard?owner=john.doe@example.com");
      },
    },
    {
      label: "Manage for Jane Smith",
      description: "Act on behalf of Jane with member privileges.",
      type: "member",
      onClick: () => {
        updateCurrentActor("Jane", "jane.smith@example.com");
        navigate("/dashboard?owner=jane.smith@example.com");
      },
    },
  ];

  const renderIcon = (type: "original" | "member") =>
    type === "original" ? (
      <User className="me-3 text-primary" size={32} />
    ) : (
      <UserCheck className="me-3 text-warning" size={32} />
    );

  return (
    <div className="bg-dark text-light min-vh-100 py-5 px-3">
      <div className="container">
        <h2 className="text-center fw-bold mb-5">👤 Choose Account</h2>
        <div className="row justify-content-center">
          <div className="col-md-8">
            {accountOptions.map((option, index) => (
              <div
                key={index}
                className="card bg-secondary text-light mb-4 shadow-sm border-0"
                style={{
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.3s",
                }}
                onClick={option.onClick}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.02)";
                  e.currentTarget.style.boxShadow =
                    "0 0 20px rgba(255,255,255,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div className="card-body d-flex align-items-center">
                  {renderIcon(option.type)}
                  <div>
                    <h5 className="card-title mb-1">{option.label}</h5>
                    <p className="card-text small text-light-emphasis">
                      {option.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div className="text-center mt-4 text-muted small">
              You can switch accounts anytime from the profile menu.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChooseAccount;
