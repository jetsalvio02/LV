"use client";

import { useEffect, useState } from "react";
import AuthModal from "../components/Auth_Modal";
import { useRouter } from "next/navigation";

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
  const [polls, setPolls] = useState<Poll[]>([]);
  const [selectedByPoll, setSelectedByPoll] = useState<Record<number, number>>(
    {},
  );

  const [activePollId, setActivePollId] = useState<number | null>(null);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  /* AUTH */
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setIsLoggedIn(data.loggedIn);
        if (data.user?.role === "ADMIN") router.push("/admin");
        setCheckingAuth(false);
      })
      .catch(() => setCheckingAuth(false));
  }, []);

  /* LOAD ACTIVE POLLS */
  useEffect(() => {
    fetch("/api/polls/active")
      .then((res) => res.json())
      .then((data: Poll[]) => setPolls(data));
  }, []);

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

    await fetch("/api/polls/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pollId: activePollId,
        optionId,
      }),
    });

    setSubmitting(false);
    setShowVoteModal(false);

    alert("Vote submitted successfully");
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      router.replace("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (checkingAuth || polls.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading polls...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex justify-between items-center">
          <div className="font-bold text-indigo-600">LiveVote</div>
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
            >
              Login
            </button>
          )}
        </div>
      </nav>

      <div className="px-4 py-10 max-w-3xl mx-auto space-y-10">
        {polls.map((poll) => {
          const selectedOption = selectedByPoll[poll.id];

          return (
            <div
              key={poll.id}
              className="bg-white rounded-2xl shadow overflow-hidden"
            >
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold">{poll.title}</h2>
                  {poll.description && (
                    <p className="text-gray-600 mt-1">{poll.description}</p>
                  )}
                </div>

                {/* OPTIONS */}
                {poll.type === "YES_NO" && (
                  <div className="grid grid-cols-2 gap-4">
                    {poll.options.map((o) => (
                      <button
                        key={o.id}
                        onClick={() =>
                          setSelectedByPoll((prev) => ({
                            ...prev,
                            [poll.id]: o.id,
                          }))
                        }
                        className={`py-4 rounded-xl font-semibold border ${
                          selectedOption === o.id
                            ? "ring-2 ring-indigo-600"
                            : "hover:shadow"
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                )}

                {poll.type === "MULTIPLE_CHOICE" && (
                  <div className="grid sm:grid-cols-2 gap-6">
                    {poll.options.map((o) => (
                      <button
                        key={o.id}
                        onClick={() =>
                          setSelectedByPoll((prev) => ({
                            ...prev,
                            [poll.id]: o.id,
                          }))
                        }
                        className={`border rounded-xl overflow-hidden ${
                          selectedOption === o.id
                            ? "ring-2 ring-indigo-600"
                            : "hover:shadow-lg"
                        }`}
                      >
                        {o.image_url && (
                          <img
                            src={o.image_url}
                            className="w-full h-56 object-cover"
                          />
                        )}
                        <div className="p-4 font-semibold text-center">
                          {o.label}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* SUBMIT PER POLL */}
                <button
                  disabled={!selectedOption}
                  onClick={() => openVoteFlow(poll.id)}
                  className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold disabled:opacity-50"
                >
                  Submit Vote
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CONFIRM MODAL */}
      {showVoteModal && (
        <Modal onClose={() => setShowVoteModal(false)}>
          <h2 className="text-lg font-bold mb-4">Confirm Vote</h2>
          <button
            onClick={submitVote}
            disabled={submitting}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg"
          >
            {submitting ? "Submitting..." : "Confirm"}
          </button>
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl relative w-full max-w-md">
        <button onClick={onClose} className="absolute top-3 right-3">
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
