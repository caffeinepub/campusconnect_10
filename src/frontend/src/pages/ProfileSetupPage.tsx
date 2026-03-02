import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Camera, GraduationCap, Loader2, Upload } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import type { LocalUserProfile, UserRole } from "../types/campus";

interface ProfileSetupPageProps {
  onComplete: (profile: LocalUserProfile) => void;
}

const DEPARTMENTS = [
  "Computer Science",
  "Electronics & Communication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Electrical Engineering",
  "Information Technology",
  "Mathematics",
  "Physics",
  "Chemistry",
  "MBA",
  "Law",
  "Medical Sciences",
  "Architecture",
  "Other",
];

const YEARS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "5th Year",
  "Faculty",
  "Alumni",
];

const DEGREE_YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const DIVISIONS = ["A", "B", "C", "D"];

/** Resize and compress an image file to a base64 data URL */
async function resizeImageToDataUrl(
  file: File,
  maxSize = 256,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("No canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

export function ProfileSetupPage({ onComplete }: ProfileSetupPageProps) {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const [saving, setSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [photoDataUrl, setPhotoDataUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: "",
    role: "" as UserRole | "",
    department: "",
    year: "",
    bio: "",
    course: "",
    yearOfDegree: "",
    division: "",
    rollNumber: "",
  });

  const principalId = identity?.getPrincipal().toString() ?? "";

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    // Show immediate preview
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
    // Resize and store as data URL
    try {
      const dataUrl = await resizeImageToDataUrl(file, 256);
      setPhotoDataUrl(dataUrl);
      URL.revokeObjectURL(previewUrl);
      setPhotoPreview(dataUrl);
    } catch {
      URL.revokeObjectURL(previewUrl);
      toast.error("Failed to process image");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.role || !form.department) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const avatarUrl = photoDataUrl;

      if (actor) {
        await actor.saveCallerUserProfile({
          name: form.name,
          avatarUrl,
          rollNumber: form.rollNumber,
        });
      }

      const profile: LocalUserProfile = {
        name: form.name,
        avatarUrl,
        rollNumber: form.rollNumber,
        role: form.role as UserRole,
        department: form.department,
        year: form.year || "N/A",
        bio: form.bio,
        principalId,
        course: form.course,
        yearOfDegree: form.yearOfDegree,
        division: form.division,
      };

      onComplete(profile);
      toast.success("Profile created! Welcome to campusX 🎉");
    } catch (_err) {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.95_0.02_265)] to-[oklch(0.97_0.01_250)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="bg-white rounded-3xl shadow-lg border border-[oklch(0.92_0.02_255)] p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-[oklch(0.95_0.03_265)] flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-7 h-7 text-[oklch(0.42_0.18_265)]" />
            </div>
            <h1 className="font-display text-2xl font-bold text-[oklch(0.17_0.025_260)] mb-1">
              Set up your profile
            </h1>
            <p className="text-[oklch(0.52_0.03_255)] text-sm">
              Help your campus community know you better
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Profile Photo */}
            <div className="flex flex-col items-center gap-3 mb-2">
              <button
                type="button"
                className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[oklch(0.88_0.02_250)] bg-[oklch(0.95_0.02_265)] cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload profile photo"
              >
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="w-8 h-8 text-[oklch(0.65_0.05_260)]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-medium text-[oklch(0.42_0.18_265)] hover:underline"
              >
                {photoPreview ? "Change photo" : "Add profile photo"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-[oklch(0.25_0.04_260)]"
              >
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g., Priya Sharma"
                className="h-11 rounded-xl border-[oklch(0.88_0.02_250)] focus-visible:ring-[oklch(0.42_0.18_265)]"
                required
              />
            </div>

            {/* Roll Number */}
            <div className="space-y-1.5">
              <Label
                htmlFor="rollNumber"
                className="text-sm font-medium text-[oklch(0.25_0.04_260)]"
              >
                Roll Number{" "}
                <span className="text-[oklch(0.6_0.02_255)] font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                id="rollNumber"
                value={form.rollNumber}
                onChange={(e) => update("rollNumber", e.target.value)}
                placeholder="e.g., CS2024001"
                className="h-11 rounded-xl border-[oklch(0.88_0.02_250)] focus-visible:ring-[oklch(0.42_0.18_265)]"
              />
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[oklch(0.25_0.04_260)]">
                Role <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {(["Student", "Faculty", "Admin"] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => update("role", role)}
                    className={`h-11 rounded-xl text-sm font-medium border-2 transition-all duration-150 ${
                      form.role === role
                        ? role === "Student"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : role === "Faculty"
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-red-500 bg-red-50 text-red-700"
                        : "border-[oklch(0.9_0.01_250)] bg-white text-[oklch(0.45_0.03_255)] hover:border-[oklch(0.75_0.05_265)]"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Department */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[oklch(0.25_0.04_260)]">
                Department <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.department}
                onValueChange={(v) => update("department", v)}
              >
                <SelectTrigger className="h-11 rounded-xl border-[oklch(0.88_0.02_250)]">
                  <SelectValue placeholder="Select your department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[oklch(0.25_0.04_260)]">
                Year
              </Label>
              <Select
                value={form.year}
                onValueChange={(v) => update("year", v)}
              >
                <SelectTrigger className="h-11 rounded-xl border-[oklch(0.88_0.02_250)]">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((yr) => (
                    <SelectItem key={yr} value={yr}>
                      {yr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Course */}
            <div className="space-y-1.5">
              <Label
                htmlFor="course"
                className="text-sm font-medium text-[oklch(0.25_0.04_260)]"
              >
                Course{" "}
                <span className="text-[oklch(0.6_0.02_255)] font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                id="course"
                value={form.course}
                onChange={(e) => update("course", e.target.value)}
                placeholder="e.g., B.Tech Computer Science"
                className="h-11 rounded-xl border-[oklch(0.88_0.02_250)] focus-visible:ring-[oklch(0.42_0.18_265)]"
              />
            </div>

            {/* Year of Degree + Division */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[oklch(0.25_0.04_260)]">
                  Year of Degree
                </Label>
                <Select
                  value={form.yearOfDegree}
                  onValueChange={(v) => update("yearOfDegree", v)}
                >
                  <SelectTrigger className="h-11 rounded-xl border-[oklch(0.88_0.02_250)]">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEGREE_YEARS.map((yr) => (
                      <SelectItem key={yr} value={yr}>
                        {yr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[oklch(0.25_0.04_260)]">
                  Division
                </Label>
                <Select
                  value={form.division}
                  onValueChange={(v) => update("division", v)}
                >
                  <SelectTrigger className="h-11 rounded-xl border-[oklch(0.88_0.02_250)]">
                    <SelectValue placeholder="Select div" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIVISIONS.map((d) => (
                      <SelectItem key={d} value={d}>
                        Division {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <Label
                htmlFor="bio"
                className="text-sm font-medium text-[oklch(0.25_0.04_260)]"
              >
                Bio{" "}
                <span className="text-[oklch(0.6_0.02_255)] font-normal">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="bio"
                value={form.bio}
                onChange={(e) => update("bio", e.target.value)}
                placeholder="Tell your campus community a bit about yourself..."
                className="rounded-xl border-[oklch(0.88_0.02_250)] resize-none focus-visible:ring-[oklch(0.42_0.18_265)]"
                rows={3}
              />
            </div>

            <Button
              type="submit"
              disabled={saving || !form.name || !form.role || !form.department}
              className="w-full h-12 text-base font-semibold bg-[oklch(0.42_0.18_265)] hover:bg-[oklch(0.38_0.18_265)] text-white rounded-xl mt-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating profile...
                </>
              ) : (
                "Join campusX →"
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
