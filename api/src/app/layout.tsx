import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
      <body>
        {/* O children é onde suas páginas (como o login) vão aparecer */}
        {children}
      </body>
    </html>
  )
}