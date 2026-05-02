"use client";

import { useState, useEffect } from "react";
import { Eye, Star, Search, X, FileText, User, Calendar, CheckCircle, Archive } from "lucide-react";
import { supabase } from "@/services/supabase";
import styles from "./peca.module.css";

interface Norma {
  id_norma: number;
  codigo_norma: string;
  titulo_norma: string;
  data_publicacao_norma: string | null;
  revisao_norma_atual: string;
  revisao_norma_obsoleta: string;
  caminho_arquivo: string | null;
  id_categoria: number;
  tb_orgaos?: { nome_completo_orgao: string; sigla_orgao: string } | any;
  tb_subcategoria?: { nome_subcategoria: string } | any;
  tb_tipo?: { nome_tipo: string } | any;
}

const normalizeText = (text: string | null | undefined) => {
  if (!text) return "";
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

const formatarDataSegura = (dataString: string | null) => {
  if (!dataString) return "";
  if (dataString.includes('/')) return dataString; 
  const parts = dataString.split('T')[0].split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dataString;
};

export default function NormasPeca() {
  const [normas, setNormas] = useState<Norma[]>([]);
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
      const { data } = await supabase
        .from("tb_normas")
        .select(`*, tb_orgaos ( nome_completo_orgao, sigla_orgao ), tb_subcategoria ( nome_subcategoria ), tb_tipo ( nome_tipo )`)
        .eq('id_categoria', 1) 
        .order("id_norma", { ascending: false });

      if (data) setNormas(data as Norma[]);

      const { data: rev } = await supabase.from("tb_usuarios").select("nome_usuario").eq("permissao_usuario", "REVISOR").limit(1).single();
      if (rev) setRevisorNome(rev.nome_usuario);

      setIsLoading(false);
    }
    fetchData();
  }, []);

  const getNomeSeguro = (obj: any, key: string) => {
    if (!obj) return "—";
    if (Array.isArray(obj)) return obj[0]?.[key] || "—";
    return obj[key] || "—";
  };

  const handleOpenDetails = (norma: Norma) => {
    setSelectedNorma(norma);
    if (!recentes.includes(norma.id_norma)) {
      const newR = [norma.id_norma, ...recentes];
      setRecentes(newR);
      localStorage.setItem('@normas_recentes', JSON.stringify(newR));
    }
  };

  const toggleFavorite = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const newF = favoritas.includes(id) ? favoritas.filter(f => f !== id) : [...favoritas, id];
    setFavoritas(newF);
    localStorage.setItem('@normas_favoritas', JSON.stringify(newF));
  };

  const handleOpenPdf = async (caminho: string | null) => {
    if (!caminho) return;
    setIsPdfLoading(true);
    setIsPdfModalOpen(true);
    const { data } = await supabase.storage.from("normas_pdfs").createSignedUrl(caminho, 3600);
    if (data) setPdfUrl(data.signedUrl);
    setIsPdfLoading(false);
  };

  const closeModals = () => { setSelectedNorma(null); setIsPdfModalOpen(false); setPdfUrl(""); };

  let filtered = normas.filter(n => {
    const term = normalizeText(searchTerm);
    const orgaoNome = normalizeText(getNomeSeguro(n.tb_orgaos, 'nome_completo_orgao'));
    const orgaoSigla = normalizeText(getNomeSeguro(n.tb_orgaos, 'sigla_orgao'));
    const subCat = normalizeText(getNomeSeguro(n.tb_subcategoria, 'nome_subcategoria'));
    const tipo = normalizeText(getNomeSeguro(n.tb_tipo, 'nome_tipo'));
    const dataFormatada = formatarDataSegura(n.data_publicacao_norma);

    return (
      normalizeText(n.titulo_norma).includes(term) ||
      normalizeText(n.codigo_norma).includes(term) ||
      orgaoNome.includes(term) ||
      orgaoSigla.includes(term) ||
      subCat.includes(term) ||
      tipo.includes(term) ||
      normalizeText(dataFormatada).includes(term)
    );
  });

  if (activeTab === "favoritas") filtered = filtered.filter(n => favoritas.includes(n.id_norma));
  else if (activeTab === "recentes") filtered = filtered.filter(n => recentes.includes(n.id_norma));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div><h1 className={styles.title}>Normas de Peça</h1><p className={styles.subtitle}>Gerencie e consulte todas as normas de categoria Peça.</p></div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.tabsContainer}>
          <button className={`${styles.tabButton} ${activeTab === 'recentes' ? styles.activeTab : ''}`} onClick={() => setActiveTab('recentes')}>Visualizadas Recentemente</button>
          <button className={`${styles.tabButton} ${activeTab === 'favoritas' ? styles.activeTab : ''}`} onClick={() => setActiveTab('favoritas')}>Normas Favoritadas</button>
          <button className={`${styles.tabButton} ${activeTab === 'todas' ? styles.activeTab : ''}`} onClick={() => setActiveTab('todas')}>Todas as Normas</button>
        </div>
        <div className={styles.filtersWrapper}>
          <div className={styles.searchContainer}><Search size={18} className={styles.searchIcon} /><input type="text" placeholder="Pesquisar norma..." className={styles.searchInput} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        {isLoading ? <div className={styles.loading}>Carregando normas...</div> : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th} style={{ width: '40px' }}></th>
                <th className={styles.th}>Nome da Norma</th>
                <th className={styles.th}>Órgão</th>
                <th className={styles.th}>Sub Categoria</th>
                <th className={styles.th}>Tipo</th>
                <th className={styles.th}>Tipo de Arquivo</th>
                <th className={styles.th}>Data de Lançamento</th>
                <th className={styles.th} style={{ textAlign: "center" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((norma) => (
                <tr key={norma.id_norma} className={styles.tr}>
                  <td className={styles.td}>
                    <button className={styles.starBtn} onClick={(e) => toggleFavorite(e, norma.id_norma)}>
                      <Star size={20} fill={favoritas.includes(norma.id_norma) ? "#F2C94C" : "none"} color={favoritas.includes(norma.id_norma) ? "#F2C94C" : "#BDBDBD"} />
                    </button>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.nomeNormaContainer} onClick={() => handleOpenDetails(norma)}>
                      <span className={styles.tituloNorma}>{norma.titulo_norma}</span><span className={styles.codigoNorma}>{norma.codigo_norma}</span>
                    </div>
                  </td>
                  <td className={styles.td}>{getNomeSeguro(norma.tb_orgaos, 'sigla_orgao')}</td>
                  <td className={styles.td}>{getNomeSeguro(norma.tb_subcategoria, 'nome_subcategoria')}</td>
                  <td className={styles.td}>{getNomeSeguro(norma.tb_tipo, 'nome_tipo')}</td>
                  <td className={styles.td}>{norma.caminho_arquivo ? <span className={styles.tipoBadge}>PDF</span> : <span className={styles.tipoBadgeDisabled}>N/A</span>}</td>
                  <td className={styles.td}>{formatarDataSegura(norma.data_publicacao_norma)}</td>
                  <td className={styles.td} style={{ textAlign: "center" }}>
                    <button className={styles.visualizarBtn} onClick={(e) => { e.stopPropagation(); handleOpenPdf(norma.caminho_arquivo); }} disabled={!norma.caminho_arquivo}><Eye size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedNorma && !isPdfModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModals}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}><h2 className={styles.modalTitle}>Detalhes da Norma</h2><button className={styles.closeBtn} onClick={closeModals}><X size={24} /></button></div>
            <div className={styles.modalBody}>
              <div className={styles.modalHighlight}><h3>{selectedNorma.titulo_norma}</h3><p>{selectedNorma.codigo_norma}</p></div>
              
              <div className={styles.detailRow}><div className={styles.iconCircle}><User size={20} color="#7A2E44" /></div><div><span className={styles.detailLabel}>Revisor Responsável</span><span className={styles.detailValue}>{revisorNome}</span></div></div>
              <div className={styles.detailRow}><div className={styles.iconCircle}><Calendar size={20} color="#7A2E44" /></div><div><span className={styles.detailLabel}>Data de Lançamento</span><span className={styles.detailValue}>{formatarDataSegura(selectedNorma.data_publicacao_norma)}</span></div></div>
              
              <div className={styles.detailRow}>
                <div className={styles.iconCircle}><CheckCircle size={20} color="#7A2E44" /></div>
                <div><span className={styles.detailLabel}>Revisão Atual</span><span className={styles.detailValue}>{selectedNorma.revisao_norma_atual || "—"}</span></div>
              </div>

              <div className={styles.detailRow}>
                <div className={styles.iconCircle}><Archive size={20} color="#7A2E44" /></div>
                <div><span className={styles.detailLabel}>Revisão Obsoleta</span><span className={styles.detailValue}>{selectedNorma.revisao_norma_obsoleta || "—"}</span></div>
              </div>

              <div className={styles.detailRow}>
                <div className={styles.iconCircle}><FileText size={20} color="#7A2E44" /></div>
                <div>
                  <span className={styles.detailLabel}>Nome do Arquivo</span>
                  <span className={styles.detailValue}>{selectedNorma.caminho_arquivo ? selectedNorma.caminho_arquivo.split('/').pop() : "Sem arquivo anexado"}</span>
                </div>
              </div>

              <button className={styles.viewPdfButtonLarge} onClick={() => handleOpenPdf(selectedNorma.caminho_arquivo)} disabled={!selectedNorma.caminho_arquivo}><Eye size={20} /> Visualizar PDF</button>
            </div>
          </div>
        </div>
      )}
      
      {isPdfModalOpen && (
        <div className={styles.modalOverlayPdf} onClick={closeModals}>
          <div className={styles.pdfModalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeaderPdf}><div><h2 className={styles.modalTitlePdf}>Visualização</h2></div><button className={styles.closeBtnPdf} onClick={closeModals}><X size={24} color="#fff" /></button></div>
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