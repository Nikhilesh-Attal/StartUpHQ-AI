// lib/db.ts
import { databases } from './appwrite';
import { ID, Query } from 'appwrite';

// === ENV IDs ===
const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? '';
const IDEAS_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_IDEAS_COLLECTION_ID ?? '';
const CANVAS_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_CANVAS_COLLECTION_ID ?? '';
const VALIDATION_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_VALIDATION_COLLECTION_ID ?? '';
const ROADMAP_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_ROADMAP_COLLECTION_ID ?? '';
const PITCH_DECK_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_PITCH_COLLECTION_ID ?? '';
const SNAPSHOT_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_STARTUP_SNAPSHOT_COLLECTION_ID ?? '';
const USERS_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID ?? '';

if (!DB_ID || !IDEAS_COLLECTION || !CANVAS_COLLECTION || !VALIDATION_COLLECTION || !ROADMAP_COLLECTION || !PITCH_DECK_COLLECTION || !SNAPSHOT_COLLECTION || !USERS_COLLECTION) {
  throw new Error("Some Appwrite environment variables are missing.");
}
if(!SNAPSHOT_COLLECTION){
  console.log("Snapshot collection id is missing")
}
// === 1. Startup Ideas ===
// export const createStartupIdea = async ({ userId, prompt, category, generatedIdea }: { userId: string; prompt: string; category: string; generatedIdea: string; }) => {
//   return await databases.createDocument(DB_ID, IDEAS_COLLECTION, ID.unique(), {
//     userId,
//     prompt,
//     category,
//     generatedIdeas : [generatedIdea],
//     createdAt: new Date().toISOString(),
//   });
// };

export const getStartupIdeasByStartup = async (startupId: string, userId:string) => {
  return await databases.listDocuments(DB_ID, IDEAS_COLLECTION, [
    Query.equal('startupId', startupId),
    Query.equal('userId', userId),
    //Query.equal('userId', userId),
    Query.orderDesc('$createdAt'),
  ]);
};

// === 3. Validation Engine ===
export const createValidationEntry = async ({ userId, startupId, entryData }: { userId: string; startupId: string; entryData: Record<string, any>; }) => {
  return await databases.createDocument(DB_ID, VALIDATION_COLLECTION, ID.unique(), {
    userId,
    startupId,
    createdAt: new Date().toISOString(),
    validation_json: JSON.stringify(entryData),
  });
};

export const getValidationEntriesByStartup = async (startupId: string, userId: string) => {
  const res = await databases.listDocuments(DB_ID, VALIDATION_COLLECTION, [
    Query.equal("startupId", startupId),
    Query.equal("userId", userId),
  ]);

  return res.documents.map((doc) => {
    const parsed = JSON.parse(doc.validation_json);
    return {
      id: doc.$id,
      ...parsed,
    };
  });
};

export const deleteValidationEntry = async (id: string) => {
  return await databases.deleteDocument(DB_ID, VALIDATION_COLLECTION, id);
};

export const updateValidationEntry = async ({ id, updates }: { id: string; updates: Partial<{ title: string; notes: string; status: string }> }) => {
  return await databases.updateDocument(DB_ID, VALIDATION_COLLECTION, id, updates);
};

export async function createValidationResult({ userId, startupId, validation_json }: { userId: string; startupId: string; validation_json: any }) {
  return await databases.createDocument(DB_ID, VALIDATION_COLLECTION, ID.unique(), {
    userId,
    startupId,
    validation_json,
    createdAt: new Date().toISOString(),
  });
}

// === 4. Roadmap ===
export const createRoadmapTask = async ({ userId, startupId, title, assignee, dueDate, tag, status }: { userId: string; startupId: string; title: string; assignee: string; dueDate: string; tag: string; status: string; }) => {
  return await databases.createDocument(DB_ID, ROADMAP_COLLECTION, ID.unique(), {
    userId,
    startupId,
    title,
    assignee,
    dueDate,
    tag,
    status,
  });
};

export const getRoadmapTasksByStartup = async (startupId: string, userId: string) => {
  const existing = await databases.listDocuments(DB_ID, ROADMAP_COLLECTION, [
    Query.equal('startupId', startupId),
    Query.equal('userId', userId),
  ]);

  if (existing.total === 0) return null;

  const doc = existing.documents[0];
  const board = JSON.parse(doc.board_json);
  return board;
};

