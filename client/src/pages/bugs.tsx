import { useState } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useBugs, useCreateBug, useUpdateBug, useDeleteBug } from "@/hooks/use-bugs";
import { useDevelopers } from "@/hooks/use-developers";
import { StatusBadge, PriorityBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, MoreVertical, Trash2, Edit3, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["Low", "Medium", "High"]),
  status: z.enum(["Open", "In Progress", "Resolved"]),
  assigneeId: z.coerce.number().optional().nullable(),
});

export default function Bugs() {
  const { data: bugs, isLoading } = useBugs();
  const { data: developers } = useDevelopers();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [bugToDelete, setBugToDelete] = useState<number | null>(null);

  const createMutation = useCreateBug();
  const updateMutation = useUpdateBug();
  const deleteMutation = useDeleteBug();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "Medium",
      status: "Open",
      assigneeId: null,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createMutation.mutateAsync(values);
      toast({ title: "Success", description: "Bug reported successfully." });
      setIsCreateOpen(false);
      form.reset();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await updateMutation.mutateAsync({ id, status });
      toast({ title: "Updated", description: `Status changed to ${status}.` });
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  const handleUpdatePriority = async (id: number, priority: string) => {
    try {
      await updateMutation.mutateAsync({ id, priority });
      toast({ title: "Updated", description: `Priority changed to ${priority}.` });
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to update priority", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!bugToDelete) return;
    try {
      await deleteMutation.mutateAsync(bugToDelete);
      toast({ title: "Deleted", description: "Bug permanently removed." });
      setBugToDelete(null);
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to delete bug.", variant: "destructive" });
    }
  };

  const filteredBugs = bugs?.filter((bug: any) => 
    bug.title.toLowerCase().includes(search.toLowerCase()) || 
    bug.description.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Issues & Bugs</h1>
          <p className="text-muted-foreground mt-1">Track, assign, and resolve reported issues.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" /> Report Issue
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] border-border/50 bg-card backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle>Report a New Bug</DialogTitle>
              <DialogDescription>
                Provide detailed information so developers can reproduce and fix the issue.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g. Login page crashes on Safari" {...field} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Steps to reproduce, expected behavior, etc." {...field} className="bg-background min-h-[100px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="assigneeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assign To</FormLabel>
                        <Select 
                          onValueChange={(val) => field.onChange(val === "unassigned" ? null : Number(val))} 
                          defaultValue={field.value?.toString() || "unassigned"}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Select developer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {developers?.map((dev: any) => (
                              <SelectItem key={dev.id} value={dev.id.toString()}>{dev.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={createMutation.isPending} className="w-full sm:w-auto">
                    {createMutation.isPending ? "Submitting..." : "Submit Bug"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border/50 rounded-xl shadow-xl shadow-black/10 overflow-hidden backdrop-blur-sm">
        <div className="p-4 border-b border-border/50 flex items-center gap-2">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search issues..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background/50 border-border"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="w-[300px]">Issue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBugs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No issues found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBugs.map((bug: any) => (
                    <TableRow key={bug.id} className="border-border/50 hover:bg-muted/30 transition-colors group">
                      <TableCell className="font-medium">
                        <span className="text-sm text-muted-foreground mr-2 font-mono">#{bug.id}</span>
                        {bug.title}
                      </TableCell>
                      <TableCell><StatusBadge status={bug.status} /></TableCell>
                      <TableCell><PriorityBadge priority={bug.priority} /></TableCell>
                      <TableCell>
                        {bug.assignee ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
                              {bug.assignee.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-sm">{bug.assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(bug.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-card border-border/50">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger className="flex items-center">
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Change Status
                              </DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuSubContent className="bg-card border-border/50">
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(bug.id, "Open")}>Open</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(bug.id, "In Progress")}>In Progress</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(bug.id, "Resolved")}>Resolved</DropdownMenuItem>
                                </DropdownMenuSubContent>
                              </DropdownMenuPortal>
                            </DropdownMenuSub>

                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger className="flex items-center">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Set Priority
                              </DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuSubContent className="bg-card border-border/50">
                                  <DropdownMenuItem onClick={() => handleUpdatePriority(bug.id, "High")}>High</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUpdatePriority(bug.id, "Medium")}>Medium</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUpdatePriority(bug.id, "Low")}>Low</DropdownMenuItem>
                                </DropdownMenuSubContent>
                              </DropdownMenuPortal>
                            </DropdownMenuSub>

                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
                              onClick={() => setBugToDelete(bug.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Bug
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <AlertDialog open={!!bugToDelete} onOpenChange={(open) => !open && setBugToDelete(null)}>
        <AlertDialogContent className="border-border/50 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the issue from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-background">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
