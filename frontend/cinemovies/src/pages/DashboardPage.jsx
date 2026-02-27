import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function DashboardPage() {
  //  Données simulées (remplace useAppStore)
  const users = [{ id: 1, username: 'Bruel' }];
  const ratings = [
    { user_id: 1, movie_id: 1, score: 4 },
    { user_id: 1, movie_id: 2, score: 5 },
  ];
  const movies = [
    { id: 1, title: 'Inception' },
    { id: 2, title: 'Titanic' },
  ];
  const reviews = [
    { id: 1, user_id: 1, movie_id: 1, content: 'Super film !' },
    { id: 2, user_id: 1, movie_id: 2, content: 'Très émouvant.' },
  ];

  // Fonctions simulées
  const moviesRatedByUser = (userId) =>
    ratings
      .filter((r) => r.user_id === userId)
      .map((r) => movies.find((m) => m.id === r.movie_id));

  const reviewsByUser = (userId) =>
    reviews.filter((r) => r.user_id === userId);

  const userAverageRating = (userId) => {
    const userRatings = ratings.filter((r) => r.user_id === userId);
    if (userRatings.length === 0) return 0;
    return userRatings.reduce((sum, r) => sum + r.score, 0) / userRatings.length;
  };

  const selectedUser = users[0];
  const ratedMovies = moviesRatedByUser(selectedUser.id);
  const userReviews = reviewsByUser(selectedUser.id);
  const average = userAverageRating(selectedUser.id);

  const chartData = {
    labels: ratedMovies.map((m) => m.title),
    datasets: [
      {
        label: 'Notes',
        data: ratedMovies.map((movie) => {
          const found = ratings.find(
            (r) => r.user_id === selectedUser.id && r.movie_id === movie.id
          );
          return found?.score || 0;
        }),
        backgroundColor: '#e11d48',
      },
    ],
  };

  return (
    <section className="space-y-6 p-4 min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold">Dashboard de {selectedUser.username}</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-4 bg-gray-800">
          <p className="text-sm text-gray-400">Films notés</p>
          <p className="text-3xl font-bold">{ratedMovies.length}</p>
        </div>
        <div className="rounded-xl border p-4 bg-gray-800">
          <p className="text-sm text-gray-400">Reviews écrites</p>
          <p className="text-3xl font-bold">{userReviews.length}</p>
        </div>
        <div className="rounded-xl border p-4 bg-gray-800">
          <p className="text-sm text-gray-400">Moyenne perso</p>
          <p className="text-3xl font-bold text-amber-300">{average.toFixed(1)}</p>
        </div>
      </div>

      <div className="rounded-xl border p-4 bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold">Statistiques de notes</h2>
        <Bar
          data={chartData}
          options={{ responsive: true, plugins: { legend: { display: false } } }}
        />
      </div>

      <div className="rounded-xl border p-4 bg-gray-800">
        <h2 className="mb-2 text-xl font-semibold">Reviews utilisateur</h2>
        <ul className="space-y-2">
          {userReviews.map((review) => (
            <li key={review.id} className="rounded border p-3 text-gray-200">
              {review.content}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default DashboardPage;