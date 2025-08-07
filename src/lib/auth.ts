import { account } from "./appwrite";
import { ID } from "appwrite";
import { databases } from "./appwrite";
import { DB_ID, USERS_COLLECTION } from "./constants";

export async function registerUserWithStartup({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  // Step 1: Create user
  await account.create(ID.unique(), email, password, name);

  // Step 2: Login the user (creates session so account.get() works)
  await account.createEmailPasswordSession(email, password);

  // Step 3: Get current user
  const user = await account.get();

  const startupId = ID.unique(); // or nanoid()

  // Step 4: Create user document
  await databases.createDocument(
    DB_ID,
    USERS_COLLECTION,
    user.$id, // use user ID as document ID
    {
      userId: user.$id,
      email: user.email,
      name: user.name,
      startupId,
      createdAt: new Date().toISOString(), // ✅ Make sure it's in the schema
    }
  );

  return user;
}

/**
 * Create a new Appwrite account
 */
export async function createAccount({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name: string;
}) {
  return account.create(ID.unique(), email, password, name);
}

/**
 * Log in an existing user
 */
export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  // Step 1: Check for existing session
  try {
    const user = await account.get();
    // If a user is already logged in, redirect them to the dashboard.
    // This is useful if they manually navigate to the /login page.
    console.log("🔁 User already logged in, redirecting to dashboard...");
    window.location.href = "/dashboard";
    return;
  } catch {
    // No session — proceed with login
  }

  // Step 2: Create session
  const session = await account.createEmailPasswordSession(email, password);
  console.log("✅ Session created:", session);

  // Step 3: Redirect to the dashboard on successful login
  window.location.href = "/dashboard";
  return session;
}

/**
 * Log out the current session
 */
export async function logout() {
  try {
    await account.deleteSession('current');
    console.log("✅ Logged out successfully");
  } catch (err) {
    console.error("❌ Logout failed:", err);
  }
}

/**
 * Get current logged-in user
 */

export async function getCurrentUser() {
  return account.get();
}
