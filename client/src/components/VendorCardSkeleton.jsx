function VendorCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-full bg-slate-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-slate-200 rounded w-2/3" />
          <div className="h-3 bg-slate-100 rounded w-1/2" />
        </div>
        <div className="w-11 h-11 rounded-full bg-slate-100 shrink-0" />
      </div>
      <div className="h-3 bg-slate-100 rounded w-full mb-2" />
      <div className="h-3 bg-slate-100 rounded w-4/5 mb-4" />
      <div className="flex gap-2">
        <div className="h-9 bg-slate-100 rounded-lg flex-1" />
        <div className="h-9 bg-slate-100 rounded-lg flex-1" />
      </div>
    </div>
  );
}

export default VendorCardSkeleton;