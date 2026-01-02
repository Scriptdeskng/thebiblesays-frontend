export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="w-12 h-12 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
    </div>
  );
}
