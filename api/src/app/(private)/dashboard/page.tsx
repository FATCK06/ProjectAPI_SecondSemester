// src/app/(private)/dashboard/page.tsx

export default function DashboardPage() {
  return (
    // Usamos uma div simples para o conteúdo
    <div>
      {/* Adicionei um estilo inline rápido só para o título não ficar grudado no topo, 
          depois você pode criar um CSS module para essa página! */}
      <h1 style={{ fontSize: '28px', color: '#333', marginBottom: '20px', marginTop: '10px' }}>
        Bem-vindo ao Dashboard!
      </h1>
      
      <p style={{ color: '#666', fontSize: '16px' }}>
        Esta é a sua área restrita. Repare que a Sidebar apareceu automaticamente ao lado esquerdo, 
        graças ao layout que definimos na pasta (private).
      </p>
    </div>
  );
}