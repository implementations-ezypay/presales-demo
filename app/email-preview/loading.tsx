export default function EmailPreviewLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto w-full">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-12 h-32 animate-pulse" />
          <div className="px-8 py-12 space-y-4">
            <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-slate-200 rounded animate-pulse w-full" />
            <div className="h-4 bg-slate-200 rounded animate-pulse w-5/6" />
            <div className="mt-8 h-12 bg-blue-600 rounded animate-pulse w-48 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  )
}
