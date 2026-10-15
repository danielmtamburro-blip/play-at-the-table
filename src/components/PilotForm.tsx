"use client";
import { useActionState } from "react";
import { submitPilot, type PilotState } from "@/app/actions";
import { CONTACT_EMAIL } from "@/lib/content";

export default function PilotForm() {
  const [state, action, pending] = useActionState<PilotState, FormData>(submitPilot, null);

  if (state?.ok)
    return (
      <div className="pilot-form-done form-result" role="status">
        <strong>Thanks! Your request is in.</strong>
        <p>We&apos;ll be in touch within two working days to set up your free four-week pilot.</p>
      </div>
    );

  return (
    <form action={action} noValidate>
      <div className="field">
        <label htmlFor="pf-venue">Venue name</label>
        <input id="pf-venue" name="venue" required autoComplete="organization" />
      </div>
      <div className="field">
        <label htmlFor="pf-area">Area</label>
        <input id="pf-area" name="area" placeholder="e.g. JBR, Al Barsha, Downtown" />
      </div>
      <div className="field">
        <label htmlFor="pf-type">Type of venue</label>
        <select id="pf-type" name="type">
          <option>Family restaurant</option>
          <option>Café</option>
          <option>Casual dining</option>
          <option>Bar or lounge</option>
          <option>Hotel restaurant</option>
          <option>Group with several venues (quote)</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="pf-tables">Number of tables</label>
        <input id="pf-tables" name="tables" inputMode="numeric" placeholder="e.g. 24" />
      </div>
      <div className="field">
        <label htmlFor="pf-name">Your name</label>
        <input id="pf-name" name="name" required autoComplete="name" />
      </div>
      <div className="field">
        <label htmlFor="pf-contact">Phone or email</label>
        <input id="pf-contact" name="contact" required />
      </div>
      <div className="field full">
        <label htmlFor="pf-notes">Anything else?</label>
        <textarea id="pf-notes" name="notes" placeholder="Which sections excite you most?" />
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px" }} />
      <div className="field full">
        <button className="btn btn-primary" type="submit" disabled={pending}>
          {pending ? "Sending…" : "Send my pilot request"}
        </button>
      </div>
      {state && !state.ok && (
        <div className="form-result err" role="alert">
          <strong>{state.error}</strong>
          {state.summary && (
            <>
              <span>
                You can copy this and send it to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>:
              </span>
              <pre>{state.summary}</pre>
            </>
          )}
        </div>
      )}
    </form>
  );
}
