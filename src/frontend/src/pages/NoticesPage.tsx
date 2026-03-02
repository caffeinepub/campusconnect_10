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
import { AlertTriangle, Bell, Info, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import { PRIORITY_COLORS, formatTimeAgo } from "../utils/helpers";

export function NoticesPage() {
  const { currentUser, notices, addNotice } = useApp();
  const [showDialog, setShowDialog] = useState(false);
  const canPost =
    currentUser?.role === "Faculty" || currentUser?.role === "Admin";

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-[oklch(0.17_0.025_260)]">
            Notices & Announcements
          </h2>
          <p className="text-sm text-[oklch(0.52_0.03_255)] mt-0.5">
            Official communications from college administration
          </p>
        </div>
        {canPost && (
          <Button
            onClick={() => setShowDialog(true)}
            className="gap-2 bg-[oklch(0.42_0.18_265)] hover:bg-[oklch(0.38_0.18_265)] text-white rounded-xl"
            size="sm"
          >
            <Plus className="w-4 h-4" />
            Post Notice
          </Button>
        )}
      </div>

      {/* Notices list */}
      <div className="space-y-4">
        {notices.map((notice, index) => (
          <motion.div
            key={notice.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.06 }}
          >
            <NoticeCard notice={notice} />
          </motion.div>
        ))}
      </div>

      {notices.length === 0 && (
        <div className="text-center py-16">
          <Bell className="w-10 h-10 text-[oklch(0.7_0.04_255)] mx-auto mb-3" />
          <p className="text-[oklch(0.5_0.03_255)] font-medium">
            No notices yet.
          </p>
        </div>
      )}

      {/* Post notice dialog */}
      <PostNoticeDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        onSubmit={(data) => {
          addNotice({
            ...data,
            authorName: currentUser!.name,
            authorRole: currentUser!.role,
          });
          setShowDialog(false);
          toast.success("Notice posted successfully!");
        }}
      />
    </div>
  );
}

function NoticeCard({ notice }: { notice: import("../types/campus").Notice }) {
  const isImportant = notice.priority === "Important";
  return (
    <Card
      className={`border rounded-2xl overflow-hidden shadow-card ${isImportant ? "border-red-200 bg-red-50/30" : "border-[oklch(0.92_0.015_250)]"}`}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${isImportant ? "bg-red-100" : "bg-blue-50"}`}
          >
            {isImportant ? (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            ) : (
              <Info className="w-4 h-4 text-blue-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-display font-bold text-base text-[oklch(0.17_0.025_260)] leading-snug">
                {notice.title}
              </h3>
              <Badge
                className={`flex-shrink-0 text-xs rounded-full px-2 py-0 ${PRIORITY_COLORS[notice.priority]}`}
              >
                {notice.priority}
              </Badge>
            </div>
            <p className="text-sm text-[oklch(0.28_0.03_260)] leading-relaxed mb-3">
              {notice.content}
            </p>
            <div className="flex items-center gap-3 text-xs text-[oklch(0.55_0.03_255)]">
              <span className="font-medium">{notice.authorName}</span>
              <span>•</span>
              <span>{formatTimeAgo(notice.timestamp)}</span>
              {notice.department && (
                <>
                  <span>•</span>
                  <span>{notice.department}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PostNoticeDialog({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    content: string;
    priority: "Important" | "General";
    department?: string;
  }) => void;
}) {
  const [form, setForm] = useState({
    title: "",
    content: "",
    priority: "General" as "Important" | "General",
    department: "All Departments",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    onSubmit(form);
    setForm({
      title: "",
      content: "",
      priority: "General",
      department: "All Departments",
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold">
            Post a Notice
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Title</Label>
            <Input
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="Notice title"
              className="rounded-xl"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Content</Label>
            <Textarea
              value={form.content}
              onChange={(e) =>
                setForm((f) => ({ ...f, content: e.target.value }))
              }
              placeholder="Notice content..."
              className="rounded-xl resize-none"
              rows={4}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    priority: v as "Important" | "General",
                  }))
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Important">Important</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Department</Label>
              <Input
                value={form.department}
                onChange={(e) =>
                  setForm((f) => ({ ...f, department: e.target.value }))
                }
                placeholder="Department"
                className="rounded-xl"
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
              Post Notice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
