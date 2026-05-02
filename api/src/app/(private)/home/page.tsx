"use client";

import { useState, useEffect } from "react";
import { Eye, Star, Search, X, FileText, User, Calendar, CheckCircle, Archive } from "lucide-react";
import { supabase } from "@/services/supabase";
import styles from "./home.module.css";

interface Norma {
  id_norma: number;
  codigo_norma: string;
  titulo_norma: string;
  escopo_norma: string;
  data_publicacao_norma: string | null;
  revisao_norma_atual: string;
  revisao_norma_obsoleta: string;
  caminho_arquivo: string | null;
  id_orgao: number;
  id_categoria: number | null;
  id_subcategoria: number | null;
  id_tipo: number | null;
  tb_orgaos?: { nome_completo_orgao: string; sigla_orgao: string } | { nome_completo_orgao: string; sigla_orgao: string }[];
  tb_categorias?: { nome_categoria: string } | { nome_categoria: string }[];
  tb_subcategoria?: { nome_subcategoria: string } | { nome_subcategoria: string }[];
  tb_tipo?: { nome_tipo: string } | { nome_tipo: string }[];
}

const getNomeSeguro = (obj: any, key: string) => {
  if (!obj) return "—";
  if (Array.isArray(obj)) return obj[0]?.[key] || "—";
  return obj[key] || "—";
};

