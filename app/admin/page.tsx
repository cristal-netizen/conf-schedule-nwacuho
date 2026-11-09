"use client";

import { FormEvent, useState } from "react";
import SessionManager from "./SessionManager";

type RecordRow = { id: string; title: string; status: string; guide_type?: string; introduction?: string; body?: string; severity?: string; conference_id?: string };
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const conferenceYear = 2027;

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [conferenceId, setConferenceId] = useState("");
  const [role, setRole] = useState("");
  const [guides, setGuides] = useState<RecordRow[]>([]);
  const [announcements, setAnnouncements] = useState<RecordRow[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function api(path: string, bearer: string, init?: RequestInit) {
    if (!url || !key) throw new Error("Supabase preview environment variables are missing.");
    const response = await fetch(`${url}${path}`, {
      ...init,
      headers: { apikey: key, ...(bearer !== key ? { Authorization: `Bearer ${bearer}` } : {}), "Content-Type": "application/json", ...(init?.headers || {}) },
      cache: "no-store",
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) throw new Error(result?.message || result?.error_description || result?.error || `Request failed (${response.status})`);
    return result;
  }

  async function loadData(bearer: string, id: string) {
    const [guideRows, announcementRows] = await Promise.all([
      api(`/rest/v1/guides?conference_id=eq.${id}&select=id,title,status,guide_type,introduction&order=guide_type.asc`, bearer),
      api(`/rest/v1/announcements?conference_id=eq.${id}&select=id,title,body,status,severity&order=created_at.desc`, bearer),
    ]);
    setGuides(guideRows);
    setAnnouncements(announcementRows);
  }

  async function signIn(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setMessage("");
    try {
      const auth = await api("/auth/v1/token?grant_type=password", key!, {
        method: "POST", body: JSON.stringify({ email, password }),
      });
      const bearer = auth.access_token as string;
      const userId = auth.user?.id as string;
      const memberships = await api(`/rest/v1/conference_memberships?user_id=eq.${userId}&select=conference_id,role`, bearer);
      const editable = memberships.filter((m: {role:string}) => ["admin", "editor"].includes(m.role));
      if (!editable.length) throw new Error("This account does not have conference editor permissions.");
      const conferences = await api(`/rest/v1/conferences?year=eq.${conferenceYear}&select=id,year`, bearer);
      const membership = editable.find((m: {conference_id:string}) => conferences.some((c: {id:string}) => c.id === m.conference_id));
      if (!membership) throw new Error("No editor access to the 2027 conference.");
      await loadData(bearer, membership.conference_id);
      setConferenceId(membership.conference_id); setRole(membership.role); setToken(bearer);
      setPassword("");
      setMessage("Signed in. Access expires with this session; sign in again if it expires.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Sign-in failed."); }
    finally { setBusy(false); }
  }

  async function addAnnouncement(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      await api("/rest/v1/announcements", token, { method: "POST", body: JSON.stringify({conference_id:conferenceId,title,body,status:"draft",severity:"info"}), headers: {Prefer:"return=minimal"} });
      setTitle(""); setBody(""); await loadData(token, conferenceId); setMessage("Announcement saved as a draft.");
    } catch(error) { setMessage(error instanceof Error ? error.message : "Save failed."); }
    finally { setBusy(false); }
  }

  async function updateGuide(guide: RecordRow, field: "title" | "introduction", value: string) {
    setBusy(true); setMessage("");
    try {
      await api(`/rest/v1/guides?id=eq.${guide.id}`, token, {method:"PATCH",body:JSON.stringify({[field]:value}),headers:{Prefer:"return=minimal"}});
      await loadData(token,conferenceId); setMessage("Guide updated.");
    } catch(error) { setMessage(error instanceof Error ? error.message : "Update failed."); }
    finally { setBusy(false); }
  }

  return <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
    <h1 className="text-3xl font-semibold text-[#1F443E]">2027 Committee Workspace</h1>
    <p className="text-slate-700">Restricted preview for authorized conference editors. Draft content stays unpublished.</p>
    {message && <p role="status" className="rounded-lg border bg-white p-3 text-sm">{message}</p>}
    {!token ? <form onSubmit={signIn} className="max-w-md space-y-4 rounded-xl border bg-white p-6">
      <h2 className="text-xl font-semibold">Committee sign in</h2>
      <label className="block text-sm">Email<input type="email" required autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded border p-2"/></label>
      <label className="block text-sm">Password<input type="password" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full rounded border p-2"/></label>
      <button disabled={busy} className="rounded bg-[#1F443E] px-4 py-2 text-white disabled:opacity-50">Sign in</button>
      <p className="text-xs text-slate-600">Accounts and editor roles must be provisioned by a trusted conference administrator. Credentials are not stored by this page.</p>
    </form> : <>
      <div className="flex items-center justify-between rounded-xl bg-white p-4"><p>Role: <strong>{role}</strong></p><button className="rounded border px-3 py-2" onClick={()=>{setToken("");setConferenceId("");setGuides([]);setAnnouncements([]);setMessage("Signed out.");}}>Sign out</button></div>
      <SessionManager token={token} conferenceId={conferenceId} role={role} />
      <section className="space-y-4 rounded-xl border bg-white p-6">
        <h2 className="text-2xl font-semibold">Guides</h2>
        {guides.map(guide=><div key={guide.id} className="space-y-2 rounded-lg border p-4">
          <h3 className="font-semibold">{guide.title} <span className="text-xs font-normal text-slate-500">({guide.status})</span></h3>
          <label className="block text-sm">Title<input aria-label={`Title for ${guide.guide_type}`} defaultValue={guide.title} key={guide.id+"title"} onBlur={e=>{if(e.target.value!==guide.title) void updateGuide(guide,"title",e.target.value);}} className="mt-1 w-full rounded border p-2"/></label>
          <label className="block text-sm">Introduction<textarea aria-label={`Introduction for ${guide.guide_type}`} defaultValue={guide.introduction || ""} key={guide.id+"intro"} onBlur={e=>{if(e.target.value!==(guide.introduction||"")) void updateGuide(guide,"introduction",e.target.value);}} className="mt-1 w-full rounded border p-2" rows={3}/></label>
        </div>)}
      </section>
      <section className="space-y-4 rounded-xl border bg-white p-6">
        <h2 className="text-2xl font-semibold">Announcements</h2>
        <form onSubmit={addAnnouncement} className="space-y-3">
          <label className="block text-sm">Title<input required maxLength={200} value={title} onChange={e=>setTitle(e.target.value)} className="mt-1 w-full rounded border p-2"/></label>
          <label className="block text-sm">Message<textarea required value={body} onChange={e=>setBody(e.target.value)} rows={4} className="mt-1 w-full rounded border p-2"/></label>
          <button disabled={busy} className="rounded bg-[#1F443E] px-4 py-2 text-white disabled:opacity-50">Save draft</button>
        </form>
        {announcements.map(item=><article key={item.id} className="rounded border p-3"><strong>{item.title}</strong><span className="ml-2 text-xs text-slate-500">{item.status}</span><p className="mt-1 whitespace-pre-wrap text-sm">{item.body}</p></article>)}
      </section>
    </>}
  </div>;
}
