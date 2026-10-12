"use client";
import { useState } from "react";
import GuestApp from "@/components/guest/GuestApp";
import type { Venue } from "@/lib/types";

/** The phone on the sales page: plays a guided tour of the real guest app until someone touches it. */
export default function HeroPhone({ venue }: { venue: Venue }) {
  const [caption, setCaption] = useState("This is the live guest experience. Tap anything to try it.");
  return (
    <div className="phone-stage">
      <span className="live-badge">
        <span aria-hidden="true" /> Live demo
      </span>
      <div className="phone">
        <div className="phone-screen">
          <GuestApp venue={venue} table="12" embedded autoplay onCaption={setCaption} />
        </div>
      </div>
      <p className="phone-caption" aria-live="polite" key={caption}>
        {caption}
      </p>
    </div>
  );
}