// === 5. Pitch Deck ===
export const savePitchDeckSection = async ({
  userId,
  startupId,
  section,
  content,
}: {
  userId: string;
  startupId: string;
  section: string;
  content: string;
}) => {
  console.log("DB: Saving pitch deck section:", { userId, startupId, section, contentLength: content.length });
  
  const existing = await databases.listDocuments(DB_ID, PITCH_DECK_COLLECTION, [
    Query.equal("userId", userId),
    Query.equal("startupId", startupId),
  ]);

  let updatedSlides = {};

  if (existing.total > 0) {
    const current = existing.documents[0];
    const currentSlides = JSON.parse(current.slides_json || "{}");
    console.log("DB: Current slides before update:", currentSlides);
    
    updatedSlides = {
      ...currentSlides,
      [section]: content,
    };

    console.log("DB: Updated slides:", updatedSlides);

    return await databases.updateDocument(DB_ID, PITCH_DECK_COLLECTION, current.$id, {
      slides_json: JSON.stringify(updatedSlides),
    });
  } else {
    updatedSlides = { [section]: content };
    console.log("DB: Creating new pitch deck with:", updatedSlides);
    
    return await databases.createDocument(DB_ID, PITCH_DECK_COLLECTION, ID.unique(), {
      userId,
      startupId,
      createdAt: new Date().toISOString(),
      slides_json: JSON.stringify(updatedSlides),
    });
  }
};

// === 6. Users ===
export const ensureUserDocument = async (userId: string, name: string, email: string) => {
  const startupId = ID.unique();

  const existing = await databases.listDocuments(DB_ID, USERS_COLLECTION, [
    Query.equal("userId", userId),
  ]);

  if (existing.total === 0) {
    const userDoc = await databases.createDocument(DB_ID, USERS_COLLECTION, ID.unique(), {
      userId,
      name,
      email,
      startupId,
      createdAt: new Date().toISOString(),
    });
    return userDoc;
  }

  return existing.documents[0];
};

// === 7. Startup Snapshot ===
export const createOrUpdateSnapshot = async ({ userId, startupId, name, description, team }: { userId: string; startupId: string; name: string; description: string; team: string[] }) => {
  const existing = await databases.listDocuments(DB_ID, SNAPSHOT_COLLECTION, [
    Query.equal("userId", userId),
    Query.equal("startupId", startupId),
  ]);

  if (existing.total > 0) {
    return await databases.updateDocument(DB_ID, SNAPSHOT_COLLECTION, existing.documents[0].$id, {
      name,
      description,
      team,
    });
  } else {
    return await databases.createDocument(DB_ID, SNAPSHOT_COLLECTION, ID.unique(), {
      userId,
      startupId,
      name,
      description,
      team,
    });
  }
};


/**
 * Create or update startup snapshot document
 */
// === 7. Startup Snapshot ===

export const updateStartupSnapshot = async ({
  userId,
  startupId,
  name,
  description,
  team,
}: {
  userId: string;
  startupId: string;
  name: string;
  description: string;
  team: string[];
}) => {
  const existing = await databases.listDocuments(DB_ID, SNAPSHOT_COLLECTION, [
    Query.equal("userId", userId),
    Query.equal("startupId", startupId),
  ]);

  if (existing.total > 0) {
    return await databases.updateDocument(DB_ID, SNAPSHOT_COLLECTION, existing.documents[0].$id, {
      name,
      description,
      team,
    });
  } else {
    return await databases.createDocument(DB_ID, SNAPSHOT_COLLECTION, ID.unique(), {
      userId,
      startupId,
      name,
      description,
      team,
      //createdAt: new Date().toISOString(),
    });
  }
};

export async function getStartupSnapshot(startupId: string, userId: string) {
  const response = await databases.listDocuments(DB_ID, SNAPSHOT_COLLECTION, [
    Query.equal("startupId", startupId),
    Query.equal("userId", userId),
    Query.limit(100),
  ]);

  return response.documents[0];
}

export const getPitchDeckSectionsByStartup = async (startupId: string, userId: string) => {
  const res = await databases.listDocuments(DB_ID, PITCH_DECK_COLLECTION, [
    Query.equal("startupId", startupId),
    Query.equal("userId", userId),
    Query.limit(100),
  ]);

  if (res.total === 0) return {};

  const doc = res.documents[0];
  return JSON.parse(doc.slides_json || "{}");
};

