import { WHATSAPP_NUMBER } from "@/lib/content";

export const whatsappLink = (text = "Hi! I'd like Play at Your Table in my venue.") =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

const Icon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3z" />
  </svg>
);

/** Green "Chat on WhatsApp" button. */
export function WhatsAppButton({ label = "Chat to us on WhatsApp" }: { label?: string }) {
  return (
    <a className="btn btn-wa" href={whatsappLink()} target="_blank" rel="noopener noreferrer">
      <Icon /> {label}
    </a>
  );
}

/** Round WhatsApp button that floats in the corner of the landing page. */
export function WhatsAppFloat() {
  return (
    <a className="wa-float" href={whatsappLink()} target="_blank" rel="noopener noreferrer" aria-label="Chat to us on WhatsApp">
      <Icon />
    </a>
  );
}
