export type Speaker = {
  id: string; // used for anchors, ex: "sp-josh-gana"
  name: string;
  title?: string;
  institution?: string;
  bio?: string;
  trackFocus?: string;
  photoUrl?: string;
};

export const SPEAKERS: Speaker[] = [
  {
    id: "sp-aj-yoon",
    name: "AJ Yoon",
    title: "Vice President",
    institution: "Volz Company",
    bio: "AJ serves as the VP for Volz Company. AJ is a proven leader in strategic planning, adept at integrating market data, financial analysis, and diverse stakeholder perspectives to develop actionable, high-impact strategies for purpose-driven organizations. With extensive experience in advising over 50 educational institutions and more than 15 professional services firms and not-for-profit agencies, she specializes in aligning organizational goals with market realities.",
  },
  {
    id: "sp-allana-taylor-fullerton",
    name: "Allana Taylor-Fullerton",
    title: "Neighbourhood Manager",
    institution: "University of Victoria",
    bio: "Allana Taylor-Fullerton (she/her) has been a Neighbourhood Manager at UVic for 5 years. As a former residence student staff, Allana is passionate about supporting student staff to balance their work with their lives outside of Reslife. She is passionate about relationship-building, leading with authenticity, and adaptability.",
  },
  {
    id: "sp-carol-vang",
    name: "Carol Vang",
    title: "Assistant Director of Residential Life",
    institution: "University of Washington – Seattle",
    bio: "Carol Vang is a Resident Director at the University of Washington with four years of experience in Residential Life across Wisconsin, Louisiana, and Washington. She is committed to DEIB-centered practices, partnering closely with students and colleagues to build strong, inclusive communities. Her work focuses on meaningful student engagement, collaboration, and fostering environments where all residents can thrive.",
  },
  {
    id: "sp-harold-martin",
    name: "Harold Martin",
    title: "Assistant Director of Residence Life",
    institution: "Gonzaga University",
    bio: "Harold Martin is a first-generation college graduate from Washington, DC, who grew up in Title I schools and somehow survived third-grade math long enough to teach it. He earned his social work degree from Radford University before moving to Atlanta to teach through Teach for America at KIPP Soul Primary. He now serves as a Resident Director at Gonzaga University.",
  },
  {
    id: "sp-josh-ashcroft",
    name: "Josh Ashcroft",
    title: "AVP for Campus Life",
    institution: "Eastern Washington University",
    bio: "Josh serves as the AVP for Campus Life at EWU and is in his 25th year working in higher education. In his current role, Josh helps students find their community and passions while overseeing Housing and Residential Life, Career Services, ASEWU, Orientation and Family Programs, Student Engagement, Community Engagement, and Campus Recreation. Josh is a strong advocate for staff and known for the empathy and positivity he brings to the work place. Go Eags!",
  },
  {
    id: "sp-kurt-haapala",
    name: "Kurt Haapala",
    title: "Partner",
    institution: "Mahlum",
    bio: "Kurt is an industry leader in the planning and design of student life and housing facilities. Having worked with more than a dozen colleges and universities across the West in his 30 years of experience, he has built Mahlum's higher education housing studio into a nationally recognized practice. Kurt engages deeply and listens intently to the users of buildings and serves as a translator/storyteller of his clients journey through the built environment.",
  },
  {
    id: "sp-meg-hollingworth",
    name: "Meg Hollingworth",
    title: "Neighbourhood Manager",
    institution: "University of Victoria",
    bio: "Meg Hollingworth (she/her) has been working as a Neighbourhood Manager at UVic for nearly three years. Meg has 16 years experience supporting learner success and community well-being. She specializes in coaching student leaders, holistic support, and crisis response. Meg is committed to building inclusive, resilient communities where students can thrive.",
  },
  {
    id: "sp-melanie-potts",
    name: "Melanie Potts",
    title: "Director of Housing and Residential Life",
    institution: "Eastern Washington University",
    bio: "Melanie brings over 20 years of experience working in Housing and Residential at EWU. She was the lead on EWU's Star Rez implementation, created a new CA staffing model, developed EWU's residential curriculum and is known on campus for her strong collaboration with other units.",
  },
  {
    id: "sp-michael-griffel",
    name: "Michael Griffel",
    title: "AVP Student Services & Enrollment Management & Director of University Housing",
    institution: "University of Oregon",
    bio: "Michael’s career focuses on developing student environments that foster academic success. Michael has been active in NWACUHO and ACUHO-I (Association of College and University Housing Officers-International). Michael had served on the ACUHO-I Board as the Workforce Development Director and the Finance and Corporate Records Officer, and currently serves as President-Elect.",
  },
  {
    id: "sp-omar-khater",
    name: "Omar Khater",
    title: "Residence Life Coordinator",
    institution: "Eastern Washington University",
    bio: "Omar is in his 5th year in the live-in role at EWU. He is a proud alum of EWU. He enjoys pickleball, collecting pokemon cards, watching and/or participating in sports, and baking. He has slowly become an assessment nerd and has enjoyed the experiment of the pilot positions in Streeter Hall.",
  },
  {
    id: "sp-payton-berrigan",
    name: "Payton Berrigan",
    title: "Neighbourhood Manager",
    institution: "University of Victoria",
    bio: "Payton Berrigan (she/her) is a Neighbourhood Manager at UVic with a background in Psychology and Addictions Studies. With 7 years in Residence Life as both student staff and professional, she is passionate about student wellbeing and creating inclusive, supportive environments where student staff can thrive. Her work emphasizes accountability, transparency, adaptability, and compassionate leadership.",
  },
  {
    id: "sp-sonora-hernandez",
    name: "Sonora Hernandez",
    title: "Assistant Director of Residence Life",
    institution: "Eastern Washington University",
    bio: "Sonora Hernandez is the Assistant Director of Residence Life, bringing a decade of post-graduate experience and supervisory expertise to her role. Having spent nearly ten years in leadership, she successfully navigated the unique challenge of supervising former peers for the last few years. Her professional focus is on assessment (improving experiences through data), mentoring the next generation of staff, and effective training. Off-campus, Sonora is a prolific, imaginative maker, spending her free time crocheting, painting, paper crafting, playing video games, and reading.",
  },
  {
    id: "sp-theresa-brostowitz",
    name: "Theresa Brostowitz",
    title: "Director of Campus Living",
    institution: "Lewis & Clark College",
    bio: "Theresa Brostowitz has worked in higher education for over 15 years with positions in Advancement, Admissions, Commuter Student Life, Career Advising, and Housing & Residence Life. With experience at multiple institutional types, Theresa is enthusiastic about helping housing professionals scale high impact practices in professional staff and student leader hiring, training, and performance management.",
  },
  {
    id: "sp-ann-volz",
    name: "Ann Volz",
    title: "President",
    institution: "Volz Company",
    bio: "Ann founded Volz Company in 2015 to work with people like you who are dedicated to making a positive influence in the world through the built environment. With more than 30 years of real estate experience, Ann has been involved in merely all aspects of development from early feasibility to property management. This includes planning and implementation services with over 200 educational institutions (including over 30 community colleges).",
  },
];

