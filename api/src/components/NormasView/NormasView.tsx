"use client";

import { useState, useEffect } from "react";
import { Eye, Star, Search, X, FileText, User, Calendar, CheckCircle, Archive, Link, ArrowLeft, Tag } from "lucide-react";
import { supabase } from "@/services/supabase";
import styles from "@/app/(private)/home/home.module.css";

interface Norma {
  id_norma: number;
  codigo_norma: string;
  titulo_norma: string;
  escopo_norma: string;
  data_publicacao_norma: string | null;
  revisao_norma_atual: string;
  revisao_norma_obsoleta: string;
  caminho_arquivo: string | null;
  id_categoria: number | null;
  id_usuario?: number | null;
  tb_orgaos?: { nome_completo_orgao: string; sigla_orgao: string } | any;
  tb_subcategoria?: { nome_subcategoria: string } | any;
  tb_tipo?: { nome_tipo: string } | any;
}

interface NormaResumida {
  id_norma: number;
  codigo_norma: string;
  titulo_norma: string;
}

interface ArquivoNorma {
  caminho_arquivo: string;
}

interface Props {
  categoriaId: number;
  titulo: string;
  subtitulo: string;
}

const getNomeSeguro = (obj: any, key: string) => {
  if (!obj) return "—";
  if (Array.isArray(obj)) return obj[0]?.[key] || "—";
  return obj[key] || "—";
};

const normalizeText = (text: string | null | undefined) => {
  if (!text) return "";
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
};

const formatarDataSegura = (dataString: string | null) => {
  if (!dataString) return "";
  if (dataString.includes('/')) return dataString;
  const parts = dataString.split('T')[0].split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dataString;
};

