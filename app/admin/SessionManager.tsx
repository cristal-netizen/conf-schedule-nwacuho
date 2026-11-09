"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Session = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string | null;
  ends_at: string | null;
  session_type: string;
  status: "draft" | "published" | "cancelled";
  room_id: string | null;
  track_id: string | null;
  capacity: number | null;
};
type Option = {id:string; name:string};
type Props = { token: string; conferenceId: string; role: string };
const endpoint = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const inputClass = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";
const primaryButton = "rounded-lg bg-[#1F443E] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50";
const secondaryButton = "rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-50";

function toLocalInput(value: string | null) {
  if (!value) return "";
  const d = new Date(value);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}
function fromLocalInput(value: string) {
  return value ? new Date(value).toISOString() : null;
}
function newForm() {
  return {title: "", description: "", starts_at: "", ends_at: "", session_type: "education", room_id: "", track_id: "", capacity: ""};
}
export default function SessionManager({token, conferenceId, role}:Props) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [rooms, setRooms] = useState<Option[]>([]);
  const [tracks, setTracks] = useState<Option[]>([]);
  const [form, setForm] = useState(newForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRoom, setNewRoom] = useState("");
  const [newTrack, setNewTrack] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const request = useCallback(async (path:string, init?:RequestInit) => {
    if (!endpoint || !publicKey) throw new Error("Missing Supabase Preview configuration.");
    const response = await fetch(endpoint + "/rest/v1/" + path, {
      ...init,
      headers: {apikey:publicKey, Authorization:`Bearer ${token}`, "Content-Type":"application/json", ...(init?.headers || {})},
      cache:"no-store"
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.message || `Save failed (${response.status}). Please sign in again if your session expired.`);
    }
    if (response.status===204) return null;
    return await response.json().catch(()=>null);
  },[token]);

  const refresh = useCallback(async () => {
    const id = encodeURIComponent(conferenceId);
    const [sessionRows, roomRows, trackRows] = await Promise.all([
      request(`sessions?conference_id=eq.${id}&select=id,title,description,starts_at,ends_at,session_type,status,room_id,track_id,capacity&order=starts_at.asc.nullslast,title.asc`),
      request(`rooms?conference_id=eq.${id}&select=id,name&order=name.asc`),
      request(`tracks?conference_id=eq.${id}&select=id,name&order=name.asc`)
    ]);
    setSessions(Array.isArray(sessionRows)?sessionRows:[]);
    setRooms(Array.isArray(roomRows)?roomRows:[]);
    setTracks(Array.isArray(trackRows)?trackRows:[]);
  },[conferenceId,request]);

  useEffect(()=>{
    let active=true;
    refresh().catch((e:Error)=>{if(active) setMessage(e.message);}).finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[refresh]);

  async function handleSave(e:FormEvent) {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      if (form.starts_at && form.ends_at && new Date(form.ends_at)<=new Date(form.starts_at)) throw new Error("End time must be after start time.");
      const payload = {
        title:form.title.trim(), description:form.description.trim() || null,
        starts_at:fromLocalInput(form.starts_at), ends_at:fromLocalInput(form.ends_at),
        session_type:form.session_type,
        room_id:form.room_id || null, track_id:form.track_id || null,
        capacity:form.capacity ? Number(form.capacity) : null
      };
      if(editingId) {
        await request(`sessions?id=eq.${editingId}&conference_id=eq.${conferenceId}`,{method:"PATCH",body:JSON.stringify(payload),headers:{Prefer:"return=minimal"}});
      } else {
        await request("sessions",{method:"POST",body:JSON.stringify({...payload,conference_id:conferenceId,status:"draft"}),headers:{Prefer:"return=minimal"}});
      }
      await refresh(); setEditingId(null);setForm(newForm());
      setMessage(editingId?"Session updated.":"Session saved as a draft.");
    } catch (e) { setMessage(e instanceof Error?e.message:"Could not save session."); }
    finally {setBusy(false);}
  }

  function edit(row:Session) {
    setEditingId(row.id);
    setForm({title:row.title,description:row.description||"",starts_at:toLocalInput(row.starts_at),ends_at:toLocalInput(row.ends_at),session_type:row.session_type,room_id:row.room_id||"",track_id:row.track_id||"",capacity:row.capacity?.toString()||""});
    document.getElementById("session-editor")?.scrollIntoView({behavior:"smooth",block:"start"});
  }

  async function changeStatus(row:Session, status:Session["status"]) {
    if (role!=="admin") return;
    if(status==="published" && (!row.starts_at || !row.ends_at)) {setMessage("Add valid start and end times before publishing.");return;}
    setBusy(true);setMessage("");
    try {
      await request(`sessions?id=eq.${row.id}&conference_id=eq.${conferenceId}`,{method:"PATCH",body:JSON.stringify({status}),headers:{Prefer:"return=minimal"}});
      await refresh();
      setMessage(`Session marked ${status}. Conference-wide draft status still prevents public visibility.`);
    } catch(e) {setMessage(e instanceof Error?e.message:"Status update failed.");}
    finally {setBusy(false);}
  }

  async function addOption(kind:"rooms"|"tracks",name:string) {
    if(!name.trim()) return;
    setBusy(true);setMessage("");
    try {
      await request(kind,{method:"POST",body:JSON.stringify({conference_id:conferenceId,name:name.trim()}),headers:{Prefer:"return=minimal"}});
      await refresh();
      if(kind==="rooms") setNewRoom("");else setNewTrack("");
      setMessage(kind==="rooms"?"Room added.":"Track added.");
    } catch(e){setMessage(e instanceof Error?e.message:"Could not add item.");}
    finally {setBusy(false);}
  }

  const writable = !editingId || sessions.find(s=>s.id===editingId)?.status==="draft" || role==="admin";

  return <section className="space-y-5 rounded-xl border bg-white p-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-2xl font-semibold text-[#1F443E]">Program & sessions</h2><p className="text-sm text-slate-600">Create session drafts, set locations and tracks, and manage publication.</p></div>
      <span className="rounded-full bg-[#edf3f0] px-3 py-1 text-xs font-semibold text-[#1F443E]">{sessions.length} sessions</span>
    </div>
    {message && <p role="status" className="rounded-lg bg-slate-100 p-3 text-sm">{message}</p>}
    <div className="grid gap-3 md:grid-cols-2">
      <form className="flex items-end gap-2" onSubmit={e=>{e.preventDefault();void addOption("rooms",newRoom);}}>
        <label className="grow text-sm font-medium">Add room<input className={inputClass} value={newRoom} onChange={e=>setNewRoom(e.target.value)} maxLength={120} placeholder="Room name"/></label>
        <button className={secondaryButton} disabled={busy||!newRoom.trim()}>Add</button>
      </form>
      <form className="flex items-end gap-2" onSubmit={e=>{e.preventDefault();void addOption("tracks",newTrack);}}>
        <label className="grow text-sm font-medium">Add track<input className={inputClass} value={newTrack} onChange={e=>setNewTrack(e.target.value)} maxLength={120} placeholder="Education track"/></label>
        <button className={secondaryButton} disabled={busy||!newTrack.trim()}>Add</button>
      </form>
    </div>
    <form id="session-editor" onSubmit={handleSave} className="space-y-4 rounded-xl border border-slate-200 bg-[#f6f6f6] p-5">
      <div className="flex items-center justify-between gap-2"><h3 className="font-semibold">{editingId?"Edit session":"New session draft"}</h3>{editingId&&<button type="button" className={secondaryButton} onClick={()=>{setEditingId(null);setForm(newForm());}}>Cancel edit</button>}</div>
      <label className="block text-sm font-medium">Session title<input className={inputClass} required maxLength={250} value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label>
      <label className="block text-sm font-medium">Description<textarea className={inputClass} rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block text-sm font-medium">Starts (device local time)<input className={inputClass} type="datetime-local" value={form.starts_at} onChange={e=>setForm({...form,starts_at:e.target.value})}/></label>
        <label className="block text-sm font-medium">Ends (device local time)<input className={inputClass} type="datetime-local" value={form.ends_at} onChange={e=>setForm({...form,ends_at:e.target.value})}/></label>
        <label className="block text-sm font-medium">Room<select className={inputClass} value={form.room_id} onChange={e=>setForm({...form,room_id:e.target.value})}><option value="">To be announced</option>{rooms.map(r=><option value={r.id} key={r.id}>{r.name}</option>)}</select></label>
        <label className="block text-sm font-medium">Track<select className={inputClass} value={form.track_id} onChange={e=>setForm({...form,track_id:e.target.value})}><option value="">Unassigned</option>{tracks.map(r=><option value={r.id} key={r.id}>{r.name}</option>)}</select></label>
        <label className="block text-sm font-medium">Session type<select className={inputClass} value={form.session_type} onChange={e=>setForm({...form,session_type:e.target.value})}><option value="education">Education</option><option value="keynote">Keynote</option><option value="networking">Networking</option><option value="meal">Meal</option><option value="social">Social / event</option><option value="other">Other</option></select></label>
        <label className="block text-sm font-medium">Capacity (optional)<input className={inputClass} type="number" min="1" value={form.capacity} onChange={e=>setForm({...form,capacity:e.target.value})}/></label>
      </div>
      <button className={primaryButton} disabled={busy||!writable}>{editingId?"Save changes":"Create draft"}</button>
      {!writable&&<p className="text-sm text-slate-600">Only an administrator can edit a published session.</p>}
    </form>
    <div className="space-y-3">
      <h3 className="font-semibold">Session list</h3>
      {loading&&<p className="text-sm">Loading sessions…</p>}
      {!loading&&sessions.length===0&&<p className="text-sm text-slate-600">No sessions yet. Create the first draft above.</p>}
      {sessions.map(row=><article key={row.id} className="rounded-lg border p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h4 className="font-semibold">{row.title}</h4>
            <p className="text-xs text-slate-600">{row.starts_at?new Date(row.starts_at).toLocaleString(undefined,{dateStyle:"medium",timeStyle:"short"}):"Time TBD"} · {rooms.find(r=>r.id===row.room_id)?.name||"Room TBD"} · {tracks.find(t=>t.id===row.track_id)?.name||"No track"}</p>
          </div>
          <span className="rounded-full bg-[#edf3f0] px-3 py-1 text-xs font-semibold capitalize">{row.status}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(row.status==="draft"||role==="admin")&&<button type="button" className={secondaryButton} disabled={busy} onClick={()=>edit(row)}>Edit</button>}
          {role==="admin"&&row.status==="draft"&&<button type="button" className={primaryButton} disabled={busy} onClick={()=>void changeStatus(row,"published")}>Publish session</button>}
          {role==="admin"&&row.status!=="draft"&&<button type="button" className={secondaryButton} disabled={busy} onClick={()=>void changeStatus(row,"draft")}>Return to draft</button>}
          {role==="admin"&&row.status==="published"&&<button type="button" className={secondaryButton} disabled={busy} onClick={()=>void changeStatus(row,"cancelled")}>Cancel session</button>}
        </div>
      </article>)}
    </div>
  </section>;
}
