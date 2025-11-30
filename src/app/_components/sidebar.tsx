"use client";

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
            </div>
        </>
    );
}
