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

function PageLayout({ children }) {
  return (
    <div className="app-frame">
      <Navbar />
      <main className="page-container">{children}</main>
    </div>
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
          <PageLayout>
            <DashboardPage />
          </PageLayout>
        }
      />

      <Route
        path="/venues"
        element={
          <PageLayout>
            <VenuePage />
          </PageLayout>
        }
      />

      <Route
        path="/events"
        element={
          <PageLayout>
            <EventPage />
          </PageLayout>
        }
      />

      <Route
        path="/artists"
        element={
          <PageLayout>
            <ArtistPage />
          </PageLayout>
        }
      />

      <Route
        path="/ticket-categories"
        element={
          <PageLayout>
            <TicketCategoryPage />
          </PageLayout>
        }
      />

      <Route
        path="/orders"
        element={
          <PageLayout>
            <OrderPage />
          </PageLayout>
        }
      />

      <Route
        path="/promotions"
        element={
          <PageLayout>
            <PromotionPage />
          </PageLayout>
        }
      />

      <Route
        path="/tickets"
        element={
          <PageLayout>
            <TicketPage />
          </PageLayout>
        }
      />

      <Route
        path="/seats"
        element={
          <PageLayout>
            <SeatPage />
          </PageLayout>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
