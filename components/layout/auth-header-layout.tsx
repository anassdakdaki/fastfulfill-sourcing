import { Navbar } from "./navbar";

export function AuthHeaderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
