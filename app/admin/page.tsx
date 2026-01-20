"use client";

import { redirect } from "next/navigation";

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
  kpi: {
    totalVotes: number;
    activePolls: number;
    topOption: string;
  };
  distribution: { option: string; votes: number }[];
  votesOverTime: { date: string; total: number }[];
};

export default function AdminDashboard() {
  redirect("/admin/polls");

  // const [data, setData] = useState<DashboardData | null>(null);

  // useEffect(() => {
  //   fetch("/api/admin/dashboard")
  //     .then((res) => res.json())
  //     .then(setData);
  // }, []);

  // if (!data) return <div>Loading dashboard...</div>;

  // const pieData = {
  //   labels: data.distribution.map((d) => d.option),
  //   datasets: [
  //     {
  //       data: data.distribution.map((d) => d.votes),
  //       backgroundColor: ["#6366F1", "#22C55E", "#F97316"],
  //     },
  //   ],
  // };

  // const lineData = {
  //   labels: data.votesOverTime.map((v) => v.date),
  //   datasets: [
  //     {
  //       label: "Votes",
  //       data: data.votesOverTime.map((v) => v.total),
  //       borderColor: "#6366F1",
  //       backgroundColor: "rgba(99,102,241,0.2)",
  //       fill: true,
  //     },
  //   ],
  // };

  // return (
  //   <div className="space-y-8">
  //     {/* HEADER */}
  //     <div>
  //       <h1 className="text-2xl font-bold">Dashboard</h1>
  //       <p className="text-gray-600">Monitor voting analytics and trends</p>
  //     </div>

  //     {/* KPI */}
  //     <div className="grid sm:grid-cols-3 gap-4">
  //       <Kpi title="Total Votes" value={data.kpi.totalVotes} />
  //       <Kpi title="Active Polls" value={data.kpi.activePolls} />
  //       <Kpi title="Top Option" value={data.kpi.topOption} />
  //     </div>

  //     {/* CHARTS */}
  //     <div className="grid lg:grid-cols-2 gap-6">
  //       <Card title="Vote Distribution">
  //         <Pie data={pieData} />
  //       </Card>

  //       <Card title="Votes Over Time">
  //         <Line data={lineData} />
  //       </Card>
  //     </div>

  //     {/* TREND TABLE */}
  //     <div className="bg-white p-6 rounded-xl shadow">
  //       <h2 className="font-semibold mb-4">Trend Analysis</h2>

  //       <table className="w-full text-sm">
  //         <thead>
  //           <tr className="border-b text-gray-500">
  //             <th className="text-left py-2">Option</th>
  //             <th className="text-left py-2">Votes</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           {data.distribution.map((row) => (
  //             <tr key={row.option} className="border-b last:border-0">
  //               <td className="py-3 font-medium">{row.option}</td>
  //               <td className="py-3">{row.votes}</td>
  //             </tr>
  //           ))}
  //         </tbody>
  //       </table>
  //     </div>
  //   </div>
  // );
}

/* COMPONENTS */

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
