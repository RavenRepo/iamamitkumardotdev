"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Mail,
  MessageSquare,
  Users,
  Globe,
  ArrowLeft,
  Database,
  Bell,
} from "lucide-react";
import Link from "next/link";

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

function truncate(value: string, length = 140) {
  if (value.length <= length) return value;
  return `${value.slice(0, length - 1)}…`;
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div className="bg-card border-border monolith-glass relative border p-5">
      <div className="border-border absolute top-0 right-0 h-3 w-3 border-t border-r" />
      <div className="border-border absolute bottom-0 left-0 h-3 w-3 border-b border-l" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase">
            {label}
          </p>
          <p className="font-display mt-1 text-3xl font-bold tracking-tight">
            {value}
          </p>
        </div>
        <div
          className={`rounded-lg p-2.5 ${accent ? "bg-primary/10" : "bg-muted/50"}`}
        >
          <Icon className={`h-5 w-5 ${accent ? "text-primary" : "text-muted-foreground"}`} />
        </div>
      </div>
    </div>
  );
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
    <div className="bg-background relative min-h-dvh">
      <div className="bg-grid-blueprint text-foreground pointer-events-none fixed inset-0 opacity-10" />

      <header className="bg-background/80 border-border fixed top-0 z-50 w-full border-b backdrop-blur-md">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/admin/dashboard"
              className="text-muted-foreground hover:text-primary group flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase transition-colors"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              ABORT_MISSION
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLoading(true);
                setRefreshTick((n) => n + 1);
              }}
              disabled={loading}
              className="h-9 font-mono text-[10px] tracking-widest uppercase"
            >
              <RefreshCw className={`mr-2 h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              REFRESH_FEED
            </Button>
          </div>
        </Container>
      </header>

      <section className="relative z-10 pt-24 pb-24">
        <Container>
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold tracking-tight uppercase">
              LEAD_INTELLIGENCE
            </h1>
            <p className="text-muted-foreground mt-1 font-mono text-[10px] tracking-widest uppercase">
              Contact inquiries and newsletter subscribers captured from the live site.
            </p>
          </div>

          {errorMsg && (
            <div className="bg-destructive/10 border-destructive mb-6 border p-4 font-mono text-[10px] tracking-widest uppercase">
              [ERROR] {errorMsg}
            </div>
          )}

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="CONTACT_INQUIRIES"
              value={contactInquiries.length}
              icon={MessageSquare}
            />
            <StatCard
              label="NEWSLETTER_SUBSCRIBERS"
              value={newsletterSubscribers.length}
              icon={Bell}
            />
            <StatCard
              label="TOTAL_LEADS"
              value={contactInquiries.length + newsletterSubscribers.length}
              icon={Database}
              accent
            />
          </div>

          <section className="bg-card border-border monolith-glass mb-6 overflow-hidden border">
            <div className="border-border border-b px-5 py-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="text-primary h-4 w-4" />
                <h2 className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
                  CONTACT_INQUIRIES
                </h2>
                <span className="ml-auto bg-primary/10 text-primary border-primary/30 font-mono text-[10px] border px-2 py-0.5 tracking-widest uppercase">
                  {contactInquiries.length} RECORDS
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3 font-mono text-[10px] tracking-widest uppercase">When</th>
                    <th className="text-left px-4 py-3 font-mono text-[10px] tracking-widest uppercase">Name</th>
                    <th className="text-left px-4 py-3 font-mono text-[10px] tracking-widest uppercase">Email</th>
                    <th className="text-left px-4 py-3 font-mono text-[10px] tracking-widest uppercase">Subject</th>
                    <th className="text-left px-4 py-3 font-mono text-[10px] tracking-widest uppercase">Message</th>
                    <th className="text-left px-4 py-3 font-mono text-[10px] tracking-widest uppercase">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {contactInquiries.map((lead) => (
                    <tr key={lead.id} className="border-t border-border align-top hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground font-mono text-[10px]">
                        {formatDateTime(lead.createdAt)}
                      </td>
                      <td className="px-4 py-3">{lead.name}</td>
                      <td className="px-4 py-3">
                        <a className="text-primary hover:underline inline-flex items-center gap-1.5" href={`mailto:${lead.email}`}>
                          <Mail className="h-3 w-3" />
                          <span className="font-mono text-[10px]">{lead.email}</span>
                        </a>
                      </td>
                      <td className="px-4 py-3">{lead.subject}</td>
                      <td className="px-4 py-3 max-w-xs text-muted-foreground text-xs">{truncate(lead.message, 120)}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {lead.source ? (
                          <a href={lead.source} target="_blank" rel="noopener noreferrer" className="hover:text-primary inline-flex items-center gap-1.5 transition-colors">
                            <Globe className="h-3 w-3" />
                            <span className="font-mono text-[10px]">SOURCE</span>
                          </a>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!loading && contactInquiries.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <div className="text-muted-foreground/50 font-mono text-[10px] tracking-widest uppercase">
                          NO_RECORDS_FOUND
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-card border-border monolith-glass overflow-hidden border">
            <div className="border-border border-b px-5 py-4">
              <div className="flex items-center gap-2">
                <Users className="text-primary h-4 w-4" />
                <h2 className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
                  NEWSLETTER_SUBSCRIBERS
                </h2>
                <span className="ml-auto bg-primary/10 text-primary border-primary/30 font-mono text-[10px] border px-2 py-0.5 tracking-widest uppercase">
                  {newsletterSubscribers.length} RECORDS
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3 font-mono text-[10px] tracking-widest uppercase">Updated</th>
                    <th className="text-left px-4 py-3 font-mono text-[10px] tracking-widest uppercase">Email</th>
                    <th className="text-left px-4 py-3 font-mono text-[10px] tracking-widest uppercase">Status</th>
                    <th className="text-left px-4 py-3 font-mono text-[10px] tracking-widest uppercase">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {newsletterSubscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground font-mono text-[10px]">
                        {formatDateTime(subscriber.updatedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <a className="text-primary hover:underline inline-flex items-center gap-1.5" href={`mailto:${subscriber.email}`}>
                          <Mail className="h-3 w-3" />
                          <span className="font-mono text-[10px]">{subscriber.email}</span>
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-mono text-[10px] tracking-widest uppercase ${
                            subscriber.isActive
                              ? "bg-primary/10 text-primary"
                              : "bg-muted/50 text-muted-foreground"
                          }`}
                        >
                          {subscriber.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {subscriber.source ? (
                          <a href={subscriber.source} target="_blank" rel="noopener noreferrer" className="hover:text-primary inline-flex items-center gap-1.5 transition-colors">
                            <Globe className="h-3 w-3" />
                            <span className="font-mono text-[10px]">SOURCE</span>
                          </a>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!loading && newsletterSubscribers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center">
                        <div className="text-muted-foreground/50 font-mono text-[10px] tracking-widest uppercase">
                          NO_RECORDS_FOUND
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </Container>
      </section>
    </div>
  );
}