"use client";

import dynamic from "next/dynamic";

const ConferenceScheduleApp = dynamic(
  () => import("./ConferenceScheduleApp"),
  { ssr: false }
);

export default function ClientOnlySchedule() {
  return <ConferenceScheduleApp />;
}