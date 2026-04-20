"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import Container from "@/components/container";
import { Subheading } from "@/components/subheading";
import { DottedSeparator } from "@/components/separator";
import { Box } from "@/components/box";
import {
  RefreshCw,
  Mail,
  MessageSquare,
  Users,
  Globe,
  Bell,
  Database,
} from "lucide-react";

interface ContactInquiryRecord {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  source: string | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface NewsletterSubscriberRecord {
  id: number;
  email: string;
  source: string | null;
  ip: string | null;
  userAgent: string | null;
  isActive: boolean;
  subscribedAt: string;
  updatedAt: string;
}

interface LeadsApiResponse {
  contactInquiries: ContactInquiryRecord[];
  newsletterSubscribers: NewsletterSubscriberRecord[];
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncate(value: string, length = 100) {
  if (value.length <= length) return value;
  return `${value.slice(0, length - 1)}…`;
}

export default function AdminLeadsPage() {
  const { session } = useAuth();
  const [contactInquiries, setContactInquiries] = useState<ContactInquiryRecord[]>([]);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    if (!session) return;
    let isMounted = true;

    const run = async () => {
      try {
        const res = await fetch("/api/admin/leads?contactLimit=100&newsletterLimit=100", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        const data = (await res.json()) as LeadsApiResponse & { error?: string };

        if (!res.ok) {
          throw new Error(data.error || "Failed to load leads");
        }

        if (!isMounted) return;
        setContactInquiries(Array.isArray(data.contactInquiries) ? data.contactInquiries : []);
        setNewsletterSubscribers(Array.isArray(data.newsletterSubscribers) ? data.newsletterSubscribers : []);
        setErrorMsg("");
      } catch (error) {
        if (!isMounted) return;
        setErrorMsg(error instanceof Error ? error.message : "Failed to load leads");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    run();
    return () => {
      isMounted = false;
    };
  }, [session, refreshTick]);

  if (!session) return null;

  return (
    <Container className="pt-4 pb-24">
      <div className="flex items-start justify-between">
        <div>
          <Subheading>Lead intelligence</Subheading>
          <div className="mt-4 flex flex-col gap-1 md:flex-row md:items-center md:gap-2">
            <p className="text-foreground font-medium">
              {contactInquiries.length + newsletterSubscribers.length} leads
            </p>
            <div className="hidden size-1 rounded-full bg-neutral-200 md:block" />
            <p className="text-foreground/70">
              Contact inquiries and newsletter subscribers.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            setRefreshTick((n) => n + 1);
          }}
          disabled={loading}
          className="text-foreground/40 hover:text-foreground font-mono text-[10px] tracking-widest uppercase transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`mr-1 inline h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {errorMsg && (
        <div className="mt-4 bg-destructive/10 border-destructive text-destructive border p-3 font-mono text-xs tracking-wider">
          {errorMsg}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex flex-col items-start gap-1.5 md:flex-row md:items-center md:gap-2">
          <Box className="bg-linear-to-b from-blue-400 to-blue-600 ring-offset-blue-500">
            <MessageSquare className="size-4 text-white drop-shadow-xl drop-shadow-black/40" />
          </Box>
          <p className="text-foreground font-medium">{contactInquiries.length}</p>
          <div className="hidden size-1 rounded-full bg-neutral-200 md:block" />
          <p className="text-foreground/70 text-sm">Contact inquiries</p>
        </div>
        <div className="flex flex-col items-start gap-1.5 md:flex-row md:items-center md:gap-2">
          <Box className="bg-linear-to-b from-violet-400 to-violet-600 ring-offset-violet-500">
            <Bell className="size-4 text-white drop-shadow-xl drop-shadow-black/40" />
          </Box>
          <p className="text-foreground font-medium">{newsletterSubscribers.length}</p>
          <div className="hidden size-1 rounded-full bg-neutral-200 md:block" />
          <p className="text-foreground/70 text-sm">Newsletter subscribers</p>
        </div>
        <div className="flex flex-col items-start gap-1.5 md:flex-row md:items-center md:gap-2">
          <Box className="bg-linear-to-b from-emerald-400 to-emerald-600 ring-offset-emerald-500">
            <Database className="size-4 text-white drop-shadow-xl drop-shadow-black/40" />
          </Box>
          <p className="text-foreground font-medium">{contactInquiries.length + newsletterSubscribers.length}</p>
          <div className="hidden size-1 rounded-full bg-neutral-200 md:block" />
          <p className="text-foreground/70 text-sm">Total leads</p>
        </div>
      </div>

      <DottedSeparator className="my-6" />

      <section>
        <p className="text-foreground font-medium">Contact inquiries</p>

        {loading ? (
          <p className="text-foreground/40 mt-4 font-mono text-xs tracking-widest uppercase">
            Loading...
          </p>
        ) : contactInquiries.length === 0 ? (
          <p className="text-foreground/40 mt-4 font-mono text-xs tracking-widest uppercase">
            No records
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {contactInquiries.map((lead) => (
              <div key={lead.id} className="flex flex-col gap-1">
                <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:gap-2">
                  <a
                    className="text-foreground font-medium hover:text-primary transition-colors"
                    href={`mailto:${lead.email}`}
                  >
                    <Mail className="mr-1 inline h-3 w-3" />
                    {lead.name}
                  </a>
                  <div className="hidden size-1 rounded-full bg-neutral-200 md:block" />
                  <span className="text-foreground/40 font-mono text-[10px] tracking-widest uppercase">
                    {formatDateTime(lead.createdAt)}
                  </span>
                  {lead.source && (
                    <a
                      href={lead.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground/40 hover:text-foreground transition-colors"
                    >
                      <Globe className="h-3 w-3" />
                    </a>
                  )}
                </div>
                {lead.subject && (
                  <p className="text-foreground/70 text-sm">{lead.subject}</p>
                )}
                <p className="text-foreground/50 text-sm">{truncate(lead.message)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <DottedSeparator className="my-6" />

      <section>
        <p className="text-foreground font-medium">Newsletter subscribers</p>

        {loading ? (
          <p className="text-foreground/40 mt-4 font-mono text-xs tracking-widest uppercase">
            Loading...
          </p>
        ) : newsletterSubscribers.length === 0 ? (
          <p className="text-foreground/40 mt-4 font-mono text-xs tracking-widest uppercase">
            No records
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {newsletterSubscribers.map((sub) => (
              <div key={sub.id} className="flex flex-col gap-1.5 md:flex-row md:items-center md:gap-2">
                <a
                  className="text-foreground font-medium hover:text-primary transition-colors"
                  href={`mailto:${sub.email}`}
                >
                  <Mail className="mr-1 inline h-3 w-3" />
                  <span className="font-mono text-xs">{sub.email}</span>
                </a>
                <div className="hidden size-1 rounded-full bg-neutral-200 md:block" />
                <span
                  className={`font-mono text-[10px] tracking-widest uppercase ${
                    sub.isActive ? "text-emerald-500" : "text-foreground/30"
                  }`}
                >
                  {sub.isActive ? "Active" : "Inactive"}
                </span>
                <span className="text-foreground/40 font-mono text-[10px] tracking-widest uppercase">
                  {formatDateTime(sub.updatedAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </Container>
  );
}
