"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Result = {
  optionId: number;
  label: string;
  image?: string | null;
  votes: number;
};

export default function AdminPollResultsPage() {
  const { id } = useParams<{ id: string }>();
  const [results, setResults] = useState<Result[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const loadResults = async () => {
    const res = await fetch(`/api/admin/polls/${id}/results`);
    const data = await res.json();

    setTitle(data.poll.title);
    setResults(data.results);
    setLoading(false);
  };

  useEffect(() => {
    loadResults();
    const interval = setInterval(loadResults, 3000);
    return () => clearInterval(interval);
  }, []);

  const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);

  if (loading) {
    return <p className="text-gray-500">Loading results...</p>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-gray-500">Total votes: {totalVotes}</p>
      </div>

      <div className="space-y-4">
        {results.map((r) => {
          const percent =
            totalVotes === 0 ? 0 : Math.round((r.votes / totalVotes) * 100);

          return (
            <div key={r.optionId} className="border rounded-lg p-4 bg-white">
              <div className="flex items-center gap-4">
                {r.image && (
                  <img
                    src={r.image}
                    className="w-16 h-16 rounded object-cover border"
                  />
                )}

                <div className="flex-1">
                  <div className="flex justify-between text-sm font-medium">
                    <span>{r.label}</span>
                    <span>
                      {r.votes} votes ({percent}%)
                    </span>
                  </div>

                  <div className="mt-2 h-3 bg-gray-200 rounded">
                    <div
                      className="h-3 bg-indigo-600 rounded transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {results.length === 0 && <p className="text-gray-500">No votes yet.</p>}
      </div>
    </div>
  );
}
