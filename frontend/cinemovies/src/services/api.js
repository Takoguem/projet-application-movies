import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

// Movies
export const moviesApi = {
  getAll: () => api.get("/movies"),
  create: (data) => api.post("/movies", data),
};

// Ratings
export const ratingsApi = {
  create: (data) => api.post("/ratings", data),
};

// Reviews
export const reviewsApi = {
  getAll: () => api.get("/reviews"),
  create: (data) => api.post("/reviews", data),
};

// Users
export const usersApi = {
  getAll: () => api.get("/users"),
  create: (data) => api.post("/users", data),
};