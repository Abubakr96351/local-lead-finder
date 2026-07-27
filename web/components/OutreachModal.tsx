"use client";

import { useState } from "react";
import { X, ChevronLeft, Mail, MessageSquare, Phone, Copy, Check } from "lucide-react";
import { classify, OPENERS, type OpportunityType } from "@/lib/score";
import { FLAG_OPPORTUNITY_COPY } from "@/lib/opportunities";
import { LaptopMockup } from "./LaptopMockup";

export interface OutreachLead {
  name: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  screenshotPath: string | null;
  gaugeLabel: string;
  flags: string[];
}

type Channel = "email" | "sms" | "call";
type Step = "channel" | "template" | "compose";

interface Template {
  key: string;
  title: string;
  popular: boolean;
  body: string;
}

const SMS_LIMIT = 320;

function buildTemplates(lead: OutreachLead, primaryType: OpportunityType): Template[] {
  const templates: Template[] = [];
  const seen = new Set<string>();

  const push = (key: string, title: string, body: string) => {
    if (seen.has(key) || !body) return;
    seen.add(key);
    templates.push({ key, title, popular: key === primaryType, body });
  };

  push(primaryType, primaryTitle(primaryType), OPENERS[primaryType]);

  for (const flag of lead.flags) {
    const copy = FLAG_OPPORTUNITY_COPY[flag];
    if (copy) push(flag, flagTitle(flag), flagOpener(lead.name, flag));
  }

  return templates.length > 0
    ? templates
    : [{ key: "generic", title: "General outreach", popular: true, body: OPENERS.cold || genericOpener(lead.name) }];
}

function primaryTitle(type: OpportunityType): string {
  switch (type) {
    case "no_website":
      return "No website";
    case "broken_website":
      return "Website is down";
    case "outdated_website":
      return "Outdated design";
    case "reputation_risk":
      return "Recent negative review";
    default:
      return "Cold outreach";
  }
}

function flagTitle(flag: string): string {
  switch (flag) {
    case "not_mobile_optimized":
      return "Not mobile-friendly";
    case "no_ssl":
      return "No SSL";
    case "stale_copyright":
      return "Outdated design";
    case "no_reviews":
    case "low_reviews":
      return "Few or no photos/reviews";
    default:
      return "Opportunity";
  }
}

function genericOpener(name: string): string {
  return `Hey there, I came across ${name} while researching local businesses and wanted to reach out — would you be open to a quick chat?`;
}

function flagOpener(name: string, flag: string): string {
  switch (flag) {
    case "not_mobile_optimized":
      return `Hey there, I checked out ${name}'s website on my phone this morning and it didn't render well on mobile — most of your customers are probably searching from their phones. I put together a mobile-friendly redesign, want to take a look?`;
    case "no_ssl":
      return `Hey there, I noticed ${name}'s website doesn't have a security certificate, so browsers may be warning visitors it's "Not secure." Happy to help get that fixed.`;
    case "stale_copyright":
      return `Hey there, I found your ${name} website this morning and it looks like it hasn't been updated in a while. I actually went ahead and redesigned it for you — would you want to take a look?`;
    case "no_reviews":
      return `Hey there, I pulled up ${name} on Google Maps this morning and noticed the profile only has a couple photos — listings with more photos tend to get a lot more clicks. Want some tips?`;
    case "low_reviews":
      return `Hey there, I noticed ${name} doesn't have many reviews yet — that can make it harder to rank on Google Maps. I help local businesses build up review volume, want to hear how?`;
    default:
      return genericOpener(name);
  }
}

