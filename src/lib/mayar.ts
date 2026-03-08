import type {
  MayarCustomerResponse,
  MayarInvoiceResponse,
  MayarTransactionsResponse,
} from "@/types";

const MAYAR_API_KEY = process.env.MAYAR_API_KEY ?? "";
const MAYAR_BASE_URL = process.env.MAYAR_BASE_URL ?? "https://api.mayar.club/hl/v1";

interface MayarItem {
  quantity: number;
  rate: number;
  description: string;
}

interface CreateInvoiceInput {
  name: string;
  email: string;
  mobile: string;
  redirectUrl: string;
  description: string;
  expiredAt: string;
  items: MayarItem[];
  extraData?: Record<string, string>;
}

async function mayarFetch<T>(path: string, init: RequestInit): Promise<T> {
  if (!MAYAR_API_KEY) {
    throw new Error("MAYAR_API_KEY is not configured");
  }

  const res = await fetch(`${MAYAR_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${MAYAR_API_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Mayar API ${path} failed (${res.status}): ${body}`);
  }

  return (await res.json()) as T;
}

export async function createCustomer(input: {
  name: string;
  email: string;
  mobile: string;
}): Promise<MayarCustomerResponse> {
  return mayarFetch<MayarCustomerResponse>("/customer/create", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function createInvoice(
  input: CreateInvoiceInput,
): Promise<MayarInvoiceResponse> {
  const res = await mayarFetch<MayarInvoiceResponse>("/invoice/create", {
    method: "POST",
    body: JSON.stringify(input),
  });

  // Sandbox returns .myr.id links — the working domain is .mayar.shop
  if (res.data?.link) {
    res.data.link = res.data.link.replace(".myr.id", ".mayar.shop");
  }

  return res;
}

export async function getTransactions(page = 1): Promise<MayarTransactionsResponse> {
  return mayarFetch<MayarTransactionsResponse>(`/transaction/list?page=${page}`, {
    method: "GET",
  });
}

export interface MayarInvoiceDetail {
  id: string;
  amount: number;
  status: string;
  link: string;
  paymentUrl: string;
}

export async function getInvoiceDetail(invoiceId: string): Promise<MayarInvoiceDetail> {
  const res = await mayarFetch<{ data: MayarInvoiceDetail }>(`/invoice/${invoiceId}`, {
    method: "GET",
  });
  return res.data;
}
