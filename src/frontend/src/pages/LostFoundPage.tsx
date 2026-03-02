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
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  Loader2,
  MapPin,
  Package,
  Phone,
  Plus,
  Search,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { UserAvatar } from "../components/UserAvatar";
import { useApp } from "../context/AppContext";
import type { LostFoundItem } from "../types/campus";
import { formatTimeAgo } from "../utils/helpers";

type FilterType = "all" | "lost" | "found";

export function LostFoundPage() {
  const { currentUser, lostFoundItems } = useApp();
  const [filter, setFilter] = useState<FilterType>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [createType, setCreateType] = useState<"lost" | "found">("lost");

  const filtered = lostFoundItems.filter((item) => {
    if (filter === "lost") return item.isLost;
    if (filter === "found") return !item.isLost;
    return true;
  });

  const activeItems = filtered.filter((item) => !item.resolved);
  const resolvedItems = filtered.filter((item) => item.resolved);

  const lostCount = lostFoundItems.filter(
    (i) => i.isLost && !i.resolved,
  ).length;
  const foundCount = lostFoundItems.filter(
    (i) => !i.isLost && !i.resolved,
  ).length;

  function openCreate(type: "lost" | "found") {
    setCreateType(type);
    setCreateOpen(true);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">
            Lost & Found
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Help your fellow students recover their belongings
          </p>
        </div>
        {currentUser && (
          <div className="flex gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => openCreate("found")}
              className="gap-1.5 rounded-xl text-xs border-border hidden sm:flex"
            >
              <Package className="w-3.5 h-3.5" />
              Found Item
            </Button>
            <Button
              size="sm"
              onClick={() => openCreate("lost")}
              className="gap-1.5 rounded-xl text-xs bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              <Search className="w-3.5 h-3.5" />
              Lost Item
            </Button>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Lost Items",
            count: lostCount,
            color: "text-destructive",
            bg: "bg-destructive/10",
          },
          {
            label: "Found Items",
            count: foundCount,
            color: "text-campus-green",
            bg: "bg-campus-green/10",
          },
          {
            label: "Resolved",
            count: lostFoundItems.filter((i) => i.resolved).length,
            color: "text-muted-foreground",
            bg: "bg-muted",
          },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className={`rounded-xl p-3 text-center ${bg}`}>
            <p className={`font-display font-bold text-lg ${color}`}>{count}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 bg-muted p-1 rounded-xl w-fit">
        {(["all", "lost", "found"] as FilterType[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
              filter === f
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? "All" : f === "lost" ? "Lost" : "Found"}
          </button>
        ))}
      </div>

      {/* Active items */}
      {activeItems.length > 0 && (
        <div className="space-y-3">
          {activeItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <LostFoundCard item={item} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Resolved items */}
      {resolvedItems.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Resolved
          </h3>
          {resolvedItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
            >
              <LostFoundCard item={item} />
            </motion.div>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <MapPin className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">
            No {filter !== "all" ? filter : ""} items reported yet.
          </p>
          {currentUser && (
            <p className="text-muted-foreground text-sm mt-1">
              Be the first to report a lost or found item!
            </p>
          )}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-card">
          <ReportItemForm
            type={createType}
            onSuccess={() => {
              setCreateOpen(false);
              toast.success(
                `${createType === "lost" ? "Lost" : "Found"} item reported!`,
              );
            }}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LostFoundCard({ item }: { item: LostFoundItem }) {
  const { currentUser, resolveLostFoundItem } = useApp();
  const isOwner = currentUser?.principalId === item.authorId;

  return (
    <Card
      className={`border-border rounded-2xl bg-card overflow-hidden shadow-card ${
        item.resolved ? "opacity-60" : ""
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              item.isLost
                ? "bg-destructive/15 text-destructive"
                : "bg-campus-green/15 text-campus-green"
            }`}
          >
            {item.isLost ? (
              <Search className="w-5 h-5" />
            ) : (
              <Package className="w-5 h-5" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <h3 className="font-semibold text-sm text-card-foreground leading-snug">
                {item.title}
              </h3>
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge
                  className={`text-[11px] ${
                    item.resolved
                      ? "bg-muted text-muted-foreground"
                      : item.isLost
                        ? "bg-destructive/15 text-destructive border-destructive/20"
                        : "bg-campus-green/15 text-campus-green border-campus-green/20"
                  }`}
                  variant="outline"
                >
                  {item.resolved ? "Resolved" : item.isLost ? "Lost" : "Found"}
                </Badge>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              {item.description}
            </p>

            <div className="flex items-center gap-1.5 mt-2 text-xs text-primary">
              <Phone className="w-3 h-3" />
              <span className="truncate">{item.contactInfo}</span>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <UserAvatar name={item.authorName} avatarUrl="" size="xs" />
                <span>{item.authorName}</span>
                <span>·</span>
                <span>{formatTimeAgo(item.timestamp)}</span>
              </div>

              {isOwner && !item.resolved && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => resolveLostFoundItem(item.id)}
                  className="h-7 px-3 text-xs rounded-lg gap-1 border-border text-muted-foreground hover:text-foreground"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Resolve
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ReportItemForm({
  type,
  onSuccess,
  onCancel,
}: {
  type: "lost" | "found";
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const { currentUser, addLostFoundItem } = useApp();
  const [form, setForm] = useState({
    title: "",
    description: "",
    contactInfo: "",
    imageUrl: "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    addLostFoundItem({
      title: form.title.trim(),
      description: form.description.trim(),
      contactInfo: form.contactInfo.trim(),
      isLost: type === "lost",
      authorId: currentUser.principalId,
      authorName: currentUser.name,
      imageUrl: form.imageUrl.trim() || undefined,
    });
    setSaving(false);
    onSuccess();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-display text-lg">
          Report {type === "lost" ? "Lost" : "Found"} Item
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">
            Item Name / Title
          </Label>
          <Input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder={
              type === "lost"
                ? "e.g., Blue Calculator"
                : "e.g., Found Black Wallet"
            }
            className="rounded-xl bg-background border-border"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">
            Description
          </Label>
          <Textarea
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="Describe the item, where it was lost/found, any identifying features..."
            className="rounded-xl resize-none bg-background border-border"
            rows={3}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">
            Contact Information
          </Label>
          <Input
            value={form.contactInfo}
            onChange={(e) =>
              setForm((f) => ({ ...f, contactInfo: e.target.value }))
            }
            placeholder="Email, phone, room number..."
            className="rounded-xl bg-background border-border"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">
            Image URL{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </Label>
          <Input
            value={form.imageUrl}
            onChange={(e) =>
              setForm((f) => ({ ...f, imageUrl: e.target.value }))
            }
            placeholder="https://..."
            className="rounded-xl bg-background border-border"
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="rounded-xl border-border"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className={`rounded-xl text-white ${
              type === "lost"
                ? "bg-destructive hover:bg-destructive/90"
                : "bg-campus-green hover:bg-campus-green/90"
            }`}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {saving
              ? "Reporting..."
              : `Report ${type === "lost" ? "Lost" : "Found"}`}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