export function OutreachModal({ lead, onClose }: { lead: OutreachLead; onClose: () => void }) {
  const primaryType = classify(lead.flags);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [step, setStep] = useState<Step>("channel");
  const [templates] = useState(() => buildTemplates(lead, primaryType));
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [subject, setSubject] = useState(`Quick note about ${lead.name}'s website`);
  const [body, setBody] = useState("");
  const [copied, setCopied] = useState<"body" | "subject" | null>(null);

  function pickChannel(next: Channel) {
    setChannel(next);
    if (next === "call") {
      setBody(OPENERS[primaryType] || genericOpener(lead.name));
      setStep("compose");
    } else {
      setStep("template");
    }
  }

  function pickTemplate(template: Template) {
    setSelectedTemplate(template);
    setBody(template.body);
    setStep("compose");
  }

  async function copy(text: string, which: "body" | "subject") {
    await navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 1500);
  }

  const cleanPhone = lead.phone?.replace(/[^\d+]/g, "") ?? "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-2 flex items-start justify-between">
          {step !== "channel" ? (
            <button
              type="button"
              onClick={() =>
                setStep(step === "compose" && channel !== "call" ? "template" : "channel")
              }
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {step === "channel" && (
          <>
            <h2 className="mb-4 text-xl font-bold text-gray-900">Generate Outreach Message For…</h2>
            <div className="mb-6 flex items-center gap-4 rounded-xl border border-gray-200 p-3">
              <div className="w-28 shrink-0">
                <LaptopMockup screenshotPath={lead.screenshotPath ?? undefined} alt={lead.name} />
              </div>
              <div className="min-w-0 text-sm">
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{lead.name}</span>
                  {(lead.gaugeLabel === "Fair" || lead.gaugeLabel === "Poor") && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-600">
                      Ugly
                    </span>
                  )}
                </div>
                <p className="truncate text-gray-500">{lead.phone || "No phone"}</p>
                <p className="truncate text-gray-500">{lead.email || "No email"}</p>
                {lead.website ? (
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-blue-600 hover:underline block"
                  >
                    {lead.website}
                  </a>
                ) : (
                  <p className="truncate text-gray-500">No website</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => pickChannel("email")}
                disabled={!lead.email}
                className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 p-4 text-center hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Mail className="h-6 w-6 text-gray-700" />
                <span className="font-semibold text-gray-900">Email</span>
                <span className="text-xs text-gray-500">Pick a template and personalize it.</span>
              </button>
              <button
                type="button"
                onClick={() => pickChannel("sms")}
                disabled={!lead.phone}
                className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 p-4 text-center hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <MessageSquare className="h-6 w-6 text-gray-700" />
                <span className="font-semibold text-gray-900">SMS</span>
                <span className="text-xs text-gray-500">Pick a template and personalize it.</span>
              </button>
              <button
                type="button"
                onClick={() => pickChannel("call")}
                disabled={!lead.phone}
                className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 p-4 text-center hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Phone className="h-6 w-6 text-gray-700" />
                <span className="font-semibold text-gray-900">Cold Call</span>
                <span className="text-xs text-gray-500">Get a script to read on the call.</span>
              </button>
            </div>
          </>
        )}

        {step === "template" && (
          <>
            <h2 className="mb-4 text-xl font-bold text-gray-900">Select a Template…</h2>
            <div className="flex flex-col gap-3">
              {templates.map((template) => (
                <button
                  key={template.key}
                  type="button"
                  onClick={() => pickTemplate(template)}
                  className="flex items-start gap-3 rounded-xl border border-gray-200 p-4 text-left hover:border-gray-400"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{template.title}</span>
                      {template.popular && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                          ★ Popular
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm text-gray-500">{template.body}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {step === "compose" && channel === "call" && (
          <>
            <h2 className="mb-4 text-xl font-bold text-gray-900">Cold Call Script</h2>
            <p className="mb-2 text-sm font-medium text-gray-700">{lead.name}</p>
            <p className="mb-4 text-lg font-semibold text-gray-900">{lead.phone}</p>
            <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              {body}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => copy(body, "body")}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {copied === "body" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                Copy Script
              </button>
              <a
                href={`tel:${cleanPhone}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-amber-300"
              >
                <Phone className="h-4 w-4" /> Call Now
              </a>
            </div>
          </>
        )}

        {step === "compose" && channel === "email" && (
          <>
            <h2 className="mb-4 text-xl font-bold text-gray-900">Email</h2>
            <label className="mb-1 block text-sm font-medium text-gray-700">Prospect Email</label>
            <div className="mb-4 flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5 text-sm">
              <span>{lead.email}</span>
            </div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mb-4 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
            />
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Email Body</label>
              <button
                type="button"
                onClick={() => copy(body, "body")}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
              >
                {copied === "body" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                Copy
              </button>
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="mb-4 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
            />
            <a
              href={`mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-amber-300"
            >
              <Mail className="h-4 w-4" /> Open in Mail
            </a>
          </>
        )}

        {step === "compose" && channel === "sms" && (
          <>
            <h2 className="mb-4 text-xl font-bold text-gray-900">SMS</h2>
            <label className="mb-1 block text-sm font-medium text-gray-700">Prospect Phone Number</label>
            <div className="mb-4 flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5 text-sm">
              <span>{lead.phone}</span>
              <button
                type="button"
                onClick={() => copy(lead.phone ?? "", "subject")}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
              >
                {copied === "subject" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                Copy
              </button>
            </div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">SMS Message</label>
              <span
                className={`text-xs ${body.length > SMS_LIMIT ? "text-amber-600" : "text-gray-400"}`}
              >
                {body.length} / {SMS_LIMIT} chars
              </span>
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              className="mb-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
            />
            {body.length > SMS_LIMIT && (
              <p className="mb-4 text-xs text-amber-600">This message may be split into multiple texts</p>
            )}
            <a
              href={`sms:${cleanPhone}?body=${encodeURIComponent(body)}`}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <MessageSquare className="h-4 w-4" /> Open in Messages
            </a>
          </>
        )}
      </div>
    </div>
  );
}
