function SkeletonForm() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-xl overflow-hidden animate-pulse">
      <div className="p-6 md:p-8">
        <div className="h-8 w-48 bg-white/20 rounded mb-4" />
        <div className="bg-white/10 rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i}>
                <div className="h-4 w-20 bg-white/30 rounded mb-1" />
                <div className="h-10 bg-white/30 rounded" />
              </div>
            ))}
          </div>
          <div className="h-64 bg-white/20 rounded" />
          <div className="h-10 w-32 bg-white/30 rounded" />
        </div>
      </div>
    </div>
  );
}

export default SkeletonForm;