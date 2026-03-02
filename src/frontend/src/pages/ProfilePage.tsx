import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Building,
  Camera,
  Edit3,
  GraduationCap,
  Hash,
  Heart,
  ImageIcon,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { RoleBadge } from "../components/RoleBadge";
import { UserAvatar } from "../components/UserAvatar";
import { useApp } from "../context/AppContext";
import { useActor } from "../hooks/useActor";
import type { LocalUserProfile } from "../types/campus";
import { formatTimeAgo } from "../utils/helpers";

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
    const img = new window.Image();
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

export function ProfilePage() {
  const { currentUser, setCurrentUser, posts } = useApp();
  const { actor } = useActor();
  const [showEdit, setShowEdit] = useState(false);
  const [changingPhoto, setChangingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) return null;

  const myPosts = posts.filter((p) => p.authorId === currentUser.principalId);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!currentUser) return;
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

    const user = currentUser;
    setChangingPhoto(true);
    try {
      const avatarUrl = await resizeImageToDataUrl(file, 256);

      if (actor) {
        await actor.saveCallerUserProfile({
          name: user.name,
          avatarUrl,
          rollNumber: user.rollNumber ?? "",
        });
      }

      setCurrentUser({ ...user, avatarUrl });
      toast.success("Profile photo updated!");
    } catch (err) {
      console.error("Photo change error:", err);
      toast.error("Failed to update photo. Please try again.");
    } finally {
      setChangingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Profile header card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-[oklch(0.92_0.015_250)] shadow-card rounded-2xl overflow-hidden">
          {/* Cover gradient */}
          <div className="h-28 bg-gradient-to-br from-[oklch(0.42_0.18_265)] via-[oklch(0.48_0.2_245)] to-[oklch(0.38_0.16_280)]" />

          <CardContent className="px-6 pb-6">
            {/* Avatar + edit button row */}
            <div className="flex items-end justify-between -mt-10 mb-4">
              {/* Avatar with change photo overlay */}
              <div className="relative ring-4 ring-white rounded-full group">
                <UserAvatar
                  name={currentUser.name}
                  avatarUrl={currentUser.avatarUrl}
                  size="xl"
                />
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={changingPhoto}
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  aria-label="Change profile photo"
                >
                  {changingPhoto ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5 text-white" />
                  )}
                </button>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>

              <Button
                onClick={() => setShowEdit(true)}
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-xl border-[oklch(0.88_0.02_250)] text-[oklch(0.35_0.04_260)] hover:border-[oklch(0.42_0.18_265)] hover:text-[oklch(0.42_0.18_265)]"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Profile
              </Button>
            </div>

            {/* User info */}
            <div className="space-y-3">
              <div>
                <h2 className="font-display text-2xl font-bold text-[oklch(0.17_0.025_260)]">
                  {currentUser.name}
                </h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <RoleBadge role={currentUser.role} />
                </div>
              </div>

              {currentUser.bio && (
                <p className="text-sm text-[oklch(0.35_0.03_260)] leading-relaxed">
                  {currentUser.bio}
                </p>
              )}

              <div className="flex flex-wrap gap-3 text-sm text-[oklch(0.45_0.03_255)]">
                <div className="flex items-center gap-1.5">
                  <Building className="w-4 h-4 flex-shrink-0" />
                  <span>{currentUser.department}</span>
                </div>
                {currentUser.year && currentUser.year !== "N/A" && (
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 flex-shrink-0" />
                    <span>{currentUser.year}</span>
                  </div>
                )}
              </div>

              {/* Course / Year of Degree / Division / Roll Number row */}
              {(currentUser.course ||
                currentUser.yearOfDegree ||
                currentUser.division ||
                currentUser.rollNumber) && (
                <div className="flex flex-wrap gap-2">
                  {currentUser.course && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[oklch(0.93_0.04_265)] text-[oklch(0.35_0.1_265)]">
                      {currentUser.course}
                    </span>
                  )}
                  {currentUser.yearOfDegree && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[oklch(0.93_0.03_235)] text-[oklch(0.35_0.08_240)]">
                      {currentUser.yearOfDegree}
                    </span>
                  )}
                  {currentUser.division && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[oklch(0.93_0.03_155)] text-[oklch(0.35_0.1_155)]">
                      Division {currentUser.division}
                    </span>
                  )}
                  {currentUser.rollNumber && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[oklch(0.93_0.04_45)] text-[oklch(0.38_0.1_45)]">
                      <Hash className="w-3 h-3" />
                      {currentUser.rollNumber}
                    </span>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="flex gap-6 pt-2 border-t border-[oklch(0.95_0.01_250)]">
                <div className="text-center">
                  <p className="font-display font-bold text-lg text-[oklch(0.17_0.025_260)]">
                    {myPosts.length}
                  </p>
                  <p className="text-xs text-[oklch(0.55_0.03_255)]">Posts</p>
                </div>
                <div className="text-center">
                  <p className="font-display font-bold text-lg text-[oklch(0.17_0.025_260)]">
                    {myPosts.reduce((acc, p) => acc + p.likes.length, 0)}
                  </p>
                  <p className="text-xs text-[oklch(0.55_0.03_255)]">
                    Likes received
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-display font-bold text-lg text-[oklch(0.17_0.025_260)]">
                    {myPosts.reduce((acc, p) => acc + p.comments.length, 0)}
                  </p>
                  <p className="text-xs text-[oklch(0.55_0.03_255)]">
                    Comments received
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* My posts section */}
      <div>
        <h3 className="font-display font-bold text-base text-[oklch(0.17_0.025_260)] mb-3">
          My Posts
        </h3>
        {myPosts.length === 0 ? (
          <Card className="border-[oklch(0.92_0.015_250)] rounded-2xl">
            <CardContent className="p-10 text-center">
              <ImageIcon className="w-8 h-8 text-[oklch(0.7_0.04_255)] mx-auto mb-3" />
              <p className="text-[oklch(0.5_0.03_255)] text-sm">
                You haven't posted anything yet.
              </p>
              <p className="text-[oklch(0.6_0.02_255)] text-xs mt-1">
                Share something with your campus community!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {myPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="border-[oklch(0.92_0.015_250)] shadow-card rounded-2xl overflow-hidden">
                  <CardContent className="p-4">
                    <p className="text-sm text-[oklch(0.22_0.03_260)] leading-relaxed mb-3 whitespace-pre-wrap">
                      {post.content}
                    </p>
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt=""
                        className="w-full max-h-48 object-cover rounded-xl mb-3"
                        loading="lazy"
                      />
                    )}
                    <div className="flex items-center gap-4 text-xs text-[oklch(0.55_0.03_255)]">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-red-400" />
                        {post.likes.length} likes
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5 text-blue-400" />
                        {post.comments.length} comments
                      </div>
                      <span className="ml-auto">
                        {formatTimeAgo(post.timestamp)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={showEdit}
        onClose={() => setShowEdit(false)}
        initialData={currentUser}
        onSave={async (data) => {
          try {
            if (actor) {
              await actor.saveCallerUserProfile({
                name: data.name,
                avatarUrl: currentUser.avatarUrl,
                rollNumber: data.rollNumber,
              });
            }
            setCurrentUser({
              ...currentUser,
              ...data,
            });
            setShowEdit(false);
            toast.success("Profile updated successfully!");
          } catch {
            toast.error("Failed to update profile. Please try again.");
          }
        }}
      />
    </div>
  );
}

