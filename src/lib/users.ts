import { v4 as uuidv4 } from "uuid";
import type { Session } from "next-auth";
import { readCollection, writeCollection } from "@/lib/db";
import type { User, UserRole } from "@/types";

function defaultUser(session: Session, role: UserRole = "freelancer"): User {
  return {
    id: uuidv4(),
    email: session.user?.email ?? "",
    name: session.user?.name ?? "Anonymous",
    avatar_url: session.user?.image ?? "",
    role,
    skills: [],
    hourly_rate_min: 0,
    hourly_rate_max: 0,
    bio: "",
    portfolio_url: "",
    mobile: "",
    mayar_customer_id: null,
    onboarded: false,
    created_at: new Date().toISOString(),
  };
}

export function listUsers(): User[] {
  return readCollection<User>("users");
}

export function saveUsers(users: User[]): void {
  writeCollection("users", users);
}

export function findUserByEmail(email: string): User | null {
  const users = listUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export function findUserById(id: string): User | null {
  const users = listUsers();
  return users.find((u) => u.id === id) ?? null;
}

export function upsertUserFromSession(session: Session, role?: UserRole): User {
  const email = session.user?.email;
  if (!email) {
    throw new Error("Session email is required");
  }

  const users = listUsers();
  const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
  if (idx >= 0) {
    const next = {
      ...users[idx],
      name: session.user?.name ?? users[idx].name,
      avatar_url: session.user?.image ?? users[idx].avatar_url,
      role: role ?? users[idx].role,
    };
    users[idx] = next;
    saveUsers(users);
    return next;
  }

  const created = defaultUser(session, role);
  users.push(created);
  saveUsers(users);
  return created;
}
