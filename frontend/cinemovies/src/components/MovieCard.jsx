import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function MovieCard({ movie, averageRating }) {
  const isTop = averageRating >= 4.5;

  return (
    <motion.article
      whileHover={{ y: -5, scale: 1.01 }}
      className="card-surface relative overflow-hidden rounded-xl shadow-xl transition"
    >
      <img
        src={movie.image_url || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800'}
        alt={movie.title}
        className="h-56 w-full object-cover"
      />
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-white">{movie.title}</h3>
          {isTop && <span className="rounded-full bg-emerald-500 px-2 py-1 text-xs text-white">Top Rated</span>}
        </div>
        <p className="text-sm text-slate-300">
          {movie.genre} • {movie.year}
        </p>
        <p className="text-sm text-amber-300">★ {averageRating.toFixed(1)}</p>
        <Link
          to={`/movies/${movie.id}`}
          className="inline-block rounded bg-brand-500 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          Voir détails
        </Link>
      </div>
    </motion.article>
  );
}

export default MovieCard;