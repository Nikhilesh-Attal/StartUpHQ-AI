"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/UserContext";
import { createValidationEntry, getValidationEntriesByStartup, deleteValidationEntry } from "@/lib/db";
import { PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Entry = {
  id: string;
  type: "experiment" | "survey" | "interview";
  name: string;
  successMetric?: string;
  outcome?: string;
  questions?: string[];
  notes?: string;
  interviewee?: string;
  status: string;
};

export default function ValidationPage() {
  const { user, startupId,  } = useUser();
  const [entries, setEntries] = useState<Entry[]>([]);

  const [experiment, setExperiment] = useState({ name: "", successMetric: "" });
  const [survey, setSurvey] = useState({ q1: "", q2: "" });
  const [interview, setInterview] = useState({ interviewee: "", notes: "" });

  // Load all validation entries
  useEffect(() => {
    const loadEntries = async () => {
      if (!startupId) return;
      const data = await getValidationEntriesByStartup(startupId, user?.$id || "");
      setEntries(data || []);
    };
    loadEntries();
  }, [startupId]);

const handleCreate = async (type: "experiment" | "survey" | "interview") => {
  if (!user || !startupId) {
    toast.error("User or startup not found. Please log in and select a startup.");
    return;
  }

  let entryData: any = null;

  if (type === "experiment" && experiment.name && experiment.successMetric) {
    entryData = {
      type,
      name: experiment.name,
      successMetric: experiment.successMetric,
      status: "In Progress",
      outcome: "Pending",
    };
  } else if (type === "survey" && survey.q1 && survey.q2) {
    entryData = {
      type,
      name: "Customer Survey",
      questions: [survey.q1, survey.q2],
      status: "Draft",
      outcome: "Pending",
    };
  } else if (type === "interview" && interview.interviewee && interview.notes) {
    entryData = {
      type,
      name: "Customer Interview",
      interviewee: interview.interviewee,
      notes: interview.notes,
      status: "Done",
      outcome: "Pending",
    };
  } else {
    toast.error("Please fill all fields");
    return;
  }

  try {
    const created = await createValidationEntry({
      userId: user.$id,
      startupId,
      entryData,
    });

    const newEntry: Entry = {
      id: created.$id,
      ...entryData, // ← directly spread it
    };

    setEntries((prev) => [...prev, newEntry]);
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added!`);

    // Reset form fields
    if (type === "experiment") setExperiment({ name: "", successMetric: "" });
    if (type === "survey") setSurvey({ q1: "", q2: "" });
    if (type === "interview") setInterview({ interviewee: "", notes: "" });
  } catch (e) {
    console.error(e);
    toast.error("Error saving entry");
  }
};

const handleDelete = async (id: string) => {
  await deleteValidationEntry(id);
  setEntries(prev => prev.filter(e => e.id !== id));
  toast.success("Entry deleted");
};


  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl">Validation Engine</h1>
        <p className="text-muted-foreground">Test your hypotheses and gather feedback.</p>
      </div>

      <Tabs defaultValue="experiments" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="experiments">Experiments</TabsTrigger>
          <TabsTrigger value="surveys">Surveys</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
        </TabsList>

        {/* ✅ Experiments */}
        <TabsContent value="experiments">
          <Card>
            <CardHeader>
              <CardTitle>Experiments</CardTitle>
              <CardDescription>Track your validation experiments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Experiment Name</Label>
                  <Input
                    placeholder="e.g. Pricing Test"
                    value={experiment.name}
                    onChange={(e) => setExperiment({ ...experiment, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Success Metric</Label>
                  <Input
                    placeholder="e.g. 10 signups"
                    value={experiment.successMetric}
                    onChange={(e) => setExperiment({ ...experiment, successMetric: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={() => handleCreate("experiment")}>
                <PlusCircle className="h-4 w-4 mr-1" />
                Add Experiment
              </Button>

              <Table className="mt-6">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Success Metric</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries
                    .filter((e) => e.type === "experiment")
                    .map((e) => (
                      <TableRow key={e.id}>
                        <TableCell>{e.name}</TableCell>
                        <TableCell><Badge variant="outline">{e.status}</Badge></TableCell>
                        <TableCell>{e.successMetric}</TableCell>
                        <TableCell><Badge>{e.outcome}</Badge></TableCell>
                        <TableCell>
                          <Button variant={"destructive"} onClick={() => handleDelete(e.id)}>Delete</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ✅ Surveys */}
        <TabsContent value="surveys">
  <Card>
    <CardHeader>
      <CardTitle>Surveys</CardTitle>
      <CardDescription>Gather structured feedback from users.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Form Fields */}
      <Label>Question 1</Label>
      <Input
        placeholder="e.g. How often do you use task managers?"
        value={survey.q1}
        onChange={(e) => setSurvey({ ...survey, q1: e.target.value })}
      />
      <Label>Question 2</Label>
      <Textarea
        placeholder="e.g. What’s your biggest pain point?"
        value={survey.q2}
        onChange={(e) => setSurvey({ ...survey, q2: e.target.value })}
      />
      <Button onClick={() => handleCreate("survey")}>
        <PlusCircle className="h-4 w-4 mr-1" />
        Add Survey
      </Button>

      {/* ✅ Survey Results Table */}
      <Table className="mt-6">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Question 1</TableHead>
            <TableHead>Question 2</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries
            .filter((e) => e.type === "survey")
            .map((e) => (
              <TableRow key={e.id}>
                <TableCell>{e.name}</TableCell>
                <TableCell><Badge variant="outline">{e.status}</Badge></TableCell>
                <TableCell>{e.questions?.[0]}</TableCell>
                <TableCell>{e.questions?.[1]}</TableCell>
                <TableCell><Button variant={"destructive"} onClick={() => handleDelete(e.id)}>Delete</Button></TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</TabsContent>

        {/* ✅ Interviews */}
        <TabsContent value="interviews">
  <Card>
    <CardHeader>
      <CardTitle>Interviews</CardTitle>
      <CardDescription>Log qualitative insights from users.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Form Fields */}
      <Label>Interviewee</Label>
      <Input
        placeholder="e.g. John Doe"
        value={interview.interviewee}
        onChange={(e) => setInterview({ ...interview, interviewee: e.target.value })}
      />
      <Label>Notes</Label>
      <Textarea
        placeholder="e.g. Key insights from interview..."
        value={interview.notes}
        onChange={(e) => setInterview({ ...interview, notes: e.target.value })}
        className="min-h-[150px]"
      />
      <Button onClick={() => handleCreate("interview")}>
        <PlusCircle className="h-4 w-4 mr-1" />
        Add Interview
      </Button>

      {/* ✅ Interview Results Table */}
      <Table className="mt-6">
        <TableHeader>
          <TableRow>
            <TableHead>Interviewee</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries
            .filter((e) => e.type === "interview")
            .map((e) => (
              <TableRow key={e.id}>
                <TableCell>{e.interviewee}</TableCell>
                <TableCell><Badge variant="outline">{e.status}</Badge></TableCell>
                <TableCell>{e.notes}</TableCell>
                <TableCell><Button variant={"destructive"} onClick={() => handleDelete(e.id)}>Delete</Button></TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
