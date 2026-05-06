function SkeletonStats() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700 animate-pulse">
      <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-5" />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-xl p-3 text-center bg-gray-100 dark:bg-gray-700">
            <div className="h-10 w-10 mx-auto bg-gray-300 dark:bg-gray-600 rounded-full mb-2" />
            <div className="h-6 w-12 mx-auto bg-gray-300 dark:bg-gray-600 rounded" />
            <div className="h-4 w-16 mx-auto bg-gray-300 dark:bg-gray-600 rounded mt-1" />
          </div>
        ))}
      </div>
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-3" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="mb-3">
          <div className="flex justify-between mb-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8" />
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5" />
        </div>
      ))}
    </div>
  );
}

export default SkeletonStats;