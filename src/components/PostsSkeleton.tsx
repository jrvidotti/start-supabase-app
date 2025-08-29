export function PostsSkeleton() {
  return (
    <div className="flex h-full">
      <div className="w-80 flex-shrink-0 p-4 border-r border-gray-200 dark:border-gray-700">
        <div className="mb-4">
          <div className="inline-block px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-full h-10"></div>
        </div>
        <ul className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <li key={index} className="border rounded-lg p-3 animate-pulse">
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="flex space-x-2 text-xs">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
                <div className="flex space-x-1">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-12"></div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-14"></div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="inline-block w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Loading posts...</div>
        </div>
      </div>
    </div>
  );
}