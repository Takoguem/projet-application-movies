import { useEffect } from 'react';
import Navbar from './Navbar';
import useAppStore from '../store/useAppStore';

function Layout({ children }) {
  const loadInitialData = useAppStore((state) => state.loadInitialData);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

export default Layout;