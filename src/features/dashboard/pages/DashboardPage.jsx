import { getPageUser } from "../../auth/services/authService";

function DashboardPage() {
  const user = getPageUser();

  return (
    <div className="page">
      <h1>Dashboard</h1>
      <div className="card">
        <p>Username: {user?.username}</p>
        <p>Role: {user?.role}</p>
      </div>
    </div>
  );
}

export default DashboardPage;
