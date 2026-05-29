export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="motion-safe:animate-spin rounded-full h-6 w-6 border-2 border-border border-t-primary" />
    </div>
  )
}
