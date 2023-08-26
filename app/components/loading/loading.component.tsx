const LoadingSkeleton = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-900"></div>
    </div>
  );
};

export default LoadingSkeleton;
