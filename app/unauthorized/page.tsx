"use client";

import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center space-y-4">
        <h1 className="text-2xl font-bold">Access Denied</h1>

        <p className="text-gray-600">
          You do not have permission to access this page.
        </p>

        <button
          onClick={() => router.back()}
          className="mt-4 inline-flex items-center justify-center px-5 py-2 rounded-lg
                     bg-gray-900 text-white text-sm font-medium
                     hover:bg-gray-700 transition"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
