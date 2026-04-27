import { mockCategories } from "../../../data/mockCategories";
import { mockEvents } from "../../../data/mockEvents";
import { mockVenues } from "../../../data/mockVenues";

let categoryState = [...mockCategories];

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `cat-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export function getTicketCategories() {
  return [...categoryState];
}

export function createTicketCategory(payload) {
  const category = {
    id: createId(),
    name: payload.name,
    quota: Number(payload.quota),
    price: Number(payload.price),
    eventId: payload.eventId,
  };

  categoryState = [category, ...categoryState];
  return category;
}

export function updateTicketCategory(id, payload) {
  let updated = null;
  categoryState = categoryState.map((category) => {
    if (category.id !== id) return category;
    updated = {
      ...category,
      name: payload.name,
      quota: Number(payload.quota),
      price: Number(payload.price),
    };
    return updated;
  });
  return updated;
}

export function deleteTicketCategory(id) {
  const before = categoryState.length;
  categoryState = categoryState.filter((category) => category.id !== id);
  return categoryState.length < before;
}

export function getEvents() {
  return [...mockEvents];
}

export function getVenues() {
  return [...mockVenues];
}

export function resetTicketCategories() {
  categoryState = [...mockCategories];
}