import { LogoMark } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="not-found">
      <div>
        <LogoMark size={64} />
        <h1>We couldn&apos;t find that table</h1>
        <p>The QR code may be out of date, or this venue&apos;s page isn&apos;t live yet. Please ask your server for help.</p>
        <p lang="ar" dir="rtl">
          لم نتمكن من العثور على هذه الصفحة. يرجى سؤال النادل.
        </p>
        <a className="btn btn-primary" href="/">
          Play at the Table home
        </a>
      </div>
    </main>
  );
}
