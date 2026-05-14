import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { authRoutes } from "./routes/auth";
import { venueRoutes } from "./routes/venues";
import { eventRoutes } from "./routes/events";
import { artistRoutes, eventArtistRoutes } from "./routes/artists";
import { ticketCategoryRoutes } from "./routes/ticketCategories";
import { orderRoutes } from "./routes/orders";
import { promotionRoutes } from "./routes/promotions";
import { seatRoutes } from "./routes/seats";
import { ticketRoutes } from "./routes/tickets";

const app = new Elysia()
  .use(cors({ origin: true }))
  .use(authRoutes)
  .use(venueRoutes)
  .use(eventRoutes)
  .use(artistRoutes)
  .use(eventArtistRoutes)
  .use(ticketCategoryRoutes)
  .use(orderRoutes)
  .use(promotionRoutes)
  .use(seatRoutes)
  .use(ticketRoutes)
  .get("/", () => "TikTakTuk API is running")
  .listen(process.env.PORT || 3000);

console.log(
  `TikTakTuk backend running at http://${app.server?.hostname}:${app.server?.port}`
);
