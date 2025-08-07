// Quick fix for your pitch deck page - get the correct startupId:

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
import { savePitchDeckSection, getPitchDeckSectionsByStartup, createNewPitchDeckDocument } from "@/lib/db";
import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";

const deckSections = [
  { display: "Problem", key: "problem" },
  { display: "Solution", key: "solution" },
  { display: "Market Size", key: "market" },
  { display: "Model", key: "business_model" },
  { display: "Team", key: "team" },
  { display: "Roadmap", key: "traction" },
  { display: "Ask", key: "funding" }
];

export default function PitchDeckPage() {
  const { user } = useUser(); // Don't use startupId from context
  const [correctStartupId, setCorrectStartupId] = useState<string | null>(null); // Get it ourselves
  const [activeTab, setActiveTab] = useState(deckSections[0].key);
  const [content, setContent] = useState("");
  const [data, setData] = useState<Record<string, string>>({});

  // 🔧 Get the correct startupId from startup snapshot
  useEffect(() => {
    const fetchCorrectStartupId = async () => {
      if (!user?.$id) return;

      try {
        const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
        const SNAPSHOT_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_STARTUP_SNAPSHOT_COLLECTION_ID;

        const startupRes = await databases.listDocuments(DB_ID!, SNAPSHOT_COLLECTION!, [
          Query.equal("userId", user.$id),
          Query.limit(1),
        ]);

        if (startupRes.total > 0) {
          const correctId = startupRes.documents[0].startupId;
          //console.log("🔧 Pitch Deck: Using correct startupId:", correctId);
          setCorrectStartupId(correctId);
        }
      } catch (error) {
        console.error("Error fetching correct startup ID:", error);
      }
    };

    fetchCorrectStartupId();
  }, [user?.$id]);

  // Load saved pitch deck from DB
  useEffect(() => {
    const fetchSections = async () => {
      if (!correctStartupId || !user?.$id) return;

      try {
        const sectionsData = await getPitchDeckSectionsByStartup(correctStartupId, user.$id);
        setData(sectionsData || {});
      } catch (error) {
        console.error("Error loading pitch deck:", error);
        toast.error("Failed to load pitch deck sections");
      }
    };

    fetchSections();
  }, [correctStartupId, user?.$id]);

  // Update textarea content based on selected tab
  useEffect(() => {
    setContent(data[activeTab] || "");
  }, [activeTab, data]);

  // Save updated content to DB
  const handleSave = async () => {
    if (!user || !correctStartupId) {
      console.log("🔧 Pitch Deck: Missing user or startupId:", { 
        hasUser: !!user, 
        userId: user?.$id,
        correctStartupId 
      });
      return;
    }

    try {
      //console.log("🔧 Pitch Deck: Saving with correct startupId:", correctStartupId);
      
      await savePitchDeckSection({
        userId: user.$id,
        startupId: correctStartupId, // Use the correct startupId
        section: activeTab,
        content,
      });

      setData((prev) => ({
        ...prev,
        [activeTab]: content,
      }));

      toast.success("Section saved!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save section.");
    }
  };

  const handleCreateNewRecord = async () => {
  if (!user || !correctStartupId) {
    toast.error("Missing user or startupId");
    return;
  }

  try {
    const res = await createNewPitchDeckDocument({
      userId: user.$id,
      startupId: correctStartupId,
      initialSection: activeTab,
      content,
    });

    //console.log("✅ New record created:", res);

    // Reset state to show only the newly created section
    setData({ [activeTab]: content });
    toast.success("New pitch deck record created!");
  } catch (err) {
    console.error("Error creating new pitch deck record", err);
    toast.error("Failed to create new record.");
  }
};

  // Get display name for active tab
  const getDisplayName = (key: string) => {
    return deckSections.find(section => section.key === key)?.display || key;
  };

  if (!correctStartupId) {
    return <div className="p-6">Loading startup information...</div>;
  }

  return (
    <div className="space-y-6 px-6 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl">Pitch Deck Builder</h1>
          <p className="text-muted-foreground">Create a compelling pitch deck for your startup.</p>
        </div>
        <div className="flex items-center gap-2">
          {/*<Button variant="outline">Share Link</Button>*/}
          <Button onClick={handleSave}>Save</Button>
          <Button onClick={handleCreateNewRecord} variant="secondary">Add New Record</Button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 items-start">
        {/* Tabs */}
        <nav className="flex flex-col gap-1" aria-label="Pitch Deck Sections">
          {deckSections.map((section) => (
            <Button
              key={section.key}
              variant={activeTab === section.key ? "default" : "ghost"}
              className="justify-start"
              onClick={() => setActiveTab(section.key)}
            >
              {section.display}
            </Button>
          ))}
        </nav>

        {/* Editor */}
        <div className="flex-1 rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-2xl">{getDisplayName(activeTab)}</h3>
            <div className="flex items-center space-x-2">
              <Label htmlFor={`ai-toggle-${activeTab}`}>AI Generate</Label>
              <Switch id={`ai-toggle-${activeTab}`} disabled />
            </div>
          </div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Craft your compelling ${getDisplayName(activeTab).toLowerCase()} slide...`}
            className="min-h-[300px]"
          />
        </div>
      </div>
    </div>
  );
}