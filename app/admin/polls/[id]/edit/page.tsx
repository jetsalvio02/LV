"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ImageIcon, Type, ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";
import { useParams, useRouter } from "next/navigation";

type PollType = "YES_NO" | "MULTIPLE_CHOICE";

type Option = {
  id: number;
  label: string;
  imageFile?: File | null;
  imagePreview?: string | null;
};

export default function AdminEditPollPage() {
  const router = useRouter();
  const params = useParams();
  const pollId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<PollType>("YES_NO");
  const [pollImageFile, setPollImageFile] = useState<File | null>(null);
  const [pollImagePreview, setPollImagePreview] = useState<string | null>(null);
  const [options, setOptions] = useState<Option[]>([]);

  /* ======================
     LOAD POLL
  ====================== */
  useEffect(() => {
    const loadPoll = async () => {
      const res = await fetch(`/api/admin/polls/${pollId}`);
      const poll = await res.json();

      setTitle(poll.title);
      setDescription(poll.description || "");
      setType(poll.type);

      if (poll.image_url) {
        setPollImagePreview(poll.image_url);
      }

      if (poll.type === "MULTIPLE_CHOICE") {
        setOptions(
          poll.options.map((o: any) => ({
            id: o.id,
            label: o.label,
            imageFile: null,
            imagePreview: o.image_url || null,
          })),
        );
      }

      setLoading(false);
    };

    loadPoll();
  }, [pollId]);

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
              imagePreview: file ? URL.createObjectURL(file) : o.imagePreview,
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
      title: "Update Poll?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Save Changes",
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: "Updating...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
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
          formData.append(`options[${index}][id]`, String(opt.id));
          formData.append(`options[${index}][label]`, opt.label);
          if (opt.imageFile) {
            formData.append(`options[${index}][image]`, opt.imageFile);
          }
        });
      }

      await fetch(`/api/admin/polls/${pollId}`, {
        method: "PATCH",
        body: formData,
      });

      Swal.fire({
        icon: "success",
        title: "Poll Updated",
      });

      router.push("/admin/polls");
    } catch {
      Swal.fire({
        icon: "error",
        title: "Update failed",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 text-center">
          <div className="animate-spin">
            <div className="h-10 w-10 border-4 border-muted-foreground border-t-primary rounded-full mx-auto"></div>
          </div>
          <p className="text-muted-foreground">Loading poll...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-2">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Edit Poll
          </h1>
          <p className="text-muted-foreground mt-2">
            Update your poll details and options
          </p>
        </div>

        {/* Poll Details Section */}
        <div className="bg-card border border-border rounded-2xl shadow-sm mb-8 overflow-hidden">
          <div className="px-6 py-5 border-b border-border flex items-center gap-3 bg-muted/30">
            <Type className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Poll Details</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Enter poll title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                placeholder="Enter poll description (optional)"
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Poll Image Section */}
        <div className="bg-card border border-border rounded-2xl shadow-sm mb-8 overflow-hidden">
          <div className="px-6 py-5 border-b border-border flex items-center gap-3 bg-muted/30">
            <ImageIcon className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Poll Image</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setPollImageFile(file);
                  setPollImagePreview(file ? URL.createObjectURL(file) : null);
                }}
                className="hidden"
                id="poll-image-input"
              />
              <label
                htmlFor="poll-image-input"
                className="flex items-center justify-center w-full px-6 py-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/20 transition-all duration-200"
              >
                <div className="text-center">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">Click to upload image</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, or GIF
                  </p>
                </div>
              </label>
            </div>
            {pollImagePreview && (
              <div className="relative group">
                <img
                  src={pollImagePreview || "/placeholder.svg"}
                  alt="Poll preview"
                  className="w-full max-h-64 object-cover rounded-lg"
                />
                <button
                  onClick={() => {
                    setPollImageFile(null);
                    setPollImagePreview(null);
                  }}
                  className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-3 py-1 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Options Section */}
        {type === "MULTIPLE_CHOICE" && (
          <div className="bg-card border border-border rounded-2xl shadow-sm mb-8 overflow-hidden">
            <div className="px-6 py-5 border-b border-border flex items-center gap-3 bg-muted/30">
              <Plus className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Poll Options</h2>
            </div>
            <div className="p-6 space-y-4">
              {options.map((opt, idx) => (
                <div
                  key={opt.id}
                  className="bg-muted/40 border border-border rounded-xl p-5 space-y-4 hover:bg-muted/60 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-2">
                        Option {idx + 1}
                      </label>
                      <input
                        value={opt.label}
                        onChange={(e) =>
                          updateOptionLabel(opt.id, e.target.value)
                        }
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="Enter option text"
                      />
                    </div>
                    {options.length > 2 && (
                      <button
                        onClick={() => removeOption(opt.id)}
                        className="mt-auto px-3 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        title="Remove option"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor={`image-${opt.id}`}
                      className="block text-sm font-medium mb-2"
                    >
                      Option Image (optional)
                    </label>
                    <input
                      id={`image-${opt.id}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        updateOptionImage(opt.id, e.target.files?.[0] || null)
                      }
                      className="hidden"
                    />
                    <label
                      htmlFor={`image-${opt.id}`}
                      className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                    >
                      <span className="text-sm text-muted-foreground">
                        Click to upload image
                      </span>
                    </label>
                  </div>
                  {opt.imagePreview && (
                    <div className="relative group">
                      <img
                        src={opt.imagePreview || "/placeholder.svg"}
                        alt={`Option ${idx + 1} preview`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() =>
                          setOptions(
                            options.map((o) =>
                              o.id === opt.id
                                ? { ...o, imageFile: null, imagePreview: null }
                                : o,
                            ),
                          )
                        }
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={addOption}
                className="w-full px-4 py-3 border-2 border-dashed border-border rounded-xl text-primary hover:bg-muted/40 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Option
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => submitPoll(false)}
            className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
          >
            Save Draft
          </button>
          <button
            onClick={() => submitPoll(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-cyan-600 text-white rounded-lg hover:opacity-90 transition-all font-medium shadow-sm"
          >
            Update & Activate
          </button>
        </div>
      </div>
    </div>
  );
}
