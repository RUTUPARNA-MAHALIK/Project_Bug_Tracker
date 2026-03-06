import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "Open":
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-medium tracking-wide">
          Open
        </Badge>
      );
    case "In Progress":
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 font-medium tracking-wide">
          In Progress
        </Badge>
      );
    case "Resolved":
      return (
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-medium tracking-wide">
          Resolved
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function PriorityBadge({ priority }: { priority: string }) {
  switch (priority) {
    case "High":
      return (
        <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 font-medium tracking-wide shadow-[0_0_10px_rgba(244,63,94,0.1)]">
          High
        </Badge>
      );
    case "Medium":
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 font-medium tracking-wide">
          Medium
        </Badge>
      );
    case "Low":
      return (
        <Badge variant="outline" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20 font-medium tracking-wide">
          Low
        </Badge>
      );
    default:
      return <Badge variant="outline">{priority}</Badge>;
  }
}
