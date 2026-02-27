import { useState } from 'react';
import { moviesApi, ratingsApi, reviewsApi, usersApi } from './services/api';



const initialForms = {
  user: { name: '', email: '' },
  movie: { title: '', genre: '', year: '', image_url: '' },
  review: { user_id: '', movie_id: '', content: '' },
  rating: { user_id: '', movie_id: '', score: '' },
};

function AdminFormsPage() {
  const [forms, setForms] = useState(initialForms);
  const users = [];
  const movies = [];

  const updateForm = (form, field, value) => {
    setForms((prev) => ({ ...prev, [form]: { ...prev[form], [field]: value } }));
  };

  const submitUser = async (e) => {
    e.preventDefault();
    if (!forms.user.name || !forms.user.email.includes('@')) {
      alert('Nom et email valide requis.');
      return;
    }
    await usersApi.create(forms.user);
    alert('Utilisateur créé');
    setForms((prev) => ({ ...prev, user: initialForms.user }));
  };

  const submitMovie = async (e) => {
    e.preventDefault();
    if (!forms.movie.title || !forms.movie.genre || Number(forms.movie.year) < 1888) {
      alert('Veuillez renseigner un film valide.');
      return;
    }
    await moviesApi.create({ ...forms.movie, year: Number(forms.movie.year) });
    alert('Film ajouté');
    setForms((prev) => ({ ...prev, movie: initialForms.movie }));
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!forms.review.user_id || !forms.review.movie_id || forms.review.content.length < 6) {
      alert('Review invalide');
      return;
    }
    await reviewsApi.create({
      ...forms.review,
      user_id: Number(forms.review.user_id),
      movie_id: Number(forms.review.movie_id),
    });
    alert('Review ajoutée');
    setForms((prev) => ({ ...prev, review: initialForms.review }));
  };

  const submitRating = async (e) => {
    e.preventDefault();
    const score = Number(forms.rating.score);
    if (!forms.rating.user_id || !forms.rating.movie_id || score < 1 || score > 5) {
      alert('Note invalide (1-5).');
      return;
    }
    await ratingsApi.create({
      ...forms.rating,
      user_id: Number(forms.rating.user_id),
      movie_id: Number(forms.rating.movie_id),
      score,
    });
    alert('Note ajoutée');
    setForms((prev) => ({ ...prev, rating: initialForms.rating }));
  };

  return (
    <section className="p-6 bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-6 text-center">🎬 Formulaires d'administration</h1>
      
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-2">
        
        {/* Formulaire utilisateur */}
        <form onSubmit={submitUser} className="bg-gradient-to-br from-purple-700 to-purple-900 shadow-lg rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Créer un utilisateur</h2>
          <input placeholder="Nom" value={forms.user.name} onChange={(e) => updateForm('user', 'name', e.target.value)}
            className="w-full rounded border border-purple-300 bg-purple-950 p-3 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          <input placeholder="Email" value={forms.user.email} onChange={(e) => updateForm('user', 'email', e.target.value)}
            className="w-full rounded border border-purple-300 bg-purple-950 p-3 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          <button className="w-full rounded bg-white text-purple-900 font-semibold py-2 hover:bg-purple-50 transition">Créer</button>
        </form>

        {/* Formulaire film */}
        <form onSubmit={submitMovie} className="bg-gradient-to-br from-indigo-700 to-indigo-900 shadow-lg rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Ajouter un film</h2>
          {['title','genre','year','image_url'].map(f =>
            <input key={f} placeholder={f} value={forms.movie[f]} onChange={(e)=>updateForm('movie',f,e.target.value)}
              className="w-full rounded border border-indigo-300 bg-indigo-950 p-3 text-white placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          )}
          <button className="w-full rounded bg-white text-indigo-900 font-semibold py-2 hover:bg-indigo-50 transition">Ajouter</button>
        </form>

        {/* Formulaire review */}
        <form onSubmit={submitReview} className="bg-gradient-to-br from-green-700 to-green-900 shadow-lg rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Ajouter une review</h2>
          <input placeholder="User ID" value={forms.review.user_id} onChange={(e)=>updateForm('review','user_id',e.target.value)}
            className="w-full rounded border border-green-300 bg-green-950 p-3 text-white placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500" />
          <input placeholder="Movie ID" value={forms.review.movie_id} onChange={(e)=>updateForm('review','movie_id',e.target.value)}
            className="w-full rounded border border-green-300 bg-green-950 p-3 text-white placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500" />
          <textarea placeholder="Contenu" value={forms.review.content} onChange={(e)=>updateForm('review','content',e.target.value)}
            className="w-full rounded border border-green-300 bg-green-950 p-3 text-white placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500" />
          <button className="w-full rounded bg-white text-green-900 font-semibold py-2 hover:bg-green-50 transition">Publier</button>
        </form>

        {/* Formulaire rating */}
        <form onSubmit={submitRating} className="bg-gradient-to-br from-yellow-700 to-yellow-900 shadow-lg rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Ajouter une note</h2>
          <input placeholder="User ID" value={forms.rating.user_id} onChange={(e)=>updateForm('rating','user_id',e.target.value)}
            className="w-full rounded border border-yellow-300 bg-yellow-950 p-3 text-white placeholder-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
          <input placeholder="Movie ID" value={forms.rating.movie_id} onChange={(e)=>updateForm('rating','movie_id',e.target.value)}
            className="w-full rounded border border-yellow-300 bg-yellow-950 p-3 text-white placeholder-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
          <input type="number" min="1" max="5" placeholder="Score" value={forms.rating.score} onChange={(e)=>updateForm('rating','score',e.target.value)}
            className="w-full rounded border border-yellow-300 bg-yellow-950 p-3 text-white placeholder-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
          <button className="w-full rounded bg-white text-yellow-900 font-semibold py-2 hover:bg-yellow-50 transition">Enregistrer</button>
        </form>
      </div>
    </section>
  );
}

export default AdminFormsPage;