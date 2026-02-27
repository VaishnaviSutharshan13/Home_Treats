import React from 'react';
import Header from './components/Header';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow p-6">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
          Welcome to the Hostel Management System
        </h2>
        <p className="text-base md:text-lg">
          This sample application demonstrates a React + Vite setup with
          TailwindCSS, Material‑UI icons, and a clean folder structure. Resize
          the browser to see responsive typography using the global breakpoints
          defined in <code>tailwind.config.cjs</code> or via CSS variables.
        </p>
      </main>
    </div>
  );
}

export default App;
