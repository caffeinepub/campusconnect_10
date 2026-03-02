import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  BarChart2,
  CheckCircle2,
  Clock,
  Loader2,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { UserAvatar } from "../components/UserAvatar";
import { useApp } from "../context/AppContext";
import type { Poll } from "../types/campus";

function formatDeadline(deadline: string): string {
  const date = new Date(deadline);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (diff < 0) return "Ended";
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h left`;
  return "Ending soon";
}

export function PollsPage() {
  const { currentUser, polls } = useApp();
  const [createOpen, setCreateOpen] = useState(false);

  const activePolls = polls.filter((p) => p.active);
  const endedPolls = polls.filter((p) => !p.active);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">
            Campus Polls
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Vote on matters that affect your campus life
          </p>
        </div>
        {currentUser && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
              >
                <Plus className="w-4 h-4" />
                Create Poll
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-2xl bg-card">
              <CreatePollForm
                onSuccess={() => {
                  setCreateOpen(false);
                  toast.success("Poll created successfully!");
                }}
                onCancel={() => setCreateOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Active Polls */}
      {activePolls.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <BarChart2 className="w-4 h-4" />
            Active Polls ({activePolls.length})
          </h3>
          {activePolls.map((poll, index) => (
            <motion.div
              key={poll.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.06 }}
            >
              <PollCard poll={poll} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Ended Polls */}
      {endedPolls.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Ended Polls
          </h3>
          {endedPolls.map((poll, index) => (
            <motion.div
              key={poll.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.06 }}
            >
              <PollCard poll={poll} readOnly />
            </motion.div>
          ))}
        </div>
      )}

      {polls.length === 0 && (
        <div className="text-center py-16">
          <BarChart2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">
            No polls yet. Create the first one!
          </p>
        </div>
      )}
    </div>
  );
}

function PollCard({
  poll,
  readOnly = false,
}: { poll: Poll; readOnly?: boolean }) {
  const { currentUser, votePoll, hasVotedPoll } = useApp();
  const principalId = currentUser?.principalId ?? "";
  const votedOptionId = principalId ? hasVotedPoll(poll.id, principalId) : null;
  const hasVoted = !!votedOptionId;
  const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes, 0);
  const deadlineStr = formatDeadline(poll.deadline);
  const isExpired = new Date(poll.deadline) < new Date();
  const showResults = hasVoted || readOnly || isExpired;

  function handleVote(optionId: string) {
    if (!principalId || hasVoted || readOnly || isExpired) return;
    votePoll(poll.id, optionId, principalId);
    toast.success("Vote recorded!");
  }

  return (
    <Card className="border-border shadow-card rounded-2xl bg-card overflow-hidden">
      <CardHeader className="pb-3 pt-4 px-5">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base font-semibold text-card-foreground leading-snug">
            {poll.question}
          </CardTitle>
          {(hasVoted || isExpired) && (
            <Badge
              variant="secondary"
              className="text-xs shrink-0 bg-secondary text-secondary-foreground"
            >
              {isExpired ? "Ended" : "Voted"}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
          <div className="flex items-center gap-1">
            <UserAvatar name={poll.authorName} avatarUrl="" size="xs" />
            <span>{poll.authorName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{totalVotes} votes</span>
          </div>
          <div
            className={`flex items-center gap-1 ${isExpired ? "text-destructive" : "text-campus-green"}`}
          >
            <Clock className="w-3 h-3" />
            <span>{deadlineStr}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5 space-y-2.5">
        {poll.options.map((option) => {
          const percentage =
            totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
          const isMyVote = votedOptionId === option.id;
          const isLeading =
            option.votes === Math.max(...poll.options.map((o) => o.votes)) &&
            totalVotes > 0;

          if (showResults) {
            return (
              <div key={option.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span
                    className={`font-medium ${isMyVote ? "text-primary" : "text-card-foreground"} flex items-center gap-1.5`}
                  >
                    {isMyVote && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    )}
                    {option.text}
                  </span>
                  <span
                    className={`text-xs font-semibold ${isLeading ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {percentage}%
                  </span>
                </div>
                <div className="relative">
                  <Progress
                    value={percentage}
                    className={`h-2 ${isMyVote ? "[&>div]:bg-primary" : isLeading ? "[&>div]:bg-primary/70" : "[&>div]:bg-muted-foreground/30"} bg-muted`}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {option.votes} votes
                </p>
              </div>
            );
          }

          return (
            <button
              type="button"
              key={option.id}
              onClick={() => handleVote(option.id)}
              className="w-full text-left px-4 py-3 rounded-xl border border-border bg-secondary/40 hover:bg-primary/10 hover:border-primary/50 text-sm font-medium text-card-foreground transition-all duration-150 active:scale-[0.99]"
            >
              {option.text}
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

function CreatePollForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const { currentUser, addPoll } = useApp();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<{ id: string; text: string }[]>([
    { id: "new-0", text: "" },
    { id: "new-1", text: "" },
  ]);
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });
  const [saving, setSaving] = useState(false);

  function addOption() {
    if (options.length < 4)
      setOptions((prev) => [...prev, { id: `new-${Date.now()}`, text: "" }]);
  }

  function removeOption(id: string) {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((o) => o.id !== id));
  }

  function updateOption(id: string, value: string) {
    setOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, text: value } : opt)),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) return;
    const validOptions = options.filter((o) => o.text.trim());
    if (validOptions.length < 2) {
      toast.error("Please provide at least 2 options");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    addPoll({
      question: question.trim(),
      options: validOptions.map((opt, i) => ({
        id: `opt-${Date.now()}-${i}`,
        text: opt.text.trim(),
        votes: 0,
      })),
      authorId: currentUser.principalId,
      authorName: currentUser.name,
      deadline: new Date(deadline).toISOString(),
      active: true,
    });
    setSaving(false);
    onSuccess();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-display text-lg">Create Poll</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">
            Question
          </Label>
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What would you like to ask?"
            className="rounded-xl bg-background border-border"
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Options</Label>
          {options.map((option, index) => (
            <div key={option.id} className="flex gap-2">
              <Input
                value={option.text}
                onChange={(e) => updateOption(option.id, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="rounded-xl flex-1 bg-background border-border"
                required
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(option.id)}
                  className="p-2 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {options.length < 4 && (
            <button
              type="button"
              onClick={addOption}
              className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add option
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">
            Deadline
          </Label>
          <Input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="rounded-xl bg-background border-border"
            required
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
            disabled={saving || !question.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {saving ? "Creating..." : "Create Poll"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
