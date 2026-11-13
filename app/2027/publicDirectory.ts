export type PublicExhibitor={
 id:string; name:string; description:string|null; website_url:string|null; logo_url:string|null;
 category:string|null; booths:{booth_number:string;location_description:string|null}[];
};
export type PublicSpeaker={
 id:string; display_name:string; title:string|null; organization:string|null;
 biography:string|null; photo_url:string|null; sessions:{title:string;starts_at:string|null}[];
};
const conferenceId="657785cf-4ce8-405c-9a52-24268b9d37d7";
type Row=Record<string,unknown>;
async function fetchRows(table:string,params:string):Promise<Row[]>{
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)return [];
 try {
  const r=await fetch(`${url}/rest/v1/${table}?${params}`,{headers:{apikey:key},next:{revalidate:60}});
  if(!r.ok)return [];
  const data=await r.json();
  return Array.isArray(data)?data:[];
 }catch{return [];}
}
async function isPublished(){
 const rows=await fetchRows("conferences",`id=eq.${conferenceId}&status=eq.published&select=id&limit=1`);
 return rows.length>0;
}
function str(x:unknown):string|null{return typeof x==="string"&&x.trim()?x.trim():null;}
export async function getPublicExhibitors():Promise<PublicExhibitor[]>{
 if(!await isPublished())return [];
 const [rows,boothRows]=await Promise.all([
  fetchRows("exhibitors",`conference_id=eq.${conferenceId}&status=eq.published&select=id,name,description,website_url,logo_url,category&order=sort_order.asc,name.asc&limit=250`),
  fetchRows("exhibitor_booths",`conference_id=eq.${conferenceId}&select=exhibitor_id,booth_number,location_description&order=sort_order.asc&limit=500`)
 ]);
 return rows.filter(x=>str(x.id)&&str(x.name)).map(x=>({
  id:String(x.id),name:String(x.name),description:str(x.description),website_url:str(x.website_url),
  logo_url:str(x.logo_url),category:str(x.category),
  booths:boothRows.filter(b=>b.exhibitor_id===x.id&&str(b.booth_number)).map(b=>({booth_number:String(b.booth_number),location_description:str(b.location_description)}))
 }));
}
export async function getPublicSpeakers():Promise<PublicSpeaker[]>{
 if(!await isPublished())return [];
 const [rows,associations,sessionRows]=await Promise.all([
  fetchRows("speakers",`conference_id=eq.${conferenceId}&is_public=eq.true&select=id,display_name,title,organization,biography,photo_url&order=display_name.asc&limit=300`),
  fetchRows("session_speakers",`conference_id=eq.${conferenceId}&select=session_id,speaker_id&limit=700`),
  fetchRows("sessions",`conference_id=eq.${conferenceId}&status=eq.published&visibility=eq.attendee&review_state=eq.ready&is_placeholder=eq.false&select=id,title,starts_at&limit=350`)
 ]);
 return rows.filter(x=>str(x.id)&&str(x.display_name)).map(x=>({
  id:String(x.id),display_name:String(x.display_name),title:str(x.title),organization:str(x.organization),
  biography:str(x.biography),photo_url:str(x.photo_url),
  sessions:associations.filter(a=>a.speaker_id===x.id).flatMap(a=>sessionRows.filter(s=>s.id===a.session_id&&str(s.title)).map(s=>({title:String(s.title),starts_at:str(s.starts_at)})))
 }));
}
