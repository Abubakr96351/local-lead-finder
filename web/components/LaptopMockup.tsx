export function LaptopMockup({
  screenshotPath,
  alt,
}: {
  screenshotPath?: string;
  alt: string;
}) {
  return (
    <div className="w-full">
      <div className="rounded-t-md border-[6px] border-b-0 border-gray-800 bg-gray-900">
        {screenshotPath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={screenshotPath}
            alt={alt}
            className="aspect-video w-full rounded-t-[2px] object-cover object-top"
          />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center rounded-t-[2px] bg-gray-100 text-xs text-gray-400">
            No screenshot
          </div>
        )}
      </div>
      <div className="relative h-2.5 rounded-b-sm bg-gradient-to-b from-gray-300 to-gray-400">
        <div className="absolute left-1/2 top-0 h-1 w-14 -translate-x-1/2 rounded-b bg-gray-500/60" />
      </div>
      <div className="mx-auto h-1 w-1/3 rounded-b-xl bg-gray-400" />
    </div>
  );
}
