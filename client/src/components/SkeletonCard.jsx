const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
    <div className="skeleton h-44 w-full" />
    <div className="p-4 space-y-2">
      <div className="skeleton h-4 w-16" />
      <div className="skeleton h-5 w-3/4" />
      <div className="skeleton h-4 w-1/2" />
    </div>
  </div>
);

export default SkeletonCard;
