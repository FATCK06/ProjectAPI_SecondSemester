import Sidebar from "@/components/Sidebar/Sidebar";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="layout-sistema">
      
      <Sidebar />

      {/* O 'children' vai ser a página que o usuário clicar (Dashboard, Perfil, etc) */}
      <main className="conteudo-sistema">
        {children}
      </main>

    </div>
  );
}