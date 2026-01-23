"use client";

import React from "react";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import { Pie, Line } from "react-chartjs-2";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
);

type DashboardData = {
  poll: {
    id: number;
    title: string;
    status: string;
  };
  kpi: {
    totalVotes: number;
    topOption: string;
  };
  distribution: {
    option: string;
    votes: number;
  }[];
  votesOverTime: {
    date: string;
    total: number;
  }[];
};

export default function PollDashboardPage() {
  const { pollId } = useParams<{ pollId: string }>();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/dashboard/${pollId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load analytics");
        return res.json();
      })
      .then(setData)
      .finally(() => setLoading(false));
  }, [pollId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
          <p className="text-muted-foreground">Loading poll analytics…</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">No data available</p>
        </div>
      </div>
    );
  }

  const totalVotesCount = data.distribution.reduce(
    (sum, d) => sum + d.votes,
    0,
  );
  const sortedDistribution = [...data.distribution].sort(
    (a, b) => b.votes - a.votes,
  );

  const pieData = {
    labels: data.distribution.map((d) => d.option),
    datasets: [
      {
        data: data.distribution.map((d) => d.votes),
        backgroundColor: ["#6366F1", "#22C55E", "#F97316", "#EF4444"],
      },
    ],
  };

  const votesOverTime = Array.isArray(data.votesOverTime)
    ? data.votesOverTime
    : [];

  const lineData = {
    labels: votesOverTime.map((v) => v.date),
    datasets: [
      {
        label: "Votes",
        data: votesOverTime.map((v) => v.total),
        borderColor: "#6366F1",
        backgroundColor: "rgba(99,102,241,0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-6">
      {/* HEADER */}
      <div className="mb-6 md:mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors mb-4 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>
        <h1 className="text-xl md:text-2xl font-bold">{data.poll.title}</h1>
        <p className="text-sm md:text-base text-gray-600">
          Poll analytics · Status: {data.poll.status}
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <Kpi title="Total Votes" value={data.kpi.totalVotes} />
        <Kpi title="Poll Status" value={data.poll.status} />
        <Kpi title="Leading Option" value={data.kpi.topOption} />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card title="Vote Distribution">
          <Pie data={pieData} />
        </Card>

        <Card title="Votes Over Time">
          <Line
            data={lineData}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    precision: 0,
                  },
                },
              },
            }}
          />
        </Card>
      </div>

      {/* TABLE */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow overflow-x-auto">
        <h2 className="font-semibold mb-4 text-sm md:text-base">
          Option Breakdown
        </h2>

        <table className="w-full text-xs md:text-sm">
          <thead>
            <tr className="border-b text-gray-500">
              <th className="text-left py-2">Option</th>
              <th className="text-left py-2">Votes</th>
              <th className="text-right py-2">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {data.distribution.map((row) => {
              const percentage =
                totalVotesCount > 0
                  ? ((row.votes / totalVotesCount) * 100).toFixed(1)
                  : 0;
              return (
                <tr key={row.option} className="border-b last:border-0">
                  <td className="py-3 font-medium">{row.option}</td>
                  <td className="py-3">{row.votes}</td>
                  <td className="py-3 px-2 md:px-4">
                    <div className="flex flex-col md:flex-row items-end md:items-center justify-end gap-2 md:gap-3">
                      <div className="w-full md:w-24 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-chart-1 to-chart-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs md:text-sm text-muted-foreground md:w-12 text-right whitespace-nowrap">
                        {percentage}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* UI COMPONENTS */
function Kpi({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}
