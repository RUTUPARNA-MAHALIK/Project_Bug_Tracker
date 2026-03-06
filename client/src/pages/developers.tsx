import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDevelopers, useCreateDeveloper } from "@/hooks/use-developers";
import { useBugs } from "@/hooks/use-bugs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Mail, Bug, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

export default function Developers() {
  const { data: developers, isLoading } = useDevelopers();
  const { data: bugs } = useBugs();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const createMutation = useCreateDeveloper();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createMutation.mutateAsync(values);
      toast({ title: "Success", description: "Developer added successfully." });
      setIsOpen(false);
      form.reset();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const getBugsAssigned = (devId: number) => {
    if (!bugs) return { total: 0, open: 0 };
    const devBugs = bugs.filter((b: any) => b.assigneeId === devId);
    return {
      total: devBugs.length,
      open: devBugs.filter((b: any) => b.status === "Open" || b.status === "In Progress").length
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Team Roster</h1>
          <p className="text-muted-foreground mt-1">Manage developers and view their current load.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" /> Add Developer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] border-border/50 bg-card backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>
                Add a new developer to assign issues to.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe" {...field} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="jane@example.com" type="email" {...field} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Adding..." : "Add Developer"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-[200px] rounded-xl" />)
        ) : developers?.length === 0 ? (
          <div className="col-span-full h-48 flex items-center justify-center border border-dashed border-border rounded-xl bg-card/30">
            <p className="text-muted-foreground text-center">
              No developers found.<br/>Click "Add Developer" to invite your team.
            </p>
          </div>
        ) : (
          developers?.map((dev: any) => {
            const stats = getBugsAssigned(dev.id);
            return (
              <Card key={dev.id} className="border-border/50 bg-card/40 backdrop-blur hover:border-primary/30 transition-colors group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-purple-500/30 text-primary-foreground flex items-center justify-center font-display font-bold text-lg border border-white/10 shadow-inner group-hover:scale-105 transition-transform">
                        {dev.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{dev.name}</CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Mail className="w-3 h-3 mr-1" />
                          {dev.email}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="bg-background/50 rounded-lg p-3 border border-border/40">
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
                        <Briefcase className="w-3.5 h-3.5" /> Total Assigned
                      </div>
                      <div className="text-2xl font-bold font-display">{stats.total}</div>
                    </div>
                    <div className="bg-background/50 rounded-lg p-3 border border-border/40">
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
                        <Bug className="w-3.5 h-3.5 text-amber-500" /> Active Bugs
                      </div>
                      <div className="text-2xl font-bold font-display text-amber-400">{stats.open}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
