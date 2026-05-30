export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-black">
      <div className="text-center space-y-4 px-6">
        <p className="text-4xl">📶</p>
        <h1 className="text-2xl font-display tracking-widest uppercase text-white">Tidak Ada Koneksi</h1>
        <p className="text-brand-gray-400 text-sm max-w-xs">
          Kamu sedang offline. Periksa koneksi internet dan coba lagi.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2.5 bg-white text-black text-sm font-bold uppercase tracking-widest hover:bg-brand-gray-200 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
