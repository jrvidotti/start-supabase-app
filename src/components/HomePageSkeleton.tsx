export function HomePageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 animate-pulse">
        <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="border rounded-lg overflow-hidden">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700"></div>
              
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3"></div>
                </div>
                
                <div className="mb-3">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
                
                <div className="mb-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-12"></div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-14"></div>
                </div>
                
                <div className="flex items-center">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4 mr-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}