export const getSlidesByStartup = async (startupId: string, userId: string) => {
  const res = await databases.listDocuments(DB_ID, PITCH_DECK_COLLECTION, [
    Query.equal("startupId", startupId),
    Query.equal("userId", userId),
    Query.orderDesc("$createdAt"),
    Query.limit(100),
  ]);

  if (res.total === 0) return null;

  try {
    return JSON.parse(res.documents[0].slides_json);
    console.error("slides_json content:", res.documents[0].slides_json);
  } catch (error) {
    console.error("Failed to parse slides_json:", error);
    return null;
  }
};

//======= Update Roadmap Broad =======
// === Update Roadmap Board ===
export const updateRoadmapBoard = async ({
  userId,
  startupId,
  newTask,
}: {
  userId: string;
  startupId: string;
  newTask: {
    title: string;
    assignee: string;
    dueDate: string;
    tag: string;
    status: string;
  };
}) => {
  const existing = await databases.listDocuments(DB_ID, ROADMAP_COLLECTION, [
    Query.equal("startupId", startupId),
    Query.equal("userId", userId),
  ]);

  if (existing.total > 0) {
    // 🛠 Update existing board
    const doc = existing.documents[0];
    const board = JSON.parse(doc.board_json || "{}");

    // Ensure status column exists
    if (!board[newTask.status]) {
      board[newTask.status] = [];
    }

    // Add new task
    board[newTask.status].push({
      id: ID.unique(),
      ...newTask,
    });

    return await databases.updateDocument(DB_ID, ROADMAP_COLLECTION, doc.$id, {
      board_json: JSON.stringify(board),
      createdAt: new Date().toISOString(),
    });
  } else {
    // 🆕 Create new board document
    const board = {
      [newTask.status]: [
        {
          id: ID.unique(),
          ...newTask,
        },
      ],
    };

    return await databases.createDocument(DB_ID, ROADMAP_COLLECTION, ID.unique(), {
      userId,
      startupId,
      board_json: JSON.stringify(board),
      createdAt: new Date().toISOString(),
    });
  }
};

// === 2. Lean Canvas ===
// Add this function to your db.ts file to fix the lean canvas collection reference:

