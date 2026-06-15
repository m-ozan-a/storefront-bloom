import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_OWUAN_API_URL || "https://app.owuan.com";
const STORE_API_KEY = process.env.OWUAN_STORE_API_KEY || "";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(req, path.join("/"), "GET");
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(req, path.join("/"), "POST");
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(req, path.join("/"), "PATCH");
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(req, path.join("/"), "DELETE");
}

async function proxyRequest(req: NextRequest, path: string, method: string) {
  const url = new URL(req.url);
  const searchParams = url.searchParams.toString();
  const targetUrl = `${API_URL}/api/${path}${searchParams ? `?${searchParams}` : ""}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Store-API-Key": STORE_API_KEY,
  };

  // Forward Authorization header if present (for authenticated requests)
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  // Forward domain for tenant resolution
  const domain = req.headers.get("x-store-domain");
  if (domain) {
    headers["X-Store-Domain"] = domain;
  }

  try {
    const fetchOptions: RequestInit = { method, headers };

    if (method !== "GET" && method !== "DELETE") {
      const body = await req.text();
      if (body) {
        fetchOptions.body = body;
      }
    }

    const res = await fetch(targetUrl, fetchOptions);
    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "Proxy request failed" },
      { status: 502 }
    );
  }
}