const normalizeText = (text: string | null | undefined) => {
  if (!text) return "";
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

const formatarDataSegura = (dataString: string | null) => {
  if (!dataString) return "";
  if (dataString.includes('/')) return dataString; 
  const ymd = dataString.split('T')[0];
  const parts = ymd.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dataString;
};

export default function Home() {
  const [normas, setNormas] = useState<Norma[]>([]);
  const [categoriasMap, setCategoriasMap] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [revisorNome, setRevisorNome] = useState("Não atribuído");

  const [activeTab, setActiveTab] = useState<"todas" | "recentes" | "favoritas">("todas");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [favoritas, setFavoritas] = useState<number[]>([]);
  const [recentes, setRecentes] = useState<number[]>([]);

  const [selectedNorma, setSelectedNorma] = useState<Norma | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  useEffect(() => {
    const storedFavs = localStorage.getItem('@normas_favoritas');
    if (storedFavs) setFavoritas(JSON.parse(storedFavs));
    const storedRecentes = localStorage.getItem('@normas_recentes');
    if (storedRecentes) setRecentes(JSON.parse(storedRecentes));

    async function fetchData() {
      setIsLoading(true);
      const { data: normasData } = await supabase
        .from("tb_normas")
        .select(`*, tb_orgaos ( nome_completo_orgao, sigla_orgao ), tb_subcategoria ( nome_subcategoria ), tb_tipo ( nome_tipo )`)
        .order("id_norma", { ascending: false });

      if (normasData) setNormas(normasData as Norma[]);

      // Categoria buscada separadamente e mapeada por id (FK pode não estar definida)
      const { data: categoriasData } = await supabase
        .from("tb_categorias")
        .select("id_categoria, nome_categoria");

      if (categoriasData) {
        const mapa: Record<number, string> = {};
        categoriasData.forEach((c: any) => { mapa[c.id_categoria] = c.nome_categoria; });
        setCategoriasMap(mapa);
      }

      const { data: revisorData } = await supabase
        .from("tb_usuarios")
        .select("nome_usuario, sobrenome_usuario")
        .eq("permissao_usuario", "REVISOR")
        .limit(1)
        .single();
      
      if (revisorData) setRevisorNome(`${revisorData.nome_usuario} ${revisorData.sobrenome_usuario || ""}`.trim());

      setIsLoading(false);
    }
    fetchData();
  }, []);

  const getOrgaoNome = (orgaoData: Norma['tb_orgaos']) => {
    if (!orgaoData) return "Desconhecido";
    if (Array.isArray(orgaoData)) return orgaoData[0]?.nome_completo_orgao || "Desconhecido";
    return orgaoData.nome_completo_orgao || "Desconhecido";
  };

  const getOrgaoSigla = (orgaoData: Norma['tb_orgaos']) => {
    if (!orgaoData) return "";
    if (Array.isArray(orgaoData)) return orgaoData[0]?.sigla_orgao || "";
    return orgaoData.sigla_orgao || "";
  };

  const handleOpenDetails = (norma: Norma) => {
    setSelectedNorma(norma);
    setRecentes((prev) => {
      if (!prev.includes(norma.id_norma)) {
        const newRecentes = [norma.id_norma, ...prev];
        localStorage.setItem('@normas_recentes', JSON.stringify(newRecentes));
        return newRecentes;
      }
      return prev;
    });
  };

  const toggleFavorite = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setFavoritas((prev) => {
      const newFavs = prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id];
      localStorage.setItem('@normas_favoritas', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const handleOpenPdf = async (caminho: string | null) => {
    if (!caminho) return;
    setIsPdfLoading(true);
    setIsPdfModalOpen(true);
    const { data, error } = await supabase.storage.from("normas_pdfs").createSignedUrl(caminho, 3600);
    if (!error && data) setPdfUrl(data.signedUrl);
    setIsPdfLoading(false);
  };

  const closeModals = () => {
    setSelectedNorma(null);
    setIsPdfModalOpen(false);
    setPdfUrl("");
  };

  let filteredNormas = normas.filter((norma) => {
    const term = normalizeText(searchTerm);
    const orgaoNome = normalizeText(getOrgaoNome(norma.tb_orgaos));
    const orgaoSigla = normalizeText(getOrgaoSigla(norma.tb_orgaos));
    const categoriaNome = normalizeText(norma.id_categoria ? categoriasMap[norma.id_categoria] || "" : "");
    const subCategoriaNome = normalizeText(getNomeSeguro(norma.tb_subcategoria, 'nome_subcategoria'));
    const tipoNome = normalizeText(getNomeSeguro(norma.tb_tipo, 'nome_tipo'));
    const dataFormatada = formatarDataSegura(norma.data_publicacao_norma);

    return (
      normalizeText(norma.titulo_norma).includes(term) ||
      normalizeText(norma.codigo_norma).includes(term) ||
      orgaoNome.includes(term) || orgaoSigla.includes(term) ||
      categoriaNome.includes(term) ||
      subCategoriaNome.includes(term) ||
      tipoNome.includes(term) ||
      normalizeText(dataFormatada).includes(term)
    );
  });

  if (activeTab === "favoritas") filteredNormas = filteredNormas.filter((n) => favoritas.includes(n.id_norma));
  else if (activeTab === "recentes") filteredNormas = filteredNormas.filter((n) => recentes.includes(n.id_norma));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Normas e Regulamentos</h1>
          <p className={styles.subtitle}>Gerencie e consulte todas as normas cadastradas no sistema.</p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.tabsContainer}>
          <button className={`${styles.tabButton} ${activeTab === 'recentes' ? styles.activeTab : ''}`} onClick={() => setActiveTab('recentes')}>Visualizadas Recentemente</button>
          <button className={`${styles.tabButton} ${activeTab === 'favoritas' ? styles.activeTab : ''}`} onClick={() => setActiveTab('favoritas')}>Normas Favoritadas</button>
          <button className={`${styles.tabButton} ${activeTab === 'todas' ? styles.activeTab : ''}`} onClick={() => setActiveTab('todas')}>Todas as Normas</button>
        </div>

        <div className={styles.filtersWrapper}>
          <div className={styles.searchContainer}>
            <Search size={18} className={styles.searchIcon} />
            <input type="text" placeholder="Pesquisar norma, órgão ou sigla..." className={styles.searchInput} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          
        </div>
      </div>

      <div className={styles.tableWrapper}>
        {isLoading ? (
          <div className={styles.loading}>Carregando normas...</div>
        ) : filteredNormas.length === 0 ? (
          <div className={styles.loading}>Nenhuma norma encontrada.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th} style={{ width: '40px' }}></th>
                <th className={styles.th}>Nome da Norma</th>
                <th className={styles.th}>Órgão</th>
                <th className={styles.th}>Categoria</th>
                <th className={styles.th}>Tipo de Arquivo</th>
                <th className={styles.th}>Data de Lançamento</th>
                <th className={styles.th} style={{ textAlign: "center" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredNormas.map((norma) => {
                const isFav = favoritas.includes(norma.id_norma);
                return (
                  <tr key={norma.id_norma} className={styles.tr}>
                    <td className={styles.td}>
                      <button className={styles.starBtn} onClick={(e) => toggleFavorite(e, norma.id_norma)}>
                        <Star size={20} fill={isFav ? "#F2C94C" : "none"} color={isFav ? "#F2C94C" : "#BDBDBD"} />
                      </button>
                    </td>
                    <td className={styles.td}>
                      <div className={styles.nomeNormaContainer} onClick={() => handleOpenDetails(norma)}>
                        <span className={styles.tituloNorma}>{norma.titulo_norma}</span>
                        <span className={styles.codigoNorma}>{norma.codigo_norma}</span>
                      </div>
                    </td>
                    <td className={styles.td}>{getOrgaoNome(norma.tb_orgaos)}</td>
                    <td className={styles.td}>{norma.id_categoria ? (categoriasMap[norma.id_categoria] || "—") : "—"}</td>
                    <td className={styles.td}>
                      {norma.caminho_arquivo ? <span className={styles.tipoBadge}>PDF</span> : <span className={styles.tipoBadgeDisabled}>N/A</span>}
                    </td>
                    <td className={styles.td}>
                      {norma.data_publicacao_norma ? formatarDataSegura(norma.data_publicacao_norma) : "—"}
                    </td>
                    <td className={styles.td} style={{ textAlign: "center" }}>
                      <button className={styles.visualizarBtn} onClick={(e) => { e.stopPropagation(); handleOpenPdf(norma.caminho_arquivo); }} disabled={!norma.caminho_arquivo}>
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {selectedNorma && !isPdfModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModals}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Detalhes da Norma</h2>
              <button className={styles.closeBtn} onClick={closeModals}><X size={24} /></button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.modalHighlight}>
                <h3>{selectedNorma.titulo_norma}</h3>
                <p>{selectedNorma.codigo_norma}</p>
              </div>

              <div className={styles.detailRow}>
                <div className={styles.iconCircle}><User size={20} color="#7A2E44" /></div>
                <div>
                  <span className={styles.detailLabel}>Revisor Responsável</span>
                  <span className={styles.detailValue}>{revisorNome}</span>
                </div>
              </div>
              
              <div className={styles.detailRow}>
                <div className={styles.iconCircle}><Calendar size={20} color="#7A2E44" /></div>
                <div>
                  <span className={styles.detailLabel}>Data de Lançamento</span>
                  <span className={styles.detailValue}>{selectedNorma.data_publicacao_norma ? formatarDataSegura(selectedNorma.data_publicacao_norma) : "Não definida"}</span>
                </div>
              </div>

              {/* REVISÕES ADICIONADAS */}
              <div className={styles.detailRow}>
                <div className={styles.iconCircle}><CheckCircle size={20} color="#7A2E44" /></div>
                <div>
                  <span className={styles.detailLabel}>Revisão Atual</span>
                  <span className={styles.detailValue}>{selectedNorma.revisao_norma_atual || "—"}</span>
                </div>
              </div>

              <div className={styles.detailRow}>
                <div className={styles.iconCircle}><Archive size={20} color="#7A2E44" /></div>
                <div>
                  <span className={styles.detailLabel}>Revisão Obsoleta</span>
                  <span className={styles.detailValue}>{selectedNorma.revisao_norma_obsoleta || "—"}</span>
                </div>
              </div>

              <div className={styles.detailRow}>
                <div className={styles.iconCircle}><FileText size={20} color="#7A2E44" /></div>
                <div>
                  <span className={styles.detailLabel}>Nome do Arquivo</span>
                  <span className={styles.detailValue}>{selectedNorma.caminho_arquivo ? selectedNorma.caminho_arquivo.split('/').pop() : "Sem arquivo anexado"}</span>
                </div>
              </div>

              <button className={styles.viewPdfButtonLarge} onClick={() => handleOpenPdf(selectedNorma.caminho_arquivo)} disabled={!selectedNorma.caminho_arquivo}>
                <Eye size={20} /> Visualizar PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {isPdfModalOpen && (
        <div className={styles.modalOverlayPdf} onClick={closeModals}>
          <div className={styles.pdfModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeaderPdf}>
              <div>
                <h2 className={styles.modalTitlePdf}>Visualização de Documento</h2>
                <span className={styles.subtitlePdf}>{selectedNorma?.caminho_arquivo?.split('/').pop()}</span>
              </div>
              <button className={styles.closeBtnPdf} onClick={closeModals}><X size={24} color="#fff" /></button>
            </div>
            <div className={styles.pdfContainer}>
              {isPdfLoading || !pdfUrl ? (
                <div style={{ color: "#fff", padding: "40px", textAlign: "center" }}>Gerando visualização segura...</div>
              ) : (
                <iframe src={pdfUrl} className={styles.pdfIframe} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}