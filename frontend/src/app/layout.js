import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import MotionEnhancer from "../components/MotionEnhancer";

export const metadata = {
  title: "MedQueue | Find care with confidence",
  description: "Discover trusted healthcare professionals and find care that fits your needs with MedQueue.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
  },
};
export default function RootLayout({
  children
}) {
  return <html lang="en">
  <body>
    <MotionEnhancer>{children}</MotionEnhancer>
  </body>
</html>;
}
