import { Link } from "react-router-dom";

function RegisterPage() {
  return (
    <section className="auth-screen register-screen">
      <div className="auth-pane auth-pane-centered">
        <div className="auth-head">
          <h2>Register</h2>
          <p>Halaman register belum dipakai untuk TK03 karena autentikasi masih mode demo.</p>
        </div>

        <div className="surface-card pad">
          <p className="helper-text">
            Gunakan login demo untuk menguji role Admin, Organizer, atau Customer.
          </p>
        </div>

        <Link className="btn btn-primary" to="/login">
          Kembali ke Login
        </Link>
      </div>
    </section>
  );
}

export default RegisterPage;
