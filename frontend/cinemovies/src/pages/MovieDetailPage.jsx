import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAppStore from '../store/useAppStore';
import { ratingsApi, reviewsApi, sentimentApi } from '../services/api';
import StarRating from '../components/StarRating';
import { sentimentClass } from '../utils/helpers';

function MovieDetailPage() {
  const { id } = useParams();
  const { movies, reviews, ratings, users, movieAverageRating, loadInitialData } = useAppStore((state) => ({
    movies: state.movies,
    reviews: state.reviews,
    ratings: state.ratings,
    users: state.users,
    movieAverageRating: state.movieAverageRating,
    loadInitialData: state.loadInitialData,
  }));

  const movie = movies.find((item) => Number(item.id) === Number(id));
  const movieReviews = reviews.filter((review) => Number(review.movie_id) === Number(id));
  const [reviewText, setReviewText] = useState('');
  const [sentiment, setSentiment] = useState('neutral');
  const [score, setScore] = useState(0);

  const suggestions = useMemo(() => {
    if (!movie) return [];
    return movies.filter((item) => item.genre === movie.genre && Number(item.id) !== Number(movie.id)).slice(0, 4);
  }, [movie, movies]);

  if (!movie) return <p className="text-slate-200">Film introuvable.</p>;

  const handleReviewChange = async (value) => {
    setReviewText(value);
    if (!value.trim()) {
      setSentiment('neutral');
      return;
    }
    try {
      const response = await sentimentApi.analyze(value);
      setSentiment(response.data?.sentiment || response.data?.label || 'neutral');
    } catch {
      setSentiment('neutral');
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();
    if (reviewText.trim().length < 6) {
      toast.error('La review doit contenir au moins 6 caractères.');
      return;
    }
    const defaultUserId = users[0]?.id;
    if (!defaultUserId) {
      toast.error('Créez un utilisateur avant d’ajouter une review.');
      return;
    }
    await reviewsApi.create({ movie_id: Number(id), user_id: defaultUserId, content: reviewText, sentiment });
    toast.success('Review ajoutée.');
    setReviewText('');
    await loadInitialData();
  };

  const submitRating = async () => {
    const defaultUserId = users[0]?.id;
    if (!defaultUserId || score === 0) {
      toast.error('Sélectionnez un score et assurez-vous qu’un utilisateur existe.');
      return;
    }
    const existingRating = ratings.find(
      (item) => Number(item.user_id) === Number(defaultUserId) && Number(item.movie_id) === Number(id)
    );

    if (existingRating) {
      await ratingsApi.update(existingRating.id, { ...existingRating, score });
      toast.success('Note mise à jour.');
    } else {
      await ratingsApi.create({ movie_id: Number(id), user_id: defaultUserId, score });
      toast.success('Note ajoutée.');
    }

    await loadInitialData();
  };

  return (
    <section className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <img
          src={movie.image_url || 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800'}
          alt={movie.title}
          className="h-96 w-full rounded-xl object-cover"
        />
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-white">{movie.title}</h1>
          <p className="text-slate-300">{movie.description || 'Aucune description disponible.'}</p>
          <p className="text-slate-200">
            Genre: <strong>{movie.genre}</strong> • Année: <strong>{movie.year}</strong>
          </p>
          <p className="text-amber-300">Moyenne: ★ {movieAverageRating(movie.id).toFixed(1)}</p>
          <div className="space-y-2 rounded-xl border border-slate-700 bg-slate-900/50 p-4">
            <h2 className="font-semibold text-white">Votre note</h2>
            <StarRating value={score} onChange={setScore} />
            <button onClick={submitRating} className="rounded bg-brand-500 px-3 py-2 text-sm text-white">
              Enregistrer la note
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-slate-700 bg-slate-900/50 p-4">
          <h2 className="text-xl font-semibold text-white">Reviews</h2>
          {movieReviews.map((review) => (
            <article key={review.id} className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
              <p className="text-slate-200">{review.content}</p>
              <span className={`mt-2 inline-block rounded-full border px-2 py-1 text-xs ${sentimentClass(review.sentiment)}`}>
                Sentiment: {review.sentiment || 'neutral'}
              </span>
            </article>
          ))}
        </div>

        <form onSubmit={submitReview} className="space-y-3 rounded-xl border border-slate-700 bg-slate-900/50 p-4">
          <h2 className="text-xl font-semibold text-white">Ajouter une review</h2>
          <textarea
            value={reviewText}
            onChange={(event) => handleReviewChange(event.target.value)}
            rows={5}
            className="w-full rounded border border-slate-700 bg-slate-950 p-3 text-slate-200"
            placeholder="Écrivez votre avis..."
          />
          <span className={`inline-block rounded-full border px-3 py-1 text-xs ${sentimentClass(sentiment)}`}>
            Analyse sentiment: {sentiment}
          </span>
          <button className="block rounded bg-brand-500 px-3 py-2 text-sm text-white">Publier</button>
        </form>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Films similaires</h2>
        <div className="grid gap-3 md:grid-cols-4">
          {suggestions.map((item) => (
            <div key={item.id} className="rounded-lg border border-slate-700 bg-slate-900/50 p-3">
              <p className="font-semibold text-white">{item.title}</p>
              <p className="text-sm text-slate-300">{item.genre}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default MovieDetailPage;