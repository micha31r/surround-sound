import Link from "next/link";

export default function Home() {
  return (
    <main className="flex max-w-sm mx-auto">
      <div>
        <Link href="/login">Login</Link>
      </div>
    </main>
  );
}
