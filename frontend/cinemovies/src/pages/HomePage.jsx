import { useState } from "react";
import AdminFormsPage from "./AdminFormsPage";
import DashboardPage from "./DashboardPage";

export default function HomePage() {
  const [page, setPage] = useState("home"); // "home" | "admin" | "dashboard"

  // Style des boutons principaux
  const buttonStyle =
    "py-4 px-6 rounded-xl font-bold text-white text-lg transition transform hover:scale-105 shadow-lg";

  if (page === "admin") return <AdminFormsPage />;
  if (page === "dashboard") return <DashboardPage />;

  // Page d’accueil
  return (
    <section className="min-h-screen bg-gray-900 flex flex-col justify-center items-center space-y-12 p-4">
      <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-center">
        🎬 Bienvenue dans CineMovies
      </h1>
      <p className="text-white text-center max-w-xl">
        Choisissez votre espace : Administration pour gérer les films, les utilisateurs, 
        les notes et les reviews, ou Dashboard pour consulter les statistiques.
      </p>

      <div className="flex flex-col sm:flex-row gap-8">
        <button
          className={`${buttonStyle} bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500`}
          onClick={() => setPage("admin")}
        >
          Accéder à l’Admin
        </button>
        <button
          className={`${buttonStyle} bg-gradient-to-r from-green-500 via-lime-500 to-cyan-500`}
          onClick={() => setPage("dashboard")}
        >
          Voir le Dashboard
        </button>
      </div>
    </section>
  );
}