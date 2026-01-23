"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Result = {
  optionId: number;
  label: string;
  count: number;
  percentage: number;
};

type PollResults = {
  poll: {
    id: number;
    title: string;
    type: string;
  };
  totalVotes: number;
  results: Result[];
};

export default function AdminResultsPage() {
  const [data, setData] = useState<PollResults[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/polls/results")
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Poll Results</h1>
        <p className="text-sm text-gray-500">
          Overview of all poll voting results
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="animate-pulse text-gray-500">
              Loading poll results…
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && data.length === 0 && (
        <div className="text-center py-20 border rounded-lg bg-gray-50">
          <p className="text-gray-500">No poll results available.</p>
        </div>
      )}

      {/* Poll Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.map((pollResult) => (
          <Link
            key={pollResult.poll.id}
            href={`/admin/dashboard/${pollResult.poll.id}`}
          >
            <div className="rounded-xl border bg-white shadow-sm hover:shadow-md transition">
              {/* Card Header */}
              <div className="p-5 border-b">
                <h2 className="text-lg font-semibold">
                  {pollResult.poll.title}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Total votes:{" "}
                  <span className="font-medium text-gray-700">
                    {pollResult.totalVotes}
                  </span>
                </p>
              </div>

              {/* Results */}
              <div className="p-5 space-y-4">
                {pollResult.results.map((r) => (
                  <div key={r.optionId} className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-700">{r.label}</span>
                      <span className="text-gray-600">
                        {r.count} ({r.percentage}%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-700"
                        style={{ width: `${r.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