export default function NormasView({ categoriaId, titulo, subtitulo }: Props) {
  const [normas, setNormas] = useState<Norma[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState({ nome: "Não atribuído", role: "" });

  const [activeTab, setActiveTab] = useState<"todas" | "recentes" | "favoritas">("todas");
  const [searchTerm, setSearchTerm] = useState("");

  const [favoritas, setFavoritas] = useState<number[]>([]);
  const [recentes, setRecentes] = useState<number[]>([]);

  const [selectedNorma, setSelectedNorma] = useState<Norma | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [pdfNomeAtual, setPdfNomeAtual] = useState("");

  const [correlacionadas, setCorrelacionadas] = useState<NormaResumida[]>([]);
  const [isLoadingCorrel, setIsLoadingCorrel] = useState(false);
  const [responsavelNome, setResponsavelNome] = useState("Não atribuído");
  const [arquivosNorma, setArquivosNorma] = useState<ArquivoNorma[]>([]);
  const [pdfSelecionado, setPdfSelecionado] = useState("");
  const [palavrasChaveNorma, setPalavrasChaveNorma] = useState<string[]>([]);
  const [dropdownAberto, setDropdownAberto] = useState<number | null>(null);
  const [arquivosPorNorma, setArquivosPorNorma] = useState<Record<number, string[]>>({});

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
        .eq('id_categoria', categoriaId)
        .order("id_norma", { ascending: false });

      if (data) setNormas(data as Norma[]);

      const { data: { user } } = await supabase.auth.getUser();
      let userQuery = supabase.from("tb_usuarios").select("nome_usuario, sobrenome_usuario, permissao_usuario");

      if (user?.email) {
        userQuery = userQuery.ilike("email_usuario", user.email);
      } else {
        const localUsername = localStorage.getItem("nome_usuario");
        if (localUsername) userQuery = userQuery.ilike("nome_usuario", localUsername);
      }

      const { data: userData } = await userQuery.maybeSingle();
      if (userData) {
        const role =
          userData.permissao_usuario === "ADMIN" ? "Administrador" :
          userData.permissao_usuario === "REVISOR" ? "Revisor" : "Consultor";
        const nome = `${userData.nome_usuario} ${userData.sobrenome_usuario || ""}`.trim();
        setCurrentUser({ nome, role });
      }

      setIsLoading(false);
    }

    fetchData();
  }, [categoriaId]);

  useEffect(() => {
    if (dropdownAberto === null) return;
    const fechar = () => setDropdownAberto(null);
    document.addEventListener("click", fechar);
    return () => document.removeEventListener("click", fechar);
  }, [dropdownAberto]);

  useEffect(() => {
    if (currentUser.role !== "Consultor" || !isPdfModalOpen) return;

    const bloquearTecla = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") e.preventDefault();
    };

    document.addEventListener("keydown", bloquearTecla);
    return () => document.removeEventListener("keydown", bloquearTecla);
  }, [currentUser.role, isPdfModalOpen]);

  const handleOpenDetails = async (norma: Norma) => {
    setSelectedNorma(norma);
    setCorrelacionadas([]);
    setArquivosNorma([]);
    setPalavrasChaveNorma([]);
    setIsLoadingCorrel(true);
    setResponsavelNome("Não atribuído");

    setRecentes((prev) => {
      if (!prev.includes(norma.id_norma)) {
        const newRecentes = [norma.id_norma, ...prev];
        localStorage.setItem('@normas_recentes', JSON.stringify(newRecentes));
        return newRecentes;
      }
      return prev;
    });

    if (norma.id_usuario) {
      const { data: criador } = await supabase
        .from("tb_usuarios")
        .select("nome_usuario, sobrenome_usuario")
        .eq("id_usuario", norma.id_usuario)
        .maybeSingle();

      if (criador) {
        setResponsavelNome(`${criador.nome_usuario} ${criador.sobrenome_usuario || ""}`.trim());
      }
    }

    const { data: arquivosData } = await supabase
      .from("tb_arquivos_normas")
      .select("caminho_arquivo")
      .eq("id_norma", norma.id_norma);

    if (arquivosData && arquivosData.length > 0) {
      setArquivosNorma(arquivosData as ArquivoNorma[]);
      setPdfSelecionado(arquivosData[0].caminho_arquivo);
    } else if (norma.caminho_arquivo) {
      setPdfSelecionado(norma.caminho_arquivo);
    }

    const { data: correlData } = await supabase
      .from("tb_normas_correlacionadas")
      .select("id_norma_correlacionada")
      .eq("id_norma_origem", norma.id_norma);

    if (correlData && correlData.length > 0) {
      const ids = correlData.map((c: any) => c.id_norma_correlacionada);
      const { data: normasCorrel } = await supabase
        .from("tb_normas")
        .select("id_norma, codigo_norma, titulo_norma")
        .in("id_norma", ids);

      if (normasCorrel) setCorrelacionadas(normasCorrel as NormaResumida[]);
    }

    const { data: pcData } = await supabase
      .from("tb_normas_palavras_chave")
      .select("id_palavra_chave")
      .eq("id_norma", norma.id_norma);

    if (pcData && pcData.length > 0) {
      const ids = pcData.map((p: any) => p.id_palavra_chave);
      const { data: palavras } = await supabase
        .from("tb_palavra_chave")
        .select("termo_palavra_chave")
        .in("id_palavra_chave", ids);
      if (palavras) setPalavrasChaveNorma(palavras.map((p: any) => p.termo_palavra_chave));
    }

    setIsLoadingCorrel(false);
  };

  const toggleFavorite = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setFavoritas((prev) => {
      const newFavs = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      localStorage.setItem('@normas_favoritas', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const handleAcaoClick = async (e: React.MouseEvent, norma: Norma) => {
    e.stopPropagation();

    if (dropdownAberto === norma.id_norma) {
      setDropdownAberto(null);
      return;
    }

    const cached = arquivosPorNorma[norma.id_norma];
    if (cached) {
      if (cached.length === 1) handleOpenPdf(cached[0]);
      else setDropdownAberto(norma.id_norma);
      return;
    }

    const { data } = await supabase
      .from("tb_arquivos_normas")
      .select("caminho_arquivo")
      .eq("id_norma", norma.id_norma);

    const caminhos = data && data.length > 0
      ? data.map((d: any) => d.caminho_arquivo)
      : (norma.caminho_arquivo ? [norma.caminho_arquivo] : []);

    setArquivosPorNorma((prev) => ({ ...prev, [norma.id_norma]: caminhos }));

    if (caminhos.length === 0) return;
    if (caminhos.length === 1) handleOpenPdf(caminhos[0]);
    else setDropdownAberto(norma.id_norma);
  };

  const handleOpenPdf = async (caminho: string | null) => {
    if (!caminho) return;
    setDropdownAberto(null);
    setIsPdfLoading(true);
    setIsPdfModalOpen(true);
    setPdfNomeAtual(caminho.split('/').pop() || "");
    const { data, error } = await supabase.storage.from("normas_pdfs").createSignedUrl(caminho, 3600);
    if (!error && data) setPdfUrl(data.signedUrl);
    setIsPdfLoading(false);
  };

  const closePdfOnly = () => {
    setIsPdfModalOpen(false);
    setPdfUrl("");
    setPdfNomeAtual("");
  };

  const closeModals = () => {
    setSelectedNorma(null);
    setIsPdfModalOpen(false);
    setPdfUrl("");
    setPdfNomeAtual("");
    setCorrelacionadas([]);
    setArquivosNorma([]);
    setPalavrasChaveNorma([]);
    setResponsavelNome("Não atribuído");
    setPdfSelecionado("");
  };

  const getArquivosParaExibir = (): ArquivoNorma[] => {
    if (arquivosNorma.length > 0) return arquivosNorma;
    if (selectedNorma?.caminho_arquivo) return [{ caminho_arquivo: selectedNorma.caminho_arquivo }];
    return [];
  };

  let filtered = normas.filter((norma) => {
    const term = normalizeText(searchTerm);
    return (
      normalizeText(norma.titulo_norma).includes(term) ||
      normalizeText(norma.codigo_norma).includes(term) ||
      normalizeText(getNomeSeguro(norma.tb_orgaos, 'nome_completo_orgao')).includes(term) ||
      normalizeText(getNomeSeguro(norma.tb_orgaos, 'sigla_orgao')).includes(term) ||
      normalizeText(getNomeSeguro(norma.tb_subcategoria, 'nome_subcategoria')).includes(term) ||
      normalizeText(getNomeSeguro(norma.tb_tipo, 'nome_tipo')).includes(term) ||
      normalizeText(formatarDataSegura(norma.data_publicacao_norma)).includes(term)
    );
  });

  if (activeTab === "favoritas") filtered = filtered.filter((n) => favoritas.includes(n.id_norma));
  else if (activeTab === "recentes") filtered = filtered.filter((n) => recentes.includes(n.id_norma));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{titulo}</h1>
          <p className={styles.subtitle}>{subtitulo}</p>
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
            <input type="text" placeholder="Pesquisar norma..." className={styles.searchInput} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        {isLoading ? (
          <div className={styles.loading}>Carregando normas...</div>
        ) : filtered.length === 0 ? (
          <div className={styles.loading}>Nenhuma norma encontrada.</div>
        ) : (
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
              {filtered.map((norma) => {
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
                    <td className={styles.td}>{getNomeSeguro(norma.tb_orgaos, 'sigla_orgao')}</td>
                    <td className={styles.td}>{getNomeSeguro(norma.tb_subcategoria, 'nome_subcategoria')}</td>
                    <td className={styles.td}>{getNomeSeguro(norma.tb_tipo, 'nome_tipo')}</td>
                    <td className={styles.td}>
                      {norma.caminho_arquivo ? <span className={styles.tipoBadge}>PDF</span> : <span className={styles.tipoBadgeDisabled}>N/A</span>}
                    </td>
                    <td className={styles.td}>{formatarDataSegura(norma.data_publicacao_norma) || "—"}</td>
                    <td className={styles.td} style={{ textAlign: "center", position: "relative" }}>
                      <button
                        className={styles.visualizarBtn}
                        onClick={(e) => handleAcaoClick(e, norma)}
                        disabled={!norma.caminho_arquivo}
                      >
                        <Eye size={18} />
                      </button>
                      {dropdownAberto === norma.id_norma && (
                        <div className={styles.pdfDropdownMenu} onClick={(e) => e.stopPropagation()}>
                          {(arquivosPorNorma[norma.id_norma] || []).map((caminho, i) => (
                            <button
                              key={i}
                              className={styles.pdfDropdownItem}
                              onClick={() => handleOpenPdf(caminho)}
                            >
                              <FileText size={14} />
                              <span>{caminho.split('/').pop()}</span>
                            </button>
                          ))}
                        </div>
                      )}
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

              <div className={styles.metadadosGrid}>
                <div className={styles.detailRow}>
                  <div className={styles.iconCircle}><User size={20} color="#7A2E44" /></div>
                  <div>
                    <span className={styles.detailLabel}>Responsável</span>
                    <span className={styles.detailValue}>{responsavelNome}</span>
                  </div>
                </div>

                <div className={styles.detailRow}>
                  <div className={styles.iconCircle}><Calendar size={20} color="#7A2E44" /></div>
                  <div>
                    <span className={styles.detailLabel}>Data de Lançamento</span>
                    <span className={styles.detailValue}>{formatarDataSegura(selectedNorma.data_publicacao_norma) || "Não definida"}</span>
                  </div>
                </div>

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
              </div>

              {selectedNorma.escopo_norma && (
                <div className={styles.escopoSection}>
                  <span className={styles.sectionLabel}>Escopo</span>
                  <p className={styles.escopoText}>{selectedNorma.escopo_norma}</p>
                </div>
              )}

              <div className={styles.detailRow} style={{ alignItems: 'flex-start' }}>
                <div className={styles.iconCircle}><Link size={20} color="#7A2E44" /></div>
                <div>
                  <span className={styles.detailLabel}>Normas Correlacionadas</span>
                  {isLoadingCorrel ? (
                    <span className={styles.correlLoading}>Carregando...</span>
                  ) : correlacionadas.length === 0 ? (
                    <span className={styles.detailValue}>Nenhuma</span>
                  ) : (
                    <div className={styles.correlList}>
                      {correlacionadas.map((c) => (
                        <span key={c.id_norma} className={styles.correlChip} title={c.titulo_norma}>
                          {c.codigo_norma}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.detailRow} style={{ alignItems: 'flex-start' }}>
                <div className={styles.iconCircle}><Tag size={20} color="#7A2E44" /></div>
                <div>
                  <span className={styles.detailLabel}>Palavras-chave</span>
                  {isLoadingCorrel ? (
                    <span className={styles.correlLoading}>Carregando...</span>
                  ) : palavrasChaveNorma.length === 0 ? (
                    <span className={styles.detailValue}>Nenhuma</span>
                  ) : (
                    <div className={styles.correlList}>
                      {palavrasChaveNorma.map((termo, i) => (
                        <span key={i} className={styles.palavraChaveChip}>{termo}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.arquivosSection}>
                <span className={styles.sectionLabel}>Arquivos PDF</span>
                {isLoadingCorrel ? (
                  <span className={styles.correlLoading}>Carregando...</span>
                ) : getArquivosParaExibir().length === 0 ? (
                  <span className={styles.detailValue}>Sem arquivo anexado</span>
                ) : getArquivosParaExibir().length === 1 ? (
                  <button className={styles.arquivoItem} onClick={() => handleOpenPdf(getArquivosParaExibir()[0].caminho_arquivo)}>
                    <FileText size={16} />
                    <span>{getArquivosParaExibir()[0].caminho_arquivo.split('/').pop()}</span>
                    <Eye size={14} />
                  </button>
                ) : (
                  <div className={styles.pdfDropdownWrapper}>
                    <select
                      className={styles.pdfDropdown}
                      value={pdfSelecionado}
                      onChange={(e) => setPdfSelecionado(e.target.value)}
                    >
                      {getArquivosParaExibir().map((a, i) => (
                        <option key={i} value={a.caminho_arquivo}>
                          {a.caminho_arquivo.split('/').pop()}
                        </option>
                      ))}
                    </select>
                    <button
                      className={styles.visualizarDropdownBtn}
                      onClick={() => handleOpenPdf(pdfSelecionado)}
                      disabled={!pdfSelecionado}
                    >
                      <Eye size={16} /> Visualizar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isPdfModalOpen && (
        <div
          className={`${styles.modalOverlayPdf} ${currentUser.role === "Consultor" ? styles.protectedModal : ""}`}
          onClick={closeModals}
          onContextMenu={currentUser.role === "Consultor" ? (e) => e.preventDefault() : undefined}
        >
          <div className={styles.pdfModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeaderPdf}>
              <button className={styles.backBtnPdf} onClick={closePdfOnly}>
                <ArrowLeft size={20} /> Voltar
              </button>
              <div>
                <h2 className={styles.modalTitlePdf}>Visualização de Documento</h2>
                <span className={styles.subtitlePdf}>{pdfNomeAtual}</span>
              </div>
              <button className={styles.closeBtnPdf} onClick={closeModals}><X size={24} color="#fff" /></button>
            </div>
            <div className={styles.pdfContainer}>
              {isPdfLoading || !pdfUrl ? (
                <div style={{ color: "#fff", padding: "40px", textAlign: "center" }}>Gerando visualização segura...</div>
              ) : (
                <>
                  <iframe src={pdfUrl} className={styles.pdfIframe} title={pdfNomeAtual} />
                  {currentUser.role === "Consultor" && (
                    <div className={styles.pdfWatermarkOverlay} aria-hidden="true">
                      {Array.from({ length: 30 }).map((_, i) => (
                        <span key={i} className={styles.pdfWatermarkText}>{currentUser.nome}</span>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
