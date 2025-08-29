export function PostDetailSkeleton() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6"></div>
        
        <div className="space-y-6">
          <div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          
          <div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-2"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          
          <div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-14 mb-2"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          
          <div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-10 mb-2"></div>
            <div className="flex space-x-2">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-18"></div>
            </div>
          </div>
          
          <div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <div className="h-10 bg-blue-200 dark:bg-blue-700 rounded w-32"></div>
            <div className="h-10 bg-red-200 dark:bg-red-700 rounded w-28"></div>
          </div>
        </div>
      </div>
    </div>
  );
}