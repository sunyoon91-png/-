import ThumbnailEditor from "@/components/ThumbnailEditor";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-gray-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-lg font-bold text-gray-900">KYOBO Thumbnail Maker</h1>
          <p className="text-xs text-gray-400">740 × 400 Newsroom Thumbnail Studio</p>
        </div>
      </header>
      <main className="flex-1">
        <ThumbnailEditor />
      </main>
    </div>
  );
}