// Normalize presenter strings so matching is forgiving
function norm(s: string) {
  return s
    .toLowerCase()
    .replace(/\./g, "")          // remove periods (Dr. -> Dr)
    .replace(/\s+/g, " ")        // collapse whitespace
    .trim();
}

/**
 * Map "Presenter Name" -> "speakerId"
 * Includes a few helpful aliases.
 */
export const SPEAKER_ID_BY_NAME: Record<string, string> = (() => {
  const map: Record<string, string> = {};

  // Base mapping from SPEAKERS list
  for (const s of SPEAKERS) {
    map[norm(s.name)] = s.id;
  }

  // Organizational aliases used in schedule
  map[norm("NWACUHO Leadership")] = "org-nwacuho-board";
  map[norm("NWACUHO Volunteers")] = "org-nwacuho-board";
  map[norm("NWACUHO Work Group Leads")] = "org-nwacuho-board";
  map[norm("Board & Corporate Members")] = "org-nwacuho-board";
  map[norm("Past Presidents")] = "org-nwacuho-board";
  map[norm("Corporate Partners")] = "org-mahlum";

  // Name variants / formatting differences
  map[norm("Dr Angie Bradley")] = "sp-angie-bradley";
  map[norm("Dr. Angie Bradley")] = "sp-angie-bradley";

  map[norm("Kurt Haapala")] = "sp-kurt-haapala";
  map[norm("Kurt Haapala FAIA")] = "sp-kurt-haapala";

  map[norm("Vicki Vanderwerft")] = "sp-vicki-vanderwerf";
  map[norm("Brian Stroup")] = "sp-brian-stroup";

  return map;
})();
