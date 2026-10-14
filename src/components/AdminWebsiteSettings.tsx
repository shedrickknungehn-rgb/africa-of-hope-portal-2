import { useState } from "react";
import { toast } from "sonner";
import {
  Globe,
  LayoutTemplate,
  Star,
  Quote,
  HelpCircle,
  Link2,
  Share2,
  Building2,
  Save,
  RefreshCw,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { panelClass } from "./Navigation";
import { Field, Area, Toggle, ImageBox, ListCard, AddButton, genId } from "./CmsPrimitives";
import type { WebsiteListKey } from "../types";

const TABS: { key: string; label: string; icon: typeof Globe }[] = [
  { key: "branding", label: "Branding", icon: Building2 },
  { key: "hero", label: "Hero Slides", icon: LayoutTemplate },
  { key: "features", label: "Highlights", icon: Star },
  { key: "stats", label: "Stats", icon: Globe },
  { key: "testimonials", label: "Testimonials", icon: Quote },
  { key: "faqs", label: "FAQs", icon: HelpCircle },
  { key: "socials", label: "Social Links", icon: Share2 },
  { key: "nav", label: "Menu & Footer", icon: Link2 },
];

export default function AdminWebsiteSettings() {
  const {
    state,
    updateWebsiteSettings,
    addToWebsiteList,
    updateInWebsiteList,
    removeFromWebsiteList,
    moveInWebsiteList,
    resetWebsiteSettings,
  } = useApp();
  const w = state.websiteSettings;
  const [tab, setTab] = useState("branding");

  const list = <T extends { id: string }>(key: WebsiteListKey) => w[key] as unknown as T[];
  const move = (key: WebsiteListKey, id: string, dir: -1 | 1) => moveInWebsiteList(key, id, dir);
  const del = (key: WebsiteListKey, id: string) => {
    removeFromWebsiteList(key, id);
    toast.success("Item removed.");
  };

  return (
    <div className="space-y-5">
      <div className={`${panelClass} flex flex-wrap items-center justify-between gap-3 p-5`}>
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
            <Globe className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              Website CMS &amp; Public Settings
            </h1>
            <p className="text-sm text-slate-500">
              Edit the public marketing site — logo, hero, text, links. Changes save instantly.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              resetWebsiteSettings();
              toast.success("Website content reset to defaults.");
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reset
          </button>
          <span className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white">
            <Save className="h-3.5 w-3.5" /> Auto-saved
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                active ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-4 w-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "branding" && (
        <div className={`${panelClass} grid gap-5 p-5`}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Site / Academy Name"
              value={w.academyName}
              onChange={(v) => updateWebsiteSettings({ academyName: v })}
            />
            <Field
              label="Tagline"
              value={w.tagline}
              onChange={(v) => updateWebsiteSettings({ tagline: v })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ImageBox
              label="Logo"
              value={w.logoUrl}
              onChange={(v) => updateWebsiteSettings({ logoUrl: v })}
            />
            <ImageBox
              label="Favicon"
              round
              value={w.faviconUrl}
              onChange={(v) => updateWebsiteSettings({ faviconUrl: v })}
            />
          </div>
          <Area
            label="Announcement Banner Text"
            value={w.announcementText}
            onChange={(v) => updateWebsiteSettings({ announcementText: v })}
            rows={2}
          />
          <Toggle
            label="Show announcement banner"
            hint="Displays the top strip on the public site."
            checked={w.announcementEnabled}
            onChange={(v) => updateWebsiteSettings({ announcementEnabled: v })}
          />
          <Toggle
            label="Show certificate verification link"
            hint="Adds the Verify entry to the public navigation."
            checked={w.verifyEnabled}
            onChange={(v) => updateWebsiteSettings({ verifyEnabled: v })}
          />
        </div>
      )}

      {tab === "hero" && (
        <div className="space-y-4">
          {list<{ id: string; eyebrow: string; title: string; highlight: string; description: string; image: string }>(
            "heroSlides"
          ).map((s, i, arr) => (
            <ListCard
              key={s.id}
              index={i}
              total={arr.length}
              title="Hero slide"
              onUp={() => move("heroSlides", s.id, -1)}
              onDown={() => move("heroSlides", s.id, 1)}
              onDelete={() => del("heroSlides", s.id)}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Eyebrow"
                  value={s.eyebrow}
                  onChange={(v) => updateInWebsiteList("heroSlides", s.id, { eyebrow: v })}
                />
                <Field
                  label="Title"
                  value={s.title}
                  onChange={(v) => updateInWebsiteList("heroSlides", s.id, { title: v })}
                />
                <Field
                  label="Highlighted phrase"
                  value={s.highlight}
                  onChange={(v) => updateInWebsiteList("heroSlides", s.id, { highlight: v })}
                />
              </div>
              <Area
                label="Description"
                value={s.description}
                onChange={(v) => updateInWebsiteList("heroSlides", s.id, { description: v })}
                rows={2}
              />
              <ImageBox
                label="Background image"
                value={s.image}
                onChange={(v) => updateInWebsiteList("heroSlides", s.id, { image: v })}
              />
            </ListCard>
          ))}
          <AddButton
            label="Add hero slide"
            onClick={() =>
              addToWebsiteList("heroSlides", {
                id: genId("hero"),
                eyebrow: "New highlight",
                title: "Headline",
                highlight: "Accent phrase",
                description: "Describe this slide.",
                image: "",
              })
            }
          />
        </div>
      )}

      {tab === "features" && (
        <div className="space-y-4">
          {list<{ id: string; icon: string; title: string; description: string }>("features").map(
            (f, i, arr) => (
              <ListCard
                key={f.id}
                index={i}
                total={arr.length}
                title="Highlight"
                onUp={() => move("features", f.id, -1)}
                onDown={() => move("features", f.id, 1)}
                onDelete={() => del("features", f.id)}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Title"
                    value={f.title}
                    onChange={(v) => updateInWebsiteList("features", f.id, { title: v })}
                  />
                  <Field
                    label="Icon name"
                    value={f.icon}
                    placeholder="e.g. Award, Target, Handshake"
                    onChange={(v) => updateInWebsiteList("features", f.id, { icon: v })}
                  />
                </div>
                <Area
                  label="Description"
                  value={f.description}
                  onChange={(v) => updateInWebsiteList("features", f.id, { description: v })}
                  rows={2}
                />
              </ListCard>
            )
          )}
          <AddButton
            label="Add highlight"
            onClick={() =>
              addToWebsiteList("features", {
                id: genId("feat"),
                icon: "Star",
                title: "New highlight",
                description: "Short supporting line.",
              })
            }
          />
        </div>
      )}

      {tab === "stats" && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {list<{ id: string; value: string; label: string }>("stats").map((s, i, arr) => (
              <ListCard
                key={s.id}
                index={i}
                total={arr.length}
                title="Stat"
                onUp={() => move("stats", s.id, -1)}
                onDown={() => move("stats", s.id, 1)}
                onDelete={() => del("stats", s.id)}
              >
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Value"
                    value={s.value}
                    onChange={(v) => updateInWebsiteList("stats", s.id, { value: v })}
                  />
                  <Field
                    label="Label"
                    value={s.label}
                    onChange={(v) => updateInWebsiteList("stats", s.id, { label: v })}
                  />
                </div>
              </ListCard>
            ))}
          </div>
          <AddButton
            label="Add stat"
            onClick={() =>
              addToWebsiteList("stats", { id: genId("stat"), value: "0", label: "New metric" })
            }
          />
        </div>
      )}

      {tab === "testimonials" && (
        <div className="space-y-4">
          {list<{ id: string; name: string; program: string; quote: string }>("testimonials").map(
            (t, i, arr) => (
              <ListCard
                key={t.id}
                index={i}
                total={arr.length}
                title="Testimonial"
                onUp={() => move("testimonials", t.id, -1)}
                onDown={() => move("testimonials", t.id, 1)}
                onDelete={() => del("testimonials", t.id)}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Name"
                    value={t.name}
                    onChange={(v) => updateInWebsiteList("testimonials", t.id, { name: v })}
                  />
                  <Field
                    label="Programme"
                    value={t.program}
                    onChange={(v) => updateInWebsiteList("testimonials", t.id, { program: v })}
                  />
                </div>
                <Area
                  label="Quote"
                  value={t.quote}
                  onChange={(v) => updateInWebsiteList("testimonials", t.id, { quote: v })}
                  rows={2}
                />
              </ListCard>
            )
          )}
          <AddButton
            label="Add testimonial"
            onClick={() =>
              addToWebsiteList("testimonials", {
                id: genId("t"),
                name: "Student name",
                program: "Programme",
                quote: "What they said about the academy.",
              })
            }
          />
        </div>
      )}

      {tab === "faqs" && (
        <div className="space-y-4">
          {list<{ id: string; question: string; answer: string }>("faqs").map((f, i, arr) => (
            <ListCard
              key={f.id}
              index={i}
              total={arr.length}
              title="Question"
              onUp={() => move("faqs", f.id, -1)}
              onDown={() => move("faqs", f.id, 1)}
              onDelete={() => del("faqs", f.id)}
            >
              <Field
                label="Question"
                value={f.question}
                onChange={(v) => updateInWebsiteList("faqs", f.id, { question: v })}
              />
              <Area
                label="Answer"
                value={f.answer}
                onChange={(v) => updateInWebsiteList("faqs", f.id, { answer: v })}
                rows={2}
              />
            </ListCard>
          ))}
          <AddButton
            label="Add FAQ"
            onClick={() =>
              addToWebsiteList("faqs", {
                id: genId("faq"),
                question: "New question?",
                answer: "The answer.",
              })
            }
          />
        </div>
      )}

      {tab === "socials" && (
        <div className="space-y-4">
          {list<{ id: string; platform: string; url: string }>("socials").map((s, i, arr) => (
            <ListCard
              key={s.id}
              index={i}
              total={arr.length}
              title="Social link"
              onUp={() => move("socials", s.id, -1)}
              onDown={() => move("socials", s.id, 1)}
              onDelete={() => del("socials", s.id)}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Platform"
                  value={s.platform}
                  onChange={(v) => updateInWebsiteList("socials", s.id, { platform: v })}
                />
                <Field
                  label="URL"
                  value={s.url}
                  placeholder="https://…"
                  onChange={(v) => updateInWebsiteList("socials", s.id, { url: v })}
                />
              </div>
            </ListCard>
          ))}
          <AddButton
            label="Add social link"
            onClick={() =>
              addToWebsiteList("socials", {
                id: genId("soc"),
                platform: "Platform",
                url: "https://",
              })
            }
          />
        </div>
      )}

      {tab === "nav" && (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Navigation menu
            </h3>
            {list<{ id: string; label: string; href: string }>("navLinks").map((l, i, arr) => (
              <ListCard
                key={l.id}
                index={i}
                total={arr.length}
                title="Menu item"
                onUp={() => move("navLinks", l.id, -1)}
                onDown={() => move("navLinks", l.id, 1)}
                onDelete={() => del("navLinks", l.id)}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Label"
                    value={l.label}
                    onChange={(v) => updateInWebsiteList("navLinks", l.id, { label: v })}
                  />
                  <Field
                    label="Link / anchor"
                    value={l.href}
                    placeholder="#section or https://…"
                    onChange={(v) => updateInWebsiteList("navLinks", l.id, { href: v })}
                  />
                </div>
              </ListCard>
            ))}
            <AddButton
              label="Add menu item"
              onClick={() =>
                addToWebsiteList("navLinks", { id: genId("nav"), label: "New link", href: "#" })
              }
            />
          </div>

          <div className={`${panelClass} grid gap-5 p-5`}>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Contact &amp; footer
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Contact phone"
                value={w.contactPhone}
                onChange={(v) => updateWebsiteSettings({ contactPhone: v })}
              />
              <Field
                label="Contact email"
                value={w.contactEmail}
                onChange={(v) => updateWebsiteSettings({ contactEmail: v })}
              />
            </div>
            <Field
              label="Address"
              value={w.address}
              onChange={(v) => updateWebsiteSettings({ address: v })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Office hours"
                value={w.officeHours}
                onChange={(v) => updateWebsiteSettings({ officeHours: v })}
              />
              <Field
                label="Apply button text"
                value={w.applyCtaText}
                onChange={(v) => updateWebsiteSettings({ applyCtaText: v })}
              />
            </div>
            <Field
              label="Footer copyright"
              value={w.footerCopyright}
              onChange={(v) => updateWebsiteSettings({ footerCopyright: v })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
