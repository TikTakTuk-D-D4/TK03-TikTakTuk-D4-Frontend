import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import VenuePage from "../features/venue-event/pages/VenuePage";
import EventPage from "../features/venue-event/pages/EventPage";
import ArtistPage from "../features/artist-ticket-category/pages/ArtistPage";
import TicketCategoryPage from "../features/artist-ticket-category/pages/TicketCategoryPage";
import OrderPage from "../features/order-promotion/pages/OrderPage";
import PromotionPage from "../features/order-promotion/pages/PromotionPage";
import TicketPage from "../features/ticket-seat/pages/TicketPage";
import SeatPage from "../features/ticket-seat/pages/SeatPage";
import { getCurrentUser } from "../features/auth/services/authService";

function ProtectedLayout({ children }) {
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Navbar />
      <main className="page-container">{children}</main>
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedLayout>
            <DashboardPage />
          </ProtectedLayout>
        }
      />

      <Route
        path="/venues"
        element={
          <ProtectedLayout>
            <VenuePage />
          </ProtectedLayout>
        }
      />

      <Route
        path="/events"
        element={
          <ProtectedLayout>
            <EventPage />
          </ProtectedLayout>
        }
      />

      <Route
        path="/artists"
        element={
          <ProtectedLayout>
            <ArtistPage />
          </ProtectedLayout>
        }
      />

      <Route
        path="/ticket-categories"
        element={
          <ProtectedLayout>
            <TicketCategoryPage />
          </ProtectedLayout>
        }
      />

      <Route path="/orders" element={<OrderPage />}/>

      <Route
        path="/promotions"
        element={
          <ProtectedLayout>
            <PromotionPage />
          </ProtectedLayout>
        }
      />

      <Route
        path="/tickets"
        element={
          <ProtectedLayout>
            <TicketPage />
          </ProtectedLayout>
        }
      />

      <Route
        path="/seats"
        element={
          <ProtectedLayout>
            <SeatPage />
          </ProtectedLayout>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
