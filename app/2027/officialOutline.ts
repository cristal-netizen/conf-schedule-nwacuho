export type ProgramDay = "2027-02-08" | "2027-02-09" | "2027-02-10";
export type ProgramItem = {
  id: string;
  day: ProgramDay;
  start: string;
  end: string;
  title: string;
  category: "program" | "networking" | "exhibitors" | "general" | "meal";
};

const raw: Array<[ProgramDay,string,string,string,ProgramItem["category"]]> = [
 ["2027-02-08","10:00","13:30","Pre-Conference: Case Study","program"],
 ["2027-02-08","11:30","17:00","Registration Open","general"],
 ["2027-02-08","14:00","14:30","Volunteer Training & Orientation","general"],
 ["2027-02-08","14:30","15:00","New to NWACUHO / New to the Profession Welcome","networking"],
 ["2027-02-08","15:00","15:50","Past-Board Reception","networking"],
 ["2027-02-08","15:00","15:50","Coffee Chat","networking"],
 ["2027-02-08","16:00","16:45","Conference Opening & Welcome","general"],
 ["2027-02-08","16:45","17:45","Open Social","networking"],
 ["2027-02-08","17:30","20:00","Dinner on Your Own","meal"],
 ["2027-02-09","07:00","11:00","DEIA Educational Display & Affinity Engagement Experience","general"],
 ["2027-02-09","08:00","10:00","Registration Open","general"],
 ["2027-02-09","08:30","08:50","Morning Announcements","general"],
 ["2027-02-09","09:00","09:50","Opening General Session","general"],
 ["2027-02-09","10:05","10:55","Interest Session Block A","program"],
 ["2027-02-09","10:05","10:55","Exhibitor Hall SHO Shopping Hour","exhibitors"],
 ["2027-02-09","11:00","15:00","Exhibit Hall Open Time","exhibitors"],
 ["2027-02-09","12:00","13:00","Lunch with Exhibitors","meal"],
 ["2027-02-09","13:10","14:00","Functional Area Meet & Greet","networking"],
 ["2027-02-09","14:05","14:55","Swag Swap / Snack Break","networking"],
 ["2027-02-09","15:00","15:50","Interest Session Block B","program"],
 ["2027-02-09","16:00","16:50","Interest Session Block C","program"],
 ["2027-02-09","16:30","17:00","Corporate Member & Board Meeting","general"],
 ["2027-02-09","17:15","18:00","Affinity Groups Social","networking"],
 ["2027-02-09","18:00","20:00","Dinner on Your Own","meal"],
 ["2027-02-09","20:00","22:00","Night on the Town","networking"],
 ["2027-02-10","08:00","09:30","DEIA Educational Display & Affinity Engagement Experience","general"],
 ["2027-02-10","08:30","09:30","Early Bird Interest Session","program"],
 ["2027-02-10","09:30","10:20","Morning Announcements / Town Hall","general"],
 ["2027-02-10","10:30","11:20","Interest Session Block D","program"],
 ["2027-02-10","11:30","12:20","Interest Session Block E","program"],
 ["2027-02-10","12:30","14:20","Lunch, Case Study Presentations & NWACUHO Business Meeting","meal"],
 ["2027-02-10","14:30","15:20","NWACUHO Work Groups & Engagement Opportunities","general"],
 ["2027-02-10","15:30","16:30","Interest Session Block F","program"],
 ["2027-02-10","16:30","17:00","Break","general"],
 ["2027-02-10","17:00","17:30","Raffle / Dinner Buffet Line Opens","meal"],
 ["2027-02-10","17:30","19:00","Closing Banquet & Awards","meal"]
];
export const officialOutline: ProgramItem[] = raw.map(([day,start,end,title,category],i)=>({
  id:`outline-${i+1}`,day,start,end,title,category
}));
