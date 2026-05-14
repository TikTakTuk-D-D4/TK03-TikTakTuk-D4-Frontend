import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function AppShell({ children }) {
  return (
    <div className="flex h-screen w-full bg-bg text-ink overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppShell;
