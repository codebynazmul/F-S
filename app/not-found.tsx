import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
      <img src="/logo-sm.png" alt="" className="h-16 w-16 rounded-full" />
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-sm">This page does not exist. / এই পেজটি পাওয়া যায়নি।</p>
      <Link href="/" className="btn-popup bg-sky-600 hover:bg-sky-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm">
        Back to Field Shift
      </Link>
    </div>
  );
}
