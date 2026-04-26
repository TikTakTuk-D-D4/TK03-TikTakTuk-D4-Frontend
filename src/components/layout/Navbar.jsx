export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow-lg">
      <h1 className="text-xl font-bold text-pink-500">TikTakTuk 🎵</h1>

      <div className="flex gap-6">
        <a href="/dashboard" className="hover:text-pink-400">Dashboard</a>
        <a href="/venues" className="hover:text-pink-400">Venue</a>
        <a href="/events" className="hover:text-pink-400">Event</a>
      </div>

      <button className="bg-pink-500 px-4 py-2 rounded-lg hover:bg-pink-600">
        Logout
      </button>
    </nav>
  );
}