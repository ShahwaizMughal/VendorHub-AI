import React from 'react';

export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      aria-busy="true"
      aria-label="Loading"
      className={`animate-pulse bg-slate-800/60 rounded-xl ${className}`}
      {...props}
    />
  );
};

export const ProfileSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6" aria-busy="true" aria-label="Loading profile settings">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center gap-6">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      </div>
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-36" />
      </div>
    </div>
  );
};

export default Skeleton;