export async function saveCanvasBlock({
  userId,
  startupId,
  version,
  canvas_json,
}: {
  userId: string;
  startupId: string;
  version: string;
  canvas_json: Record<string, any>;
}) {
  try {
    const existing = await databases.listDocuments(DB_ID, CANVAS_COLLECTION, [ // Use CANVAS_COLLECTION instead of hardcoded string
      Query.equal("startupId", startupId),
      Query.equal("userId", userId), // Add userId filter for security
      Query.equal("version", version),
    ]);

    const jsonString = JSON.stringify(canvas_json);

    if (existing.total > 0) {
      return await databases.updateDocument(DB_ID, CANVAS_COLLECTION, existing.documents[0].$id, {
        canvas_json: jsonString,
      });
    }

    return await databases.createDocument(DB_ID, CANVAS_COLLECTION, ID.unique(), {
      userId,
      startupId,
      version,
      canvas_json: jsonString,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to save lean canvas:", error);
    throw error;
  }
}

export async function getCanvasByStartup(startupId: string, userId: string, version: string = "v1") {
  try {
    const res = await databases.listDocuments(DB_ID, CANVAS_COLLECTION, [
      Query.equal("startupId", startupId),
      Query.equal("userId", userId), // Add userId filter for security
      Query.equal("version", version),
      Query.orderDesc("$createdAt"),
      Query.limit(100),
    ]);

    if (res.total === 0) return null;

    const doc = res.documents[0];

    return {
      ...doc,
      canvas_json: JSON.parse(doc.canvas_json),
    };
  } catch (error) {
    console.error("Failed to fetch canvas:", error);
    return null;
  }
}

export async function getAllCanvasVersions(startupId: string, userId: string) {
  try {
    const res = await databases.listDocuments(DB_ID, "lean_canvas", [
      Query.equal("startupId", startupId),
      Query.equal("userId", userId),
    ]);

    const versions = res.documents.map((doc) => doc.version);
    return versions;
  } catch (error) {
    console.error("Failed to fetch canvas versions:", error);
    return [];
  }
}

// === Users: Get founder or team member by userId ===
export const getUserById = async (userId: string) => {
  const users = await databases.listDocuments(DB_ID, USERS_COLLECTION, [
    Query.equal("userId", userId),
    Query.limit(100),
  ]);
  return users.total > 0 ? users.documents[0] : null;
};

// === Users: Get all users with same startupId (team) ===
export const getTeamMembers = async (startupId: string, userId:string) => {
  const members = await databases.listDocuments(DB_ID, USERS_COLLECTION, [
    Query.equal("startupId", startupId),
    Query.equal("userId", userId),
  ]);
  return members.documents;
};

export async function createStartup({
  userId,
  name,
  description,
  founderName,
}: {
  userId: string
  name: string
  description: string
  founderName: string
}) {
  const startupId = ID.unique()

  await databases.createDocument(
    DB_ID,
    SNAPSHOT_COLLECTION, // Collection ID
    startupId,
    {
      userId,
      startupId,
      name,
      description,
      team: [], // empty for now
      owner_name: founderName,
      //createdAt: new Date().toISOString(),
    }
  )

  return startupId
}

// Create a new empty pitch deck document manually
export const createNewPitchDeckDocument = async ({
  userId,
  startupId,
  initialSection,
  content,
}: {
  userId: string;
  startupId: string;
  initialSection: string;
  content: string;
}) => {
  const slides = {
    [initialSection]: content,
  };

  return await databases.createDocument(DB_ID, PITCH_DECK_COLLECTION, ID.unique(), {
    userId,
    startupId,
    createdAt: new Date().toISOString(),
    slides_json: JSON.stringify(slides),
  });
};

// Replace the getLatestStartupIdeas function in your db.ts with this:

// Replace your getLatestStartupIdeas function with this version that includes debugging:

export const getLatestStartupIdeas = async (userId: string, startupId: string) => {
  try {
    console.log('🔍 Fetching ideas for:', { userId, startupId, DB_ID, IDEAS_COLLECTION });
    
    const response = await databases.listDocuments(
      DB_ID,
      IDEAS_COLLECTION,
      [
        Query.equal('userId', userId),
        // Remove startupId filter temporarily to see if that's the issue
        // Query.equal('startupId', startupId), // Comment this out temporarily
        Query.orderDesc('$createdAt'),
        Query.limit(10)
      ]
    );

    console.log('📊 Raw response from database:', {
      total: response.total,
      documents: response.documents.length,
      firstDoc: response.documents[0] || 'No documents found'
    });

    const mappedResults = response.documents.map((doc) => {
      console.log('📄 Document structure:', {
        id: doc.$id,
        userId: doc.userId,
        startupId: doc.startupId,
        prompt: doc.prompt,
        category: doc.category,
        generatedIdeas: doc.generatedIdeas,
        createdAt: doc.createdAt || doc.$createdAt
      });

      return {
        id: doc.$id,
        prompt: doc.prompt,
        category: doc.category,
        generatedIdeas: doc.generatedIdeas || [], // Fallback to empty array
        createdAt: doc.createdAt || doc.$createdAt, // Try both field names
      };
    });

    console.log('✅ Mapped results:', mappedResults);
    return mappedResults;
  } catch (error) {
    console.error('❌ Error fetching startup ideas:', error);
    return [];
  }
};

// UPDATE your createStartupIdea function to include startupId and better debugging:

export const createStartupIdea = async ({ 
  userId, 
  startupId, // Add this parameter
  prompt, 
  category, 
  generatedIdea 
}: { 
  userId: string; 
  startupId: string; // Add this type
  prompt: string; 
  category: string; 
  generatedIdea: string; 
}) => {
  console.log('💾 Creating startup idea:', {
    userId,
    startupId,
    prompt,
    category,
    generatedIdea: generatedIdea.substring(0, 100) + '...'
  });

  try {
    const result = await databases.createDocument(DB_ID, IDEAS_COLLECTION, ID.unique(), {
      userId,
      startupId, // Include startupId in the document
      prompt,
      category,
      generatedIdeas: [generatedIdea], // Keep as array to match your existing structure
      createdAt: new Date().toISOString(),
    });

    console.log('✅ Idea saved successfully:', result.$id);
    return result;
  } catch (error) {
    console.error('❌ Error saving idea:', error);
    throw error;
  }
};