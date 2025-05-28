'use client'

export default function LoadingSkeleton() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-pulse">
      <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-950 rounded" />
      
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-950 p-6 space-y-8">
        {/* Profile Image Skeleton */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-32 h-32 rounded-full bg-neutral-200 dark:bg-neutral-950" />
          <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-950 rounded" />
        </div>
        
        {/* Personal Info Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-950 rounded" />
              <div className="h-10 bg-neutral-200 dark:bg-neutral-950 rounded" />
            </div>
          ))}
        </div>
        
        {/* Contact Info Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-950 rounded" />
              <div className="h-10 bg-neutral-200 dark:bg-neutral-950 rounded" />
            </div>
          ))}
        </div>
        
        {/* Address Skeleton */}
        <div className="space-y-4">
          <div className="h-6 w-40 bg-neutral-200 dark:bg-neutral-950 rounded" />
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-neutral-200 dark:bg-neutral-950 rounded" />
            ))}
          </div>
        </div>
        
        {/* Password Section Skeleton */}
        <div className="space-y-4">
          <div className="h-6 w-40 bg-neutral-200 dark:bg-neutral-950 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-950 rounded" />
                <div className="h-10 bg-neutral-200 dark:bg-neutral-950 rounded" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Buttons Skeleton */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-neutral-200 dark:border-neutral-950">
          <div className="h-10 w-24 bg-neutral-200 dark:bg-neutral-950 rounded" />
          <div className="h-10 w-32 bg-neutral-200 dark:bg-neutral-950 rounded" />
        </div>
      </div>
    </div>
  )
}