function EditProfileDialog({
  open,
  onClose,
  initialData,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initialData: LocalUserProfile;
  onSave: (data: {
    name: string;
    bio: string;
    department: string;
    year: string;
    course: string;
    yearOfDegree: string;
    division: string;
    rollNumber: string;
  }) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: initialData.name,
    bio: initialData.bio,
    department: initialData.department,
    year: initialData.year,
    course: initialData.course ?? "",
    yearOfDegree: initialData.yearOfDegree ?? "",
    division: initialData.division ?? "",
    rollNumber: initialData.rollNumber ?? "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold">
            Edit Profile
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Full Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="rounded-xl"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Roll Number</Label>
            <Input
              value={form.rollNumber}
              onChange={(e) =>
                setForm((f) => ({ ...f, rollNumber: e.target.value }))
              }
              placeholder="e.g., CS2024001"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Bio</Label>
            <Textarea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              className="rounded-xl resize-none"
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Department</Label>
            <Input
              value={form.department}
              onChange={(e) =>
                setForm((f) => ({ ...f, department: e.target.value }))
              }
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Year</Label>
            <Select
              value={form.year}
              onValueChange={(v) => setForm((f) => ({ ...f, year: v }))}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
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
            <Label className="text-sm font-medium">Course</Label>
            <Input
              value={form.course}
              onChange={(e) =>
                setForm((f) => ({ ...f, course: e.target.value }))
              }
              placeholder="e.g., B.Tech Computer Science"
              className="rounded-xl"
            />
          </div>

          {/* Year of Degree + Division */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Year of Degree</Label>
              <Select
                value={form.yearOfDegree}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, yearOfDegree: v }))
                }
              >
                <SelectTrigger className="rounded-xl">
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
              <Label className="text-sm font-medium">Division</Label>
              <Select
                value={form.division}
                onValueChange={(v) => setForm((f) => ({ ...f, division: v }))}
              >
                <SelectTrigger className="rounded-xl">
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-[oklch(0.42_0.18_265)] hover:bg-[oklch(0.38_0.18_265)] text-white rounded-xl"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
