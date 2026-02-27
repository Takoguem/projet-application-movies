
import { moviesApi, ratingsApi, reviewsApi, usersApi } from './api';

const average = (values) => {
  if (!values.length) return 0;
  return values.reduce((acc, value) => acc + value, 0) / values.length;
};

const useAppStore = create((set, get) => ({
  users: [],
  movies: [],
  ratings: [],
  reviews: [],
  loading: false,
  async loadInitialData() {
    set({ loading: true });
    try {
      const [usersRes, moviesRes, ratingsRes, reviewsRes] = await Promise.all([
        usersApi.getAll(),
        moviesApi.getAll(),
        ratingsApi.getAll(),
        reviewsApi.getAll(),
      ]);

      set({
        users: usersRes.data || [],
        movies: moviesRes.data || [],
        ratings: ratingsRes.data || [],
        reviews: reviewsRes.data || [],
      });
    } finally {
      set({ loading: false });
    }
  },
  movieAverageRating(movieId) {
    const { ratings } = get();
    const movieRatings = ratings.filter((rating) => Number(rating.movie_id) === Number(movieId));
    return average(movieRatings.map((rating) => Number(rating.score || rating.rating || 0)));
  },
  userAverageRating(userId) {
    const { ratings } = get();
    const userRatings = ratings.filter((rating) => Number(rating.user_id) === Number(userId));
    return average(userRatings.map((rating) => Number(rating.score || rating.rating || 0)));
  },
  moviesRatedByUser(userId) {
    const { movies, ratings } = get();
    const movieIds = new Set(
      ratings.filter((rating) => Number(rating.user_id) === Number(userId)).map((rating) => Number(rating.movie_id))
    );
    return movies.filter((movie) => movieIds.has(Number(movie.id)));
  },
  reviewsByUser(userId) {
    const { reviews } = get();
    return reviews.filter((review) => Number(review.user_id) === Number(userId));
  },
}));

export default useAppStore;