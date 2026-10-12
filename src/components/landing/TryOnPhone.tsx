import QRCode from "qrcode";

const DEMO_URL = "https://playatthetable.netlify.app/v/saffron-terrace/12";

/** QR next to the demo phone: venues scan it and try the real thing on their own phone. */
export default async function TryOnPhone() {
  const svg = await QRCode.toString(DEMO_URL, { type: "svg", errorCorrectionLevel: "M", margin: 1, color: { dark: "#1B1740", light: "#FFFFFF" } });
  return (
    <div className="try-phone">
      <span className="try-qr" dangerouslySetInnerHTML={{ __html: svg }} />
      <span className="try-copy">
        <b>📱 Try it on your phone</b>
        <span>Point your camera at the code. It opens the same demo the guests see, no app needed.</span>
        <a href="/v/saffron-terrace/12" className="try-link">
          Or open it here ›
        </a>
      </span>
    </div>
  );
}
