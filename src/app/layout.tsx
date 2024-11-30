import "./globals.css";

export const metadata = {
  title: "Hive Board Game",
  description: "A digital adaptation of the Hive board game",
  icons: {
    icon: [
      { url: "/artificial-hive.ico" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/apple-touch-icon.png", sizes: "180x180" },
      { url: "/icon-192.png", sizes: "192x192" },
      { url: "/icon-512.png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-900">{children}</body>
    </html>
  );
}