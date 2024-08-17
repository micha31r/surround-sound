import Link from "next/link";


export default function Home() {
  return (
    <main className="flex">
      <div>
        <Link href="/login">Login</Link>
      </div>
    </main>
  );
}
