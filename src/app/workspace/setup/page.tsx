"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2, FolderOpen, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useWorkspaceStore } from "@/store/workspace-store";
import { workspaceApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";

const schema = z.object({
  title: z.string().min(3, "Project title is required"),
  teamCode: z.string().min(3, "Team code is required"),
  adviserId: z.string().min(1, "Select a faculty adviser"),
  memberEmails: z
    .array(z.object({ email: z.string().email("Invalid email") }))
    .min(1, "Add at least one team member"),
});

type FormData = z.infer<typeof schema>;

export default function WorkspaceSetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuthStore();
  const { hasWorkspace, setWorkspace } = useWorkspaceStore();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: advisers = [], isLoading: advisersLoading } = useQuery({
    queryKey: ["advisers"],
    queryFn: workspaceApi.getAdvisers,
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: searchParams.get("title") ?? "",
      teamCode: "",
      adviserId: "",
      memberEmails: [{ email: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "memberEmails" });

  useEffect(() => {
    if (!isAuthenticated) router.replace("/");
    else if (user?.role === "FACULTY_ADVISER") router.replace("/adviser/dashboard");
    else if (hasWorkspace) router.replace("/workspace/ws-1");
  }, [isAuthenticated, user, hasWorkspace, router]);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setFormError(null);
    try {
      const workspace = await workspaceApi.create({
        title: data.title,
        teamCode: data.teamCode,
        adviserId: data.adviserId,
        memberEmails: data.memberEmails.map((m) => m.email),
      });
      setWorkspace(workspace);
      router.push(`/workspace/${workspace.id}`);
    } catch {
      setFormError("Failed to create workspace. Please check your inputs and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        icon={FolderOpen}
        title="Create Workspace"
        subtitle="Set up your capstone project workspace. You can submit artifacts after creation."
      />
      <Card>
        <CardHeader>
          <CardTitle>Initialize Project Workspace</CardTitle>
          <CardDescription>
            Set up your capstone project workspace. You can submit artifacts after creation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input id="title" placeholder="SyncTrace: Intelligent Project Continuity Assistant" {...register("title")} />
              {errors.title && <p className="text-sm text-status-fail">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamCode">Team Code</Label>
              <Input id="teamCode" placeholder="2526-sem2-it332-08" {...register("teamCode")} />
              {errors.teamCode && <p className="text-sm text-status-fail">{errors.teamCode.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="adviserId">Faculty Adviser</Label>
              <select
                id="adviserId"
                {...register("adviserId")}
                disabled={advisersLoading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select adviser...</option>
                {advisers.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.email})
                  </option>
                ))}
              </select>
              {errors.adviserId && <p className="text-sm text-status-fail">{errors.adviserId.message}</p>}
            </div>

            <div className="space-y-3">
              <Label>Team Members (Google Email)</Label>
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <Input
                    placeholder="member@cit.edu"
                    {...register(`memberEmails.${index}.email`)}
                  />
                  {fields.length > 1 && (
                    <Button type="button" variant="outline" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {errors.memberEmails && (
                <p className="text-sm text-status-fail">
                  {errors.memberEmails.message || errors.memberEmails.root?.message}
                </p>
              )}
              <Button type="button" variant="outline" size="sm" onClick={() => append({ email: "" })}>
                <Plus className="h-4 w-4 mr-1" /> Add Member
              </Button>
            </div>

            {formError && (
              <p className="text-sm text-status-fail bg-status-fail/10 border border-status-fail/30 rounded-lg px-4 py-3">
                {formError}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating workspace...
                </>
              ) : (
                "Create Workspace"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
