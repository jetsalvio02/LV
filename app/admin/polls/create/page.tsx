"use client";

import { useState } from "react";
import { Plus, Trash2, ImageIcon, Type, Settings2 } from "lucide-react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

type PollType = "YES_NO" | "MULTIPLE_CHOICE";

type Option = {
  id: number;
  label: string;
  imageFile?: File | null;
  imagePreview?: string | null;
};

export default function AdminCreatePollPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<PollType>("YES_NO");

  const [pollImageFile, setPollImageFile] = useState<File | null>(null);
  const [pollImagePreview, setPollImagePreview] = useState<string | null>(null);

  const [options, setOptions] = useState<Option[]>([
    { id: 1, label: "" },
    { id: 2, label: "" },
  ]);

  /* ======================
     RESET FORM
  ====================== */
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setType("YES_NO");

    setPollImageFile(null);
    setPollImagePreview(null);

    setOptions([
      { id: Date.now(), label: "" },
      { id: Date.now() + 1, label: "" },
    ]);
  };

  /* ======================
     OPTION HANDLERS
  ====================== */

  const addOption = () => {
    setOptions([
      ...options,
      { id: Date.now(), label: "", imageFile: null, imagePreview: null },
    ]);
  };

  const removeOption = (id: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((o) => o.id !== id));
  };

  const updateOptionLabel = (id: number, value: string) => {
    setOptions(options.map((o) => (o.id === id ? { ...o, label: value } : o)));
  };

  const updateOptionImage = (id: number, file: File | null) => {
    setOptions(
      options.map((o) =>
        o.id === id
          ? {
              ...o,
              imageFile: file,
              imagePreview: file ? URL.createObjectURL(file) : null,
            }
          : o,
      ),
    );
  };

  /* ======================
     SUBMIT
  ====================== */
  const submitPoll = async (activate: boolean) => {
    const result = await Swal.fire({
      title: activate ? "Activate Poll?" : "Save as Draft?",
      text: activate
        ? "This poll will be visible to users immediately."
        : "You can activate this poll later.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: activate ? "#16a34a" : "#2563eb",
      cancelButtonColor: "#6b7280",
      confirmButtonText: activate ? "Yes, Activate" : "Save Draft",
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: "Submitting...",
        text: "Please wait",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const formData = new FormData();

      formData.append("title", title);
      formData.append("description", description);
      formData.append("type", type);
      formData.append("status", activate ? "ACTIVE" : "DRAFT");

      if (pollImageFile) {
        formData.append("poll_image", pollImageFile);
      }

      if (type === "MULTIPLE_CHOICE") {
        options.forEach((opt, index) => {
          formData.append(`options[${index}][label]`, opt.label);
          if (opt.imageFile) {
            formData.append(`options[${index}][image]`, opt.imageFile);
          }
        });
      }

      // 🔥 Send request
      await fetch("/api/admin/polls/create", {
        method: "POST",
        body: formData,
      });

      Swal.fire({
        icon: "success",
        title: activate ? "Poll Activated!" : "Saved as Draft!",
        text: activate
          ? "Your poll is now live."
          : "You can activate this poll anytime.",
      });

      /* ======================
         CLEAR + REDIRECT
      ====================== */
      resetForm();
      router.push("/admin/polls");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: "Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 rounded">
      <div className="max-w-5xl mx-auto px-4">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Create New Poll
          </h1>
          <p className="text-slate-600">
            Set up a new voting poll with customizable options and images
          </p>
        </div>

        <div className="space-y-8">
          {/* ====================== POLL DETAILS SECTION ====================== */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <Type className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-slate-900">
                  Poll Details
                </h2>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Title Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Poll Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., What's your favorite programming language?"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition bg-white text-slate-900 placeholder-slate-400"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Add more context or instructions for voters (optional)"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition bg-white text-slate-900 placeholder-slate-400 min-h-[100px] resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ====================== POLL IMAGE SECTION ====================== */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-slate-900">
                  Poll Image
                </h2>
              </div>
            </div>

            <div className="p-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Upload Image (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition bg-white text-slate-900 cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setPollImageFile(file);
                  setPollImagePreview(file ? URL.createObjectURL(file) : null);
                }}
              />
              {pollImagePreview && (
                <div className="mt-4">
                  <img
                    src={pollImagePreview || "/placeholder.svg"}
                    alt="Poll preview"
                    className="h-48 rounded-lg object-cover border border-slate-200 w-full"
                  />
                </div>
              )}
            </div>
          </div>

          {/* ====================== POLL TYPE & OPTIONS SECTION ====================== */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <Settings2 className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-slate-900">
                  Poll Type & Options
                </h2>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Poll Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Poll Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "YES_NO", label: "Yes / No" },
                    { value: "MULTIPLE_CHOICE", label: "Multiple Choice" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setType(option.value as PollType)}
                      className={`p-4 rounded-lg border-2 font-medium transition-all ${
                        type === option.value
                          ? "border-blue-600 bg-blue-50 text-blue-900"
                          : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Options Display */}
              {type === "YES_NO" ? (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Default Options
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 text-center font-medium text-green-900">
                      ✓ Yes
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 text-center font-medium text-red-900">
                      ✗ No
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-slate-700">
                      Poll Options
                    </label>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {options.length} options
                    </span>
                  </div>

                  <div className="space-y-4">
                    {options.map((option, idx) => (
                      <div
                        key={option.id}
                        className="p-4 rounded-lg border border-slate-300 bg-slate-50 space-y-3"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-slate-600">
                            Option {idx + 1}
                          </span>
                          {options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(option.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition"
                              title="Delete option"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <input
                          type="text"
                          placeholder="Option text"
                          value={option.label}
                          onChange={(e) =>
                            updateOptionLabel(option.id, e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition bg-white text-slate-900 placeholder-slate-400"
                        />

                        <div>
                          <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                            Option Image (optional)
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition bg-white text-slate-900 cursor-pointer text-sm"
                            onChange={(e) =>
                              updateOptionImage(
                                option.id,
                                e.target.files?.[0] || null,
                              )
                            }
                          />
                        </div>

                        {option.imagePreview && (
                          <img
                            src={option.imagePreview || "/placeholder.svg"}
                            alt={`Option ${idx + 1}`}
                            className="h-24 rounded-lg object-cover border border-slate-300 w-full"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={addOption}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-blue-300 text-blue-600 font-medium hover:border-blue-500 hover:bg-blue-50 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add Another Option
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ====================== ACTION BUTTONS ====================== */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              onClick={() => submitPoll(false)}
              className="px-6 py-3 rounded-lg border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-400 transition"
            >
              Save as Draft
            </button>
            <button
              onClick={() => submitPoll(true)}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/20 transition"
            >
              Activate Poll
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
