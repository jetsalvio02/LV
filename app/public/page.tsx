"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  LogOut,
  LogIn,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import AuthModal from "../components/Auth_Modal";
import Swal from "sweetalert2";

type PollType = "YES_NO" | "MULTIPLE_CHOICE";

type Option = {
  id: number;
  label: string;
  image_url?: string | null;
};

type Poll = {
  id: number;
  title: string;
  description?: string;
  type: PollType;
  status: "DRAFT" | "ACTIVE" | "CLOSED";
  image_url?: string | null;
  options: Option[];
};

export default function PollVotePage() {
  const router = useRouter();

  const [polls, setPolls] = useState<Poll[]>([]);
  const [selectedByPoll, setSelectedByPoll] = useState<Record<number, number>>(
    {},
  );
  const [votedPollIds, setVotedPollIds] = useState<number[]>([]);
  const [activePollId, setActivePollId] = useState<number | null>(null);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  /* AUTH CHECK */
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setIsLoggedIn(data.loggedIn);
        if (data.user?.role === "ADMIN") router.push("/admin");
      })
      .finally(() => setCheckingAuth(false));
  }, [router]);

  /* LOAD POLLS */
  useEffect(() => {
    fetch("/api/polls/active")
      .then((res) => res.json())
      .then(setPolls);

    /* LOAD VOTED POLLS */
    if (isLoggedIn) {
      fetch("/api/polls/voted")
        .then((res) => res.json())
        .then((data) => setVotedPollIds(data.votedPollIds ?? []));
    }
  }, [isLoggedIn]);

  const openVoteFlow = (pollId: number) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    setActivePollId(pollId);
    setShowVoteModal(true);
  };

  const submitVote = async () => {
    if (!activePollId) return;

    const optionId = selectedByPoll[activePollId];
    if (!optionId) return;

    setSubmitting(true);

    try {
      const res = await fetch("/api/polls/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId: activePollId, optionId }),
      });

      if (res.status === 401) {
        await Swal.fire({
          icon: "warning",
          title: "Login Required",
          text: "Please log in to vote.",
        });
        setShowVoteModal(false);
        setShowLoginModal(true);
        return;
      }

      if (res.status === 409) {
        await Swal.fire({
          icon: "info",
          title: "Already Voted",
          text: "You already voted on this poll.",
        });
        setShowVoteModal(false);
        return;
      }

      if (!res.ok) {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Something went wrong. Please try again.",
        });
        return;
      }

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Vote submitted successfully.",
      });

      window.location.reload();
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Log out?",
      text: "You will be signed out of your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5", // indigo
      cancelButtonColor: "#6b7280", // gray
      confirmButtonText: "Yes, log out",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      await fetch("/api/auth/logout", { method: "POST" });

      await Swal.fire({
        title: "Logged out",
        text: "You have been successfully logged out.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      router.replace("/");
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-foreground/60 font-medium">Loading polls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
      {/* STICKY NAV */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white text-sm font-bold">✓</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              LiveVote
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium bg-muted hover:bg-muted/80 text-foreground transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-200"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {polls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="text-foreground/60 text-lg">
              No active polls available
            </p>
            <p className="text-muted-foreground text-sm">Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {polls.map((poll) => {
              const selected = selectedByPoll[poll.id];
              const hasVoted = votedPollIds.includes(poll.id);

              return (
                <div
                  key={poll.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-border/20"
                >
                  <div className="relative">
                    {poll.image_url && (
                      <div className="h-48 sm:h-64 w-full overflow-hidden bg-muted/50">
                        <img
                          src={poll.image_url || "/placeholder.svg"}
                          alt={poll.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div
                      className={`p-6 sm:p-8 ${poll.image_url ? "bg-gradient-to-t from-white via-white/95 pt-8" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 leading-tight">
                            {poll.title}
                          </h2>
                          {poll.description && (
                            <p className="text-foreground/70 text-sm sm:text-base leading-relaxed">
                              {poll.description}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent">
                            {poll.status}
                          </span>
                        </div>
                      </div>

                      {/* OPTIONS GRID */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-8 mb-8">
                        {poll.options.map((option) => (
                          <button
                            key={option.id}
                            disabled={hasVoted}
                            onClick={() =>
                              setSelectedByPoll((prev) => ({
                                ...prev,
                                [poll.id]: option.id,
                              }))
                            }
                            className={`relative group/option px-4 sm:px-6 py-4 sm:py-5 rounded-xl border-2 transition-all duration-200 text-left font-medium ${
                              hasVoted
                                ? "opacity-50 cursor-not-allowed bg-muted"
                                : selected === option.id
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:bg-muted/50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                                  selected === option.id
                                    ? "border-primary bg-primary"
                                    : "border-border/60 group-hover/option:border-primary/50"
                                }`}
                              >
                                {selected === option.id && (
                                  <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                                )}
                              </div>
                              <span className="flex-1">{option.label}</span>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* SUBMIT BUTTON */}
                      <button
                        disabled={hasVoted || !selected}
                        onClick={() => openVoteFlow(poll.id)}
                        className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2
                          ${
                            hasVoted
                              ? "bg-green-100 text-green-700 cursor-not-allowed"
                              : selected
                                ? "bg-gradient-to-r from-primary to-accent text-white"
                                : "bg-muted text-muted-foreground cursor-not-allowed"
                          }`}
                      >
                        {hasVoted ? (
                          <>
                            <CheckCircle2 className="w-5 h-5" />
                            Already Voted
                          </>
                        ) : (
                          <>
                            Submit Vote
                            <ChevronRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* CONFIRMATION MODAL */}
      {showVoteModal && (
        <Modal onClose={() => setShowVoteModal(false)}>
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Confirm Your Vote
              </h2>
              <p className="text-foreground/70">
                Are you sure you want to submit this vote?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowVoteModal(false)}
                className="flex-1 px-4 py-3 rounded-lg border-2 border-border text-foreground font-semibold hover:bg-muted/50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={submitVote}
                disabled={submitting}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold text-primary-foreground transition-all duration-200 flex items-center justify-center gap-2 ${
                  submitting
                    ? "bg-primary/70 cursor-not-allowed"
                    : "bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/30"
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showLoginModal && <AuthModal onClose={() => setShowLoginModal(false)} />}
    </div>
  );
}

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 sm:p-8 relative w-full max-w-md shadow-2xl border border-border/20 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-muted/50 flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors"
        >
          ✕
        </button>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
}
