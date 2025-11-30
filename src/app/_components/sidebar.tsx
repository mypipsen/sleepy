"use client";

import { useSession, signOut } from "next-auth/react";
import { api } from "~/trpc/react";

interface SidebarProps {
    onSelectStory: (id: number | null) => void;
    selectedStoryId: number | null;
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({
    onSelectStory,
    selectedStoryId,
    isOpen,
    onClose,
}: SidebarProps) {
    const { data: stories, isLoading } = api.story.getAll.useQuery();
    const { data: session } = useSession();

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/" });
    };

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-white/10 bg-[#15162c] transition-transform duration-300 md:relative md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex items-center justify-between p-4">
                    <button
                        onClick={() => {
                            onSelectStory(null);
                            onClose();
                        }}
                        className="flex-1 rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white transition hover:bg-purple-500"
                    >
                        + New Story
                    </button>
                    <button
                        onClick={onClose}
                        className="ml-2 rounded-lg p-2 text-white/70 hover:bg-white/10 md:hidden"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {isLoading ? (
                        <div className="p-4 text-center text-white/50">Loading...</div>
                    ) : (
                        <div className="space-y-2">
                            {stories?.map((story) => (
                                <button
                                    key={story.id}
                                    onClick={() => {
                                        onSelectStory(story.id);
                                        onClose();
                                    }}
                                    className={`w-full rounded-lg px-4 py-3 text-left transition ${selectedStoryId === story.id
                                        ? "bg-white/10 text-white"
                                        : "text-white/70 hover:bg-white/5 hover:text-white"
                                        }`}
                                >
                                    <div className="truncate font-medium">{story.prompt}</div>
                                    <div className="truncate text-xs text-white/40">
                                        {new Date(story.createdAt).toLocaleDateString()}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* User Info and Logout */}
                <div className="border-t border-white/10 p-4">
                    <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-semibold">
                            {session?.user?.name?.[0]?.toUpperCase() ?? session?.user?.email?.[0]?.toUpperCase() ?? "U"}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="truncate text-sm font-medium text-white">
                                {session?.user?.name ?? session?.user?.email ?? "User"}
                            </div>
                            {session?.user?.name && session?.user?.email && (
                                <div className="truncate text-xs text-white/40">
                                    {session.user.email}
                                </div>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
                    >
                        <span className="flex items-center justify-center gap-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Logout
                        </span>
                    </button>
                </div>
            </div>
        </>
    );
}
