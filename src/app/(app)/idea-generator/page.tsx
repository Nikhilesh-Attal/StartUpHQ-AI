"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/UserContext";
import { createStartupIdea, getLatestStartupIdeas } from '@/lib/db';
import { Lightbulb, Wand2, History, RefreshCw } from "lucide-react";
import { useState, useEffect } from 'react';

interface StartupIdea {
  title: string;
  summary: string;
  score: number;
}

interface HistoricalIdea {
  id: string;
  prompt: string;
  category: string;
  generatedIdeas: string[];
  createdAt: string;
}

type StartupIdeasOutput = StartupIdea[];

export default function IdeaGeneratorPage() {
  const { user, startupId } = useUser();

  const [problem, setProblem] = useState("");
  const [category, setCategory] = useState("SaaS");
  const [currentIdeas, setCurrentIdeas] = useState<StartupIdeasOutput>([]);
  const [historicalIdeas, setHistoricalIdeas] = useState<HistoricalIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Debug user and startupId
  // useEffect(() => {
  //   console.log('🧑 User context:', {
  //     user: user ? { id: user.$id, name: user.name || 'Unknown' } : null,
  //     startupId
  //   });
  // }, [user, startupId]);

  const fetchIdeasFromAPI = async (problem: string, category: string) => {
    const response = await fetch("/api/ai/generate-ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problem, category }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.ideas;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem || !category) return;

    console.log('🚀 Starting idea generation...');
    setIsLoading(true);
    setCurrentIdeas([]);

    try {
      const result = await fetchIdeasFromAPI(problem, category);
      //console.log('💡 Generated ideas:', result);
      setCurrentIdeas(result);

      // Save to Appwrite
      if (user && startupId) {
        console.log('💾 Saving ideas to database...');
        for (let i = 0; i < result.length; i++) {
          const idea = result[i];
          //console.log(`💾 Saving idea ${i + 1}/${result.length}:`, idea.title);
          
          await createStartupIdea({
            userId: user.$id,
            startupId, // Make sure this is included
            prompt: problem,
            category,
            generatedIdea: JSON.stringify(idea),
          });
        }
        
        console.log('✅ All ideas saved, refreshing history...');
        // Wait a moment for database consistency
        setTimeout(() => {
          fetchHistoricalIdeas();
        }, 1000);
      } else {
        console.warn('⚠️ Missing user or startupId:', { user: !!user, startupId });
      }
    } catch (error) {
      console.error('❌ Error generating ideas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistoricalIdeas = async () => {
    if (!user || !startupId) {
      console.warn('⚠️ Cannot fetch history - missing user or startupId:', { 
        hasUser: !!user, 
        startupId 
      });
      return;
    }
    
    console.log('📚 Fetching historical ideas...');
    setIsLoadingHistory(true);
    try {
      const previousIdeas = await getLatestStartupIdeas(user.$id, startupId);
      //console.log('📚 Fetched historical ideas:', previousIdeas);
      setHistoricalIdeas(previousIdeas);
    } catch (error) {
      console.error('❌ Error fetching historical ideas:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (user && startupId) {
      fetchHistoricalIdeas();
    }
  }, [user, startupId]);

  const parseIdea = (ideaString: string): StartupIdea | null => {
    try {
      return JSON.parse(ideaString);
    } catch (error) {
      console.error('Error parsing idea:', error, 'Raw string:', ideaString);
      return null;
    }
  };

  return (
    <div className="grid gap-8">
      {/* Debug Info - Remove this in production */}
      {/*{process.env.NODE_ENV === 'development' && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-sm">Debug Info</CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            <p>User: {user ? user.$id : 'Not loaded'}</p>
            <p>StartupId: {startupId || 'Not loaded'}</p>
            <p>Historical Ideas Count: {historicalIdeas.length}</p>
            <p>Loading History: {isLoadingHistory ? 'Yes' : 'No'}</p>
          </CardContent>
        </Card>
      )}*/}

      {/* Idea Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Startup Idea Generator</CardTitle>
          <CardDescription>Describe a problem you want to solve, and let AI generate potential startup ideas for you.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="problem-description">Problem Description</Label>
              <Textarea
                id="problem-description"
                placeholder="e.g., 'Professionals struggle to find healthy lunch options near their offices.'"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category" className="w-full md:w-[240px]">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SaaS">SaaS</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="E-commerce">E-commerce</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button type="submit" disabled={isLoading || !problem}>
              {isLoading ? 'Generating...' : 'Generate Ideas'}
              <Wand2 className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={fetchHistoricalIdeas}
              disabled={isLoadingHistory || !user || !startupId}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
              <CardFooter>
                <Skeleton className="h-8 w-1/4" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Current Generated Ideas */}
      {currentIdeas.length > 0 && (
        <div>
          <h2 className="font-headline text-xl mb-4">Generated Ideas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentIdeas.map((idea, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" /> {idea.title}
                  </CardTitle>
                  <CardDescription>{idea.summary}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <div className="text-sm font-medium">
                    Potential Score: <span className="text-primary font-bold">{idea.score}/10</span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Historical Ideas */}
      <div>
        <h2 className="font-headline text-xl mb-4 flex items-center gap-2">
          <History className="h-5 w-5" />
          Previous Ideas ({historicalIdeas.length})
        </h2>
        
        {isLoadingHistory ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-1/4 mb-2" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : historicalIdeas.length > 0 ? (
          <div className="space-y-6">
            {historicalIdeas.map((historicalEntry) => (
              <Card key={historicalEntry.id} className="border-l-4 border-l-primary/20">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Problem: {historicalEntry.prompt}
                      </CardTitle>
                      <CardDescription>
                        Category: {historicalEntry.category} • {new Date(historicalEntry.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {historicalEntry.generatedIdeas?.map((ideaString, index) => {
                      const idea = parseIdea(ideaString);
                      if (!idea) {
                        return 
                          {/*<Card key={index} className="bg-red-50 border-red-200">
                            <CardContent className="p-4">
                              <p className="text-red-600 text-sm">Failed to parse idea</p>
                              <p className="text-xs text-gray-500 mt-2">{ideaString}</p>
                            </CardContent>
                          </Card>*/}
                          null;
                        
                      }
                      
                      return (
                        <Card key={index} className="bg-muted/50">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Lightbulb className="h-4 w-4 text-primary" />
                              {idea.title}
                            </CardTitle>
                            <CardDescription className="text-sm">
                              {idea.summary}
                            </CardDescription>
                          </CardHeader>
                          <CardFooter className="pt-0">
                            <div className="text-xs font-medium">
                              Score: <span className="text-primary font-bold">{idea.score}/10</span>
                            </div>
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No previous ideas found. Generate your first idea above!</p>
                {!user && <p className="text-sm mt-2">User not loaded</p>}
                {!startupId && <p className="text-sm mt-2">StartupId not loaded</p>}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}