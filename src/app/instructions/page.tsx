"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Sidebar } from "~/app/_components/sidebar";

export default function InstructionsPage() {
    const router = useRouter();
    const utils = api.useUtils();
    const [text, setText] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const { data: instruction, isLoading } = api.instruction.get.useQuery();
    const upsertMutation = api.instruction.upsert.useMutation();
    const deleteMutation = api.instruction.delete.useMutation();

    useEffect(() => {
        if (instruction?.text) {
            setText(instruction.text);
        }
    }, [instruction]);

    const handleSave = async () => {
        if (!text.trim()) return;

        setIsSaving(true);
        try {
            await upsertMutation.mutateAsync({ text });
            await utils.instruction.get.invalidate();
            router.push("/");
        } catch (error) {
            console.error("Failed to save instructions:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        setIsSaving(true);
        try {
            await deleteMutation.mutateAsync();
            await utils.instruction.get.invalidate();
            setText("");
            router.push("/");
        } catch (error) {
            console.error("Failed to delete instructions:", error);
        } finally {
            setIsSaving(false);
        }
    };

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
                <span className="font-bold">Custom Instructions</span>
            </div>

            <Sidebar
                onSelectStory={(id) => {
                    if (id === null) {
                        router.push("/");
                    } else {
                        router.push(`/?story=${id}`);
                    }
                }}
                selectedStoryId={null}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="mx-auto max-w-2xl">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-white">Custom Instructions</h1>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                        <p className="mb-4 text-sm text-white/60">
                            Add custom instructions that the AI will consider when generating stories.
                            These instructions will be applied to all future stories.
                        </p>

                        {isLoading ? (
                            <>
                                <div className="mb-4 h-[200px] w-full animate-pulse rounded-lg bg-white/10" />
                                <div className="flex gap-3">
                                    <div className="h-12 flex-1 animate-pulse rounded-lg bg-white/10" />
                                </div>
                            </>
                        ) : (
                            <>
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="e.g., Always include a friendly animal character, use simple language suitable for young children, etc."
                                    className="mb-4 min-h-[200px] w-full rounded-lg border border-white/10 bg-white/5 p-4 text-white placeholder-white/30 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                />

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving || !text.trim()}
                                        className="flex-1 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isSaving && (
                                            <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        )}
                                        {isSaving ? "Saving..." : "Save Instructions"}
                                    </button>

                                    {instruction && (
                                        <button
                                            onClick={handleDelete}
                                            disabled={isSaving}
                                            className="rounded-lg p-3 text-white/40 transition hover:bg-white/5 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50 relative"
                                            title="Delete instructions"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M3 6h18" />
                                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
