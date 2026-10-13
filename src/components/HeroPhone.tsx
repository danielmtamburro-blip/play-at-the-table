"use client";
import { useEffect, useState } from "react";
import GuestApp from "@/components/guest/GuestApp";
import type { Venue } from "@/lib/types";

/** The phone on the sales page: plays a guided tour of the real guest app until someone touches it. */
export default function HeroPhone({ venue: base }: { venue: Venue }) {
  // The showcase venue's events always happen "tonight", whatever day it is.
  const [venue, setVenue] = useState(base);
  useEffect(() => {
    const today = new Date().getDay();
    setVenue({ ...base, events: base.events.map((e) => (e.date ? e : { ...e, weekday: today })) });
  }, [base]);
  return (
    <div className="phone-stage">
      <span className="live-badge">
        <span aria-hidden="true" /> Live demo
      </span>
      <div className="phone">
        <div className="phone-screen">
          <GuestApp venue={venue} table="12" embedded autoplay />
        </div>
      </div>
    </div>
  );
}
