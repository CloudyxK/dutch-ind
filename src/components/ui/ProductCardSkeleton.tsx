export default function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-brand-gray-800 aspect-[3/4] w-full" />
      <div className="mt-2 space-y-1.5">
        <div className="bg-brand-gray-800 h-3 w-3/4 rounded" />
        <div className="bg-brand-gray-800 h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}
