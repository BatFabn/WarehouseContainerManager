import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import NavBar from "./NavBar";
import { useNavigate } from "react-router-dom";
import { useUserActionState } from "../store/userActionState";

interface Member {
  name: string;
  email: string;
  role: string;
  actions: string[];
}

const MemberManagement = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const { getUserActionState } = useUserActionState();
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("user")) navigate("/");
  }, [navigate]);

  const addMember = () => {
    if (name && email && role && !members.some((m) => m.email === email)) {
      const actions: string[] = [];
      setMembers([...members, { name, email, role, actions }]);
      setName("");
      setEmail("");
      setRole("");
    }
  };

  return (
    <div className="bg-dark text-light rounded">
      <NavBar />
      <h2 className="text-center mb-4">Admin Members Management</h2>

      <div className="container card bg-secondary p-3 mb-4">
        <div className="row g-3">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <select
              className="form-control"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">Select Role </option>
              <option value="View only">View only</option>
              <option value="View and Manage only">View and Manage only</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary mt-3 w-100" onClick={addMember}>
          Add Member
        </button>
      </div>

      {members.length > 0 && (
        <div className="container p-3">
          <h4 className="text-light">Current Members</h4>
          <div className="table-responsive">
            <table className="table table-dark table-striped table-bordered">
              <thead>
                <tr>
                  <th style={{ width: "3%" }}>Sl. No.</th>
                  <th style={{ width: "20%" }}>Name</th>
                  <th style={{ width: "25%" }}>Email</th>
                  <th style={{ width: "20%" }}>Role</th>
                  <th style={{ width: "30%" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{member.name}</td>
                    <td>{member.email}</td>
                    <td>
                      <select
                        className="form-select"
                        value={member.role}
                        onChange={(e) => {
                          const newRole = e.target.value;
                          setMembers((prev) =>
                            prev.map((m, i) =>
                              i === index
                                ? {
                                    ...m,
                                    role: newRole,
                                    actions: [
                                      ...(m.actions || []),
                                      `Changed role to "${newRole}"`,
                                    ],
                                  }
                                : m
                            )
                          );
                        }}
                      >
                        <option>View only</option>
                        <option>View and Manage only</option>
                      </select>
                    </td>
                    <td>
                      {getUserActionState(
                        JSON.parse(localStorage.getItem("user") ?? "")[0]
                      ) ? (
                        <ul className="list-unstyled mb-0">
                          {getUserActionState(
                            JSON.parse(localStorage.getItem("user")!)[0]
                          )!.map((action, i) => (
                            <li key={i}>{action}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted">No logs</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberManagement;
