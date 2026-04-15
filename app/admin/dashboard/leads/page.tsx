"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Mail, MessageSquare, Users, Globe } from "lucide-react";

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

export default function AdminLeadsPage() {
  const [contactInquiries, setContactInquiries] = useState<ContactInquiryRecord[]>([]);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      try {
        const res = await fetch("/api/admin/leads?contactLimit=100&newsletterLimit=100");
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
  }, [refreshTick]);

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Contact inquiries and newsletter subscribers captured from the live site.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            setRefreshTick((n) => n + 1);
          }}
          className="inline-flex items-center gap-2 bg-primary text-background px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {errorMsg && (
        <div className="text-danger bg-danger/10 border border-danger/30 rounded-md px-4 py-3 text-sm">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-muted-foreground text-xs uppercase tracking-widest mb-2">Contact Inquiries</div>
          <div className="font-display text-2xl font-bold">{contactInquiries.length}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-muted-foreground text-xs uppercase tracking-widest mb-2">Newsletter Subscribers</div>
          <div className="font-display text-2xl font-bold">{newsletterSubscribers.length}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-muted-foreground text-xs uppercase tracking-widest mb-2">Total Leads</div>
          <div className="font-display text-2xl font-bold">{contactInquiries.length + newsletterSubscribers.length}</div>
        </div>
      </div>

      <section className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <h2 className="font-medium">Contact Inquiries</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">When</th>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Subject</th>
                <th className="text-left px-4 py-3">Message</th>
                <th className="text-left px-4 py-3">Source</th>
              </tr>
            </thead>
            <tbody>
              {contactInquiries.map((lead) => (
                <tr key={lead.id} className="border-t border-border align-top">
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{formatDateTime(lead.createdAt)}</td>
                  <td className="px-4 py-3">{lead.name}</td>
                  <td className="px-4 py-3">
                    <a className="text-primary hover:underline inline-flex items-center gap-1" href={`mailto:${lead.email}`}>
                      <Mail className="w-3 h-3" />
                      {lead.email}
                    </a>
                  </td>
                  <td className="px-4 py-3">{lead.subject}</td>
                  <td className="px-4 py-3 max-w-sm text-muted-foreground">{truncate(lead.message, 160)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {lead.source ? (
                      <a href={lead.source} target="_blank" rel="noopener noreferrer" className="hover:underline inline-flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        Source
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
              {!loading && contactInquiries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No contact inquiries yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <h2 className="font-medium">Newsletter Subscribers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Updated</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Source</th>
              </tr>
            </thead>
            <tbody>
              {newsletterSubscribers.map((subscriber) => (
                <tr key={subscriber.id} className="border-t border-border">
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{formatDateTime(subscriber.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <a className="text-primary hover:underline inline-flex items-center gap-1" href={`mailto:${subscriber.email}`}>
                      <Mail className="w-3 h-3" />
                      {subscriber.email}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-wide ${
                        subscriber.isActive
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {subscriber.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {subscriber.source ? (
                      <a href={subscriber.source} target="_blank" rel="noopener noreferrer" className="hover:underline inline-flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        Source
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
              {!loading && newsletterSubscribers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No newsletter subscribers yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
