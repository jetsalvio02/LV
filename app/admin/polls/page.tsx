"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";

type Poll = {
  id: number;
  title: string;
  type: "YES_NO" | "MULTIPLE_CHOICE";
  status: "DRAFT" | "ACTIVE" | "CLOSED";
  createdAt: string;
};

export default function AdminPollsPage() {
  const router = useRouter();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const loadPolls = async () => {
    const res = await fetch("/api/admin/polls");
    const data = await res.json();
    setPolls(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPolls();
  }, []);

  const updateStatus = async (id: number, status: Poll["status"]) => {
    await fetch(`/api/admin/polls/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadPolls();
  };

  // const openDeleteDialog = (id: number) => {
  //   setDeleteId(id);
  //   dialogRef.current?.showModal();
  // };

  // const closeDeleteDialog = () => {
  //   setDeleteId(null);
  //   dialogRef.current?.close();
  // };

  // const handleDelete = async () => {
  //   if (!deleteId) return;

  //   try {
  //     await fetch(`/api/admin/polls/${deleteId}`, {
  //       method: "DELETE",
  //     });
  //     closeDeleteDialog();
  //     loadPolls();
  //   } catch (error) {
  //     console.error("Failed to delete poll:", error);
  //   }
  // };

  const confirmDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Delete Poll?",
      text: "This action cannot be undone. All responses will be lost.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await fetch(`/api/admin/polls/${id}`, { method: "DELETE" });

      await Swal.fire({
        title: "Deleted!",
        text: "The poll has been deleted.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      loadPolls();
    } catch (error) {
      Swal.fire("Error", "Failed to delete poll", "error");
    }
  };

  const getStatusStyles = (status: Poll["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800";
      case "CLOSED":
        return "bg-red-100 text-red-800";
    }
  };

  const getPollTypeLabel = (type: Poll["type"]) => {
    return type === "YES_NO" ? "Yes/No" : "Multiple Choice";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading polls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white rounded to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Polls Management
            </h1>
            <p className="text-gray-600 mt-1">Create and manage your polls</p>
          </div>
          <button
            onClick={() => router.push("/admin/polls/create")}
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
          >
            <span className="text-lg mr-2">+</span>
            Create Poll
          </button>
        </div>

        {/* Empty State */}
        {polls.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No polls yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first poll
            </p>
            <button
              onClick={() => router.push("/admin/polls/create")}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Poll
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Title
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {polls.map((poll) => (
                      <tr
                        key={poll.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td
                          className="px-6 py-4 font-medium text-gray-900 cursor-pointer"
                          onClick={() =>
                            router.push(`/admin/dashboard/${poll.id}`)
                          }
                        >
                          {poll.title}
                        </td>
                        <td
                          className="px-6 py-4 text-gray-600 text-sm cursor-pointer"
                          onClick={() =>
                            router.push(`/admin/dashboard/${poll.id}`)
                          }
                        >
                          {getPollTypeLabel(poll.type)}
                        </td>
                        <td
                          className="px-6 py-4 cursor-pointer"
                          onClick={() =>
                            router.push(`/admin/dashboard/${poll.id}`)
                          }
                        >
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles(poll.status)}`}
                          >
                            {poll.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-wrap justify-end gap-2">
                            {poll.status !== "ACTIVE" && (
                              <button
                                onClick={() => updateStatus(poll.id, "ACTIVE")}
                                className="px-2 py-1 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded transition-colors"
                              >
                                Activate
                              </button>
                            )}
                            {poll.status === "ACTIVE" && (
                              <button
                                onClick={() => updateStatus(poll.id, "CLOSED")}
                                className="px-2 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded transition-colors"
                              >
                                Close
                              </button>
                            )}
                            {poll.status !== "DRAFT" && (
                              <button
                                onClick={() => updateStatus(poll.id, "DRAFT")}
                                className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                              >
                                Draft
                              </button>
                            )}
                            <button
                              onClick={() =>
                                router.push(`/admin/polls/${poll.id}/edit`)
                              }
                              className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                            >
                              Edit
                            </button>
                            <Link
                              href={`/admin/dashboard/${poll.id}`}
                              className="px-2 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors"
                            >
                              Analytics
                            </Link>
                            <button
                              onClick={() => confirmDelete(poll.id)}
                              className="px-2 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {polls.map((poll) => (
                <div
                  key={poll.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {poll.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {getPollTypeLabel(poll.type)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusStyles(poll.status)}`}
                    >
                      {poll.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {poll.status !== "ACTIVE" && (
                      <button
                        onClick={() => updateStatus(poll.id, "ACTIVE")}
                        className="w-full px-3 py-2 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded transition-colors"
                      >
                        Activate
                      </button>
                    )}
                    {poll.status === "ACTIVE" && (
                      <button
                        onClick={() => updateStatus(poll.id, "CLOSED")}
                        className="w-full px-3 py-2 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded transition-colors"
                      >
                        Close
                      </button>
                    )}
                    {poll.status !== "DRAFT" && (
                      <button
                        onClick={() => updateStatus(poll.id, "DRAFT")}
                        className="w-full px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                      >
                        Draft
                      </button>
                    )}
                    <button
                      onClick={() =>
                        router.push(`/admin/polls/${poll.id}/edit`)
                      }
                      className="w-full px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/admin/dashboard/${poll.id}`}
                      className="w-full px-3 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors text-center"
                    >
                      Analytics
                    </Link>
                    <button
                      onClick={() => confirmDelete(poll.id)}
                      className="w-full px-3 py-2 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {/* <div className="flex items-center justify-center">
        <dialog
          ref={dialogRef}
          className=" backdrop:bg-black/50 rounded-lg shadow-xl max-w-sm w-full mx-4"
        >
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Delete Poll?
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              This action cannot be undone. All responses will be lost.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={closeDeleteDialog}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </dialog>
      </div> */}
    </div>
  );
}
