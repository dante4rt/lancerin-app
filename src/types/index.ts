export type UserRole = "freelancer" | "client";
export type GigStatus = "open" | "matched" | "completed" | "closed";
export type SwipeDirection = "left" | "right";
export type MatchStatus = "pending" | "accepted" | "in_progress" | "completed";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  role: UserRole;
  skills: string[];
  hourly_rate_min: number;
  hourly_rate_max: number;
  bio: string;
  portfolio_url: string;
  mobile: string;
  mayar_customer_id: string | null;
  onboarded: boolean;
  created_at: string;
}

export interface Gig {
  id: string;
  client_id: string;
  client_name: string;
  title: string;
  description: string;
  budget_min: number;
  budget_max: number;
  required_skills: string[];
  deadline: string;
  status: GigStatus;
  created_at: string;
}

export interface Swipe {
  id: string;
  user_id: string;
  gig_id: string;
  direction: SwipeDirection;
  created_at: string;
}

export interface Match {
  id: string;
  gig_id: string;
  freelancer_id: string;
  client_id: string;
  status: MatchStatus;
  mayar_invoice_id: string | null;
  mayar_invoice_url: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface MayarCustomerResponse {
  statusCode: number;
  messages: string;
  data: {
    name: string;
    email: string;
    mobile: string;
    userId: string;
    customerId: string;
  };
}

export interface MayarInvoiceResponse {
  statusCode: number;
  messages: string;
  data: {
    id: string;
    transactionId: string;
    link: string;
    expiredAt: number;
  };
}

export interface MayarTransaction {
  id: string;
  credit: number;
  status: string;
  balanceHistoryType: string;
  paymentMethod: string;
  customerId: string;
  createdAt: number;
  customer: {
    id: string;
    name: string;
    email: string;
    mobile: string;
  };
  paymentLink: {
    id: string;
    name: string;
  };
}

export interface MayarTransactionsResponse {
  statusCode: number;
  messages: string;
  hasMore: boolean;
  pageCount: number;
  pageSize: number;
  page: number;
  data: MayarTransaction[];
}

export interface AIMatchResult {
  gig_id: string;
  score: number;
  reason: string;
}

export interface RankedGig extends Gig {
  ai_score?: number;
  ai_reason?: string;
}
