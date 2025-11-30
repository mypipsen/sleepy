"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

import { Story } from "~/app/_components/story";
import { Sidebar } from "~/app/_components/sidebar";

export default function Home() {
  const { data: session } = useSession();
  const [selectedStoryId, setSelectedStoryId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            sl<span className="text-[hsl(280,100%,70%)]">ee</span>py
          </h1>
          <div className="flex flex-col items-center gap-2">
            <Link
              href="/api/auth/signin"
              className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
            >
              Sign in
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-screen flex-col md:flex-row bg-[#15162c] text-white">
      {/* Mobile Header */}
      <div className="flex items-center border-b border-white/10 p-4 md:hidden">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="mr-4 rounded-lg p-2 text-white/70 hover:bg-white/10"
        >
          ☰
        </button>
        <span className="font-bold">Sleepy</span>
      </div>

      <Sidebar
        onSelectStory={setSelectedStoryId}
        selectedStoryId={selectedStoryId}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 overflow-hidden md:p-4">
        <Story storyId={selectedStoryId} onSelectStory={setSelectedStoryId} />
      </div>
    </main>
  );
}
