import React, { useState } from "react";
import { Trash } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import NavBar from "./NavBar";

interface Member {
  name: string;
  email: string;
  role: string;
}

interface Group {
  name: string;
  members: Member[];
}

const MemberManagement = ({ verified }: { verified: () => void }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [groupName, setGroupName] = useState<string>("");

  const addMember = () => {
    if (name && email && role && !members.some((m) => m.email === email)) {
      setMembers([...members, { name, email, role }]);
      setName("");
      setEmail("");
      setRole("");
    }
  };

  const removeMember = (emailToRemove: string) => {
    setMembers(members.filter((member) => member.email !== emailToRemove));
  };

  const addGroup = () => {
    if (groupName && !groups.some((g) => g.name === groupName)) {
      setGroups([
        ...groups,
        {
          name: groupName,
          members: members.filter((m) => m.role === groupName),
        },
      ]);
      setGroupName("");
    }
  };

  const removeGroup = (groupNameToRemove: string) => {
    setGroups(groups.filter((group) => group.name !== groupNameToRemove));
  };

  return (
    <div className="bg-dark text-light rounded">
      <NavBar verified={verified} />
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
            <input
              type="text"
              className="form-control"
              placeholder="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
        </div>
        <button className="btn btn-primary mt-3 w-100" onClick={addMember}>
          Add Member
        </button>
      </div>

      <div className="container card bg-secondary p-3 mb-4">
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <button className="btn btn-success w-100 mb-2" onClick={addGroup}>
          Add Group
        </button>
      </div>

      {groups.map((group, idx) => (
        <div key={idx} className="card bg-secondary p-3 mb-3">
          <h5>
            {group.name}
            <button
              className="btn btn-sm btn-danger ms-2"
              onClick={() => removeGroup(group.name)}
            >
              Remove Group
            </button>
          </h5>
          {group.members.length === 0 ? (
            <p className="text-muted">No members in this group.</p>
          ) : (
            <ul className="list-group">
              {group.members.map((member, index) => (
                <li
                  key={index}
                  className="list-group-item bg-dark text-light d-flex justify-content-between align-items-center"
                >
                  {member.name} ({member.email}) - {member.role}
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => removeMember(member.email)}
                  >
                    <Trash size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default MemberManagement;
