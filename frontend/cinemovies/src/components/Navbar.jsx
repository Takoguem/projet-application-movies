import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

function Navbar() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(true);

  const toggleTheme = () => {
    const nextValue = !dark;
    setDark(nextValue);
    document.documentElement.classList.toggle('light', !nextValue);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="text-xl font-bold tracking-wide text-brand-400">
          MovieHub
        </Link>
        <button className="sm:hidden" onClick={() => setOpen((prev) => !prev)}>
          ☰
        </button>
        <nav
          className={`${open ? 'flex' : 'hidden'} absolute left-0 top-14 w-full flex-col gap-2 bg-slate-900 p-4 sm:static sm:flex sm:w-auto sm:flex-row sm:items-center sm:bg-transparent sm:p-0`}
        >
          {[
            ['/', 'Accueil'],
            ['/dashboard', 'Dashboard'],
            ['/forms', 'Formulaires'],
          ].map(([path, label]) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `rounded px-3 py-2 text-sm ${isActive ? 'bg-brand-500 text-white' : 'text-slate-300 hover:bg-slate-800'}`
              }
            >
              {label}
            </NavLink>
          ))}
          <button
            onClick={toggleTheme}
            className="rounded bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"
          >
            {dark ? '☀️ Clair' : '🌙 Sombre'}
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;