"use client";

interface HeaderProps {
  onLogout: () => void;
}

export default function Header({ onLogout }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-6 rounded-2xl shadow-md w-full max-w-2xl mb-8 text-center">
      <h1 className="text-3xl font-extrabold tracking-tight">
        Todo Adventure
      </h1>
      <p className="text-sm mt-2 text-orange-50">
        Current Time: {new Date().toLocaleString("en-US", { timeZone: "Africa/Nairobi" })}
      </p>
      <button
        onClick={onLogout}
        className="mt-4 bg-white text-blue-900 px-5 py-2 rounded-full border-none cursor-pointer hover:bg-yellow-100 hover:scale-105 transition-all"
      >
        Log Out
      </button>
    </header>
  );
}