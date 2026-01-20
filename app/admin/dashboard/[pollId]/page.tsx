"use client";

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
    return <div className="p-6">Loading poll analytics…</div>;
  }

  if (!data) {
    return <div className="p-6">No data available</div>;
  }

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
    <div className="space-y-8 p-6">
      {/* HEADER */}
      <div>
        <button
          onClick={() => router.back()}
          className="text-sm text-indigo-600 mb-2"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold">{data.poll.title}</h1>
        <p className="text-gray-600">
          Poll analytics · Status: {data.poll.status}
        </p>
      </div>

      {/* KPI */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Kpi title="Total Votes" value={data.kpi.totalVotes} />
        <Kpi title="Poll Status" value={data.poll.status} />
        <Kpi title="Leading Option" value={data.kpi.topOption} />
      </div>

      {/* CHARTS */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Vote Distribution">
          <Pie data={pieData} />
        </Card>

        <Card title="Votes Over Time">
          <Line data={lineData} />
        </Card>
      </div>

      {/* TABLE */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-semibold mb-4">Option Breakdown</h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-gray-500">
              <th className="text-left py-2">Option</th>
              <th className="text-left py-2">Votes</th>
            </tr>
          </thead>
          <tbody>
            {data.distribution.map((row) => (
              <tr key={row.option} className="border-b last:border-0">
                <td className="py-3 font-medium">{row.option}</td>
                <td className="py-3">{row.votes}</td>
              </tr>
            ))}
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
