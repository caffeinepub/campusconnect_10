import { Badge } from "@/components/ui/badge";
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
  BookOpen,
  Calendar,
  MapPin,
  Music,
  Plus,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import type { Activity } from "../types/campus";
import { CATEGORY_COLORS, formatDate } from "../utils/helpers";

const CATEGORY_ICONS = {
  Sports: Trophy,
  Cultural: Music,
  Academic: BookOpen,
  Club: Star,
};

export function ActivitiesPage() {
  const { currentUser, activities, addActivity } = useApp();
  const [showDialog, setShowDialog] = useState(false);
  const [filter, setFilter] = useState<string>("All");
  const canAdd =
    currentUser?.role === "Faculty" || currentUser?.role === "Admin";

  const categories = ["All", "Sports", "Cultural", "Academic", "Club"];
  const filtered =
    filter === "All"
      ? activities
      : activities.filter((a) => a.category === filter);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-[oklch(0.17_0.025_260)]">
            Activities & Events
          </h2>
          <p className="text-sm text-[oklch(0.52_0.03_255)] mt-0.5">
            Upcoming events and activities in your campus
          </p>
        </div>
        {canAdd && (
          <Button
            onClick={() => setShowDialog(true)}
            className="gap-2 bg-[oklch(0.42_0.18_265)] hover:bg-[oklch(0.38_0.18_265)] text-white rounded-xl"
            size="sm"
          >
            <Plus className="w-4 h-4" />
            Add Activity
          </Button>
        )}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            type="button"
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
              filter === cat
                ? "bg-[oklch(0.42_0.18_265)] text-white shadow-sm"
                : "bg-white text-[oklch(0.45_0.03_255)] border border-[oklch(0.9_0.01_250)] hover:border-[oklch(0.75_0.05_265)] hover:text-[oklch(0.3_0.05_265)]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Activities grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.06 }}
          >
            <ActivityCard activity={activity} />
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Calendar className="w-10 h-10 text-[oklch(0.7_0.04_255)] mx-auto mb-3" />
          <p className="text-[oklch(0.5_0.03_255)] font-medium">
            No activities in this category.
          </p>
        </div>
      )}

      {/* Add activity dialog */}
      <AddActivityDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        onSubmit={(data) => {
          addActivity({
            ...data,
            organizer: currentUser!.name,
            registrations: 0,
          });
          setShowDialog(false);
          toast.success("Activity added successfully!");
        }}
      />
    </div>
  );
}

function ActivityCard({ activity }: { activity: Activity }) {
  const CategoryIcon = CATEGORY_ICONS[activity.category];
  const [registered, setRegistered] = useState(false);

  return (
    <Card className="border-[oklch(0.92_0.015_250)] shadow-card rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${CATEGORY_COLORS[activity.category]} bg-opacity-50`}
            >
              <CategoryIcon className="w-4.5 h-4.5" size={18} />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-[oklch(0.17_0.025_260)] leading-tight">
                {activity.name}
              </h3>
              <Badge
                className={`text-xs rounded-full px-2 py-0 mt-0.5 ${CATEGORY_COLORS[activity.category]}`}
              >
                {activity.category}
              </Badge>
            </div>
          </div>
        </div>

        <p className="text-sm text-[oklch(0.35_0.03_260)] leading-relaxed mb-4 line-clamp-3">
          {activity.description}
        </p>

        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs text-[oklch(0.45_0.03_255)]">
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              {formatDate(activity.date)} — {activity.time}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[oklch(0.45_0.03_255)]">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{activity.location}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[oklch(0.45_0.03_255)]">
            <Users className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              {activity.registrations + (registered ? 1 : 0)} registered •
              Organized by {activity.organizer}
            </span>
          </div>
        </div>

        <Button
          onClick={() => setRegistered((v) => !v)}
          size="sm"
          variant={registered ? "outline" : "default"}
          className={`w-full rounded-xl h-8 text-xs font-semibold ${
            registered
              ? "border-[oklch(0.42_0.18_265)] text-[oklch(0.42_0.18_265)] hover:bg-[oklch(0.95_0.02_265)]"
              : "bg-[oklch(0.42_0.18_265)] hover:bg-[oklch(0.38_0.18_265)] text-white"
          }`}
        >
          {registered ? "✓ Registered" : "Register Interest"}
        </Button>
      </CardContent>
    </Card>
  );
}

function AddActivityDialog({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    data: Omit<Activity, "id" | "organizer" | "registrations">,
  ) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    date: "",
    time: "10:00 AM",
    category: "Academic" as Activity["category"],
    location: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.date || !form.location) {
      toast.error("Please fill in all required fields");
      return;
    }
    onSubmit(form);
    setForm({
      name: "",
      description: "",
      date: "",
      time: "10:00 AM",
      category: "Academic",
      location: "",
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold">
            Add New Activity
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Activity Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g., Annual Coding Hackathon"
              className="rounded-xl"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Activity description..."
              className="rounded-xl resize-none"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Date *</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
                className="rounded-xl"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Time</Label>
              <Input
                value={form.time}
                onChange={(e) =>
                  setForm((f) => ({ ...f, time: e.target.value }))
                }
                placeholder="e.g., 10:00 AM"
                className="rounded-xl"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    category: v as Activity["category"],
                  }))
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Academic">Academic</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Cultural">Cultural</SelectItem>
                  <SelectItem value="Club">Club</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Location *</Label>
              <Input
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
                placeholder="e.g., Main Auditorium"
                className="rounded-xl"
                required
              />
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
              className="bg-[oklch(0.42_0.18_265)] hover:bg-[oklch(0.38_0.18_265)] text-white rounded-xl"
            >
              Add Activity
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
