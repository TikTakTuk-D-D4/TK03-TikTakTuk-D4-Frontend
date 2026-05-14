import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";

import DashboardPage from "../features/dashboard/pages/DashboardPage";
import ProfilePage from "../features/dashboard/pages/ProfilePage";
import VenuePage from "../features/venue-event/pages/VenuePage";
import VenueFormPage from "../features/venue-event/pages/VenueFormPage";
import EventPage from "../features/venue-event/pages/EventPage";
import EventFormPage from "../features/venue-event/pages/EventFormPage";
import EventArtistPage from "../features/venue-event/pages/EventArtistPage";

import ArtistPage from "../features/artist-ticket-category/pages/ArtistPage";
import TicketCategoryPage from "../features/artist-ticket-category/pages/TicketCategoryPage";
import OrderPage from "../features/order-promotion/pages/OrderPage";
import PromotionPage from "../features/order-promotion/pages/PromotionPage";
import TicketPage from "../features/ticket-seat/pages/TicketPage";
import SeatPage from "../features/ticket-seat/pages/SeatPage";
import { getCurrentUser } from "../features/auth/services/authService";

function PageLayout({ children }) {
  return (
    <div className="app-frame">
      <Navbar />
      <main className="page-container">{children}</main>
    </div>
  );
}

// Redirect ke /login jika belum login
function RequireAuth({ children }) {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  return <PageLayout>{children}</PageLayout>;
}

// Redirect ke /dashboard jika role tidak termasuk yang diizinkan
function RequireRole({ roles, children }) {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  const normalizedRole = user.role === "administrator" ? "admin" : user.role;
  if (!roles.includes(normalizedRole)) return <Navigate to="/dashboard" replace />;
  return <PageLayout>{children}</PageLayout>;
}

function TicketRedirect() {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  const role = user.role === "administrator" ? "admin" : user.role;
  if (role === "customer") return <Navigate to="/my-tickets" replace />;
  return <Navigate to="/manage-tickets" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Semua role yang sudah login */}
      <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
      <Route path="/venues" element={<RequireAuth><VenuePage /></RequireAuth>} />
      <Route path="/events" element={<RequireAuth><EventPage /></RequireAuth>} />
      <Route path="/artists" element={<RequireAuth><ArtistPage /></RequireAuth>} />
      <Route path="/ticket-categories" element={<RequireAuth><TicketCategoryPage /></RequireAuth>} />
      <Route path="/orders" element={<RequireAuth><OrderPage /></RequireAuth>} />
      <Route path="/promotions" element={<RequireAuth><PromotionPage /></RequireAuth>} />
      <Route path="/my-tickets" element={<RequireAuth><TicketPage /></RequireAuth>} />

      {/* Hanya admin dan organizer */}
      <Route
        path="/venues/create"
        element={<RequireRole roles={["admin", "organizer"]}><VenueFormPage /></RequireRole>}
      />
      <Route
        path="/venues/edit/:id"
        element={<RequireRole roles={["admin", "organizer"]}><VenueFormPage /></RequireRole>}
      />
      <Route
        path="/events/:id/artists"
        element={<RequireRole roles={["admin", "organizer"]}><EventArtistPage /></RequireRole>}
      />
      <Route
        path="/events/create"
        element={<RequireRole roles={["admin", "organizer"]}><EventFormPage /></RequireRole>}
      />
      <Route
        path="/events/edit/:id"
        element={<RequireRole roles={["admin", "organizer"]}><EventFormPage /></RequireRole>}
      />
      <Route
        path="/manage-tickets"
        element={<RequireRole roles={["admin", "organizer"]}><TicketPage /></RequireRole>}
      />
      <Route
        path="/seats"
        element={<RequireRole roles={["admin", "organizer"]}><SeatPage /></RequireRole>}
      />

      {/* Redirect /tickets ke halaman yang sesuai */}
      <Route path="/tickets" element={<TicketRedirect />} />
    </Routes>
  );
}

export default AppRoutes;
