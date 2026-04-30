"use client";

import { useState, useEffect } from "react";
import { Search, X, PlusCircle, CheckCircle, XCircle, Clock, Edit3, Lock } from "lucide-react";
import { supabase } from "@/services/supabase";
import styles from "./solicitacoes.module.css";

interface Proposta {
  id_proposta: number;
  id_norma: number;
  id_usuario: number;
  id_verificacao: number;
  novo_id_orgao: number | null;
  novo_codigo_norma: string;
  novo_titulo_norma: string;
  nova_descricao_norma: string;
  motivo_solicitacao: string | null;
  status_proposta: number;
  data_solicitacao: string;
  data_analise: string | null;
  observacoes_revisor: string | null;
  nova_revisao_atual: string | null;
  nova_revisao_obsoleta: string | null;
  tb_normas?: {
    titulo_norma: string;
    codigo_norma: string;
    escopo_norma: string;
    revisao_norma_atual: string;
    revisao_norma_obsoleta: string;
    id_orgao: number | null;
    id_categoria: number | null;
    id_subcategoria: number | null;
    id_tipo: number | null;
  };
  tb_usuarios?: { nome_usuario: string; sobrenome_usuario: string };
}

interface Opcao {
  id: number;
  nome: string;
}

interface SubCategoria extends Opcao {
  id_categoria: number;
}

interface Tipo extends Opcao {
  id_subcategoria: number;
}

export default function SolicitacoesNormas() {
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [orgaos, setOrgaos] = useState<Opcao[]>([]);
  const [categorias, setCategorias] = useState<Opcao[]>([]);
  const [subcategorias, setSubcategorias] = useState<SubCategoria[]>([]);
  const [subcategoriasFiltradas, setSubcategoriasFiltradas] = useState<SubCategoria[]>([]);
  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [tiposFiltrados, setTiposFiltrados] = useState<Tipo[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [isNovaSolicitacaoOpen, setIsNovaSolicitacaoOpen] = useState(false);
  const [isDetalhesOpen, setIsDetalhesOpen] = useState(false);
  const [isReprovarOpen, setIsReprovarOpen] = useState(false);
  const [isEditarNormaOpen, setIsEditarNormaOpen] = useState(false);

  const [selectedProposta, setSelectedProposta] = useState<Proposta | null>(null);

  const [codigoBusca, setCodigoBusca] = useState("");
  const [normaEncontradaId, setNormaEncontradaId] = useState<number | null>(null);

  const [formSugerir, setFormSugerir] = useState({
    motivo: "",
    titulo: "",
    codigo: "",
    escopo: "",
    idOrgao: "",
    revisaoAtual: "",
    revisaoObsoleta: "",
  });

  const [editCategoria, setEditCategoria] = useState("");
  const [editSubcategoria, setEditSubcategoria] = useState("");
  const [editTipo, setEditTipo] = useState("");

  const [erroForm, setErroForm] = useState("");
  const [justificativa, setJustificativa] = useState("");

  useEffect(() => {
    async function init() {
      setIsLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      let queryUser = supabase.from("tb_usuarios").select("id_usuario, permissao_usuario");

      if (user && user.email) {
        queryUser = queryUser.ilike("email_usuario", user.email);
      } else if (typeof window !== "undefined") {
        queryUser = queryUser.ilike("nome_usuario", localStorage.getItem("nome_usuario") || "");
      }

      const { data: userData } = await queryUser.maybeSingle();

      if (userData) {
        setUserId(userData.id_usuario);
        setUserRole(userData.permissao_usuario);

        let queryPropostas = supabase
          .from("tb_propostas_alteracao_normas")
          .select(`*, tb_normas(titulo_norma, codigo_norma, escopo_norma, revisao_norma_atual, revisao_norma_obsoleta, id_orgao, id_categoria, id_subcategoria, id_tipo), tb_usuarios(nome_usuario, sobrenome_usuario)`)
          .order("data_solicitacao", { ascending: false });

        if (userData.permissao_usuario === "CONSULTOR") {
          queryPropostas = queryPropostas.eq("id_usuario", userData.id_usuario);
        }

        const { data: propostasData } = await queryPropostas;
        if (propostasData) setPropostas(propostasData as any);
      }

      const { data: orgData } = await supabase.from("tb_orgaos").select("id_orgao, nome_completo_orgao");
      if (orgData) setOrgaos(orgData.map(o => ({ id: o.id_orgao, nome: o.nome_completo_orgao })));

      const { data: catData } = await supabase.from("tb_categorias").select("id_categoria, nome_categoria");
      if (catData) setCategorias(catData.map(c => ({ id: c.id_categoria, nome: c.nome_categoria })));

      const { data: subData } = await supabase.from("tb_subcategoria").select("id_subcategoria, nome_subcategoria, id_categoria");
      if (subData) setSubcategorias(subData.map(s => ({ id: s.id_subcategoria, nome: s.nome_subcategoria, id_categoria: s.id_categoria })));

      const { data: tipoData } = await supabase.from("tb_tipo").select("id_tipo, nome_tipo, id_subcategoria");
      if (tipoData) setTipos(tipoData.map(t => ({ id: t.id_tipo, nome: t.nome_tipo, id_subcategoria: t.id_subcategoria })));

      setIsLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    if (!editCategoria) {
      setSubcategoriasFiltradas([]);
      setEditSubcategoria("");
      setTiposFiltrados([]);
      setEditTipo("");
      return;
    }
    const filtradas = subcategorias.filter(s => s.id_categoria === parseInt(editCategoria));
    setSubcategoriasFiltradas(filtradas);
    setEditSubcategoria("");
    setTiposFiltrados([]);
    setEditTipo("");
  }, [editCategoria, subcategorias]);

  useEffect(() => {
    if (!editSubcategoria) {
      setTiposFiltrados([]);
      setEditTipo("");
      return;
    }
    const filtrados = tipos.filter(t => t.id_subcategoria === parseInt(editSubcategoria));
    setTiposFiltrados(filtrados);
    setEditTipo("");
  }, [editSubcategoria, tipos]);

  const formatData = (isoStr: string) => {
    if (!isoStr) return "—";
    const date = new Date(isoStr);
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const getStatusInfo = (status: number) => {
    switch (status) {
      case 1: return { label: "Sugerido", css: styles.status0 };
      case 2: return { label: "Em andamento", css: styles.status1 };
      case 3: return { label: "Concluído", css: styles.status2 };
      case 4: return { label: "Reprovado", css: styles.status3 };
      default: return { label: "Desconhecido", css: styles.status0 };
    }
  };

  const getNomePorId = (lista: Opcao[], id: number | null | undefined) => {
    if (!id) return "—";
    const item = lista.find(i => i.id === id);
    return item ? item.nome : "—";
  };

  const handleBuscarNorma = async () => {
    setErroForm("");
    if (!codigoBusca.trim()) {
      setErroForm("Digite o código da norma antes de buscar.");
      return;
    }

    const { data, error } = await supabase
      .from("tb_normas")
      .select("*")
      .eq("codigo_norma", codigoBusca.trim())
      .maybeSingle();

    if (error) {
      setErroForm("Erro na busca: " + error.message);
      return;
    }

    if (data) {
      setNormaEncontradaId(data.id_norma);
      setFormSugerir({
        motivo: "",
        titulo: data.titulo_norma || "",
        codigo: data.codigo_norma || "",
        escopo: data.escopo_norma || "",
        idOrgao: data.id_orgao ? data.id_orgao.toString() : "",
        revisaoAtual: data.revisao_norma_atual || "",
        revisaoObsoleta: data.revisao_norma_obsoleta || "",
      });
    } else {
      setNormaEncontradaId(null);
      setErroForm("Norma não encontrada. Verifique o código digitado.");
    }
  };

  const handleSubmitNovaSolicitacao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!normaEncontradaId || !userId) return;
    if (!formSugerir.motivo.trim()) {
      setErroForm("O motivo da solicitação é obrigatório.");
      return;
    }

    setIsSubmitting(true);
    setErroForm("");

    const { error } = await supabase
      .from("tb_propostas_alteracao_normas")
      .insert({
        id_norma: normaEncontradaId,
        id_usuario: userId,
        id_verificacao: 0,
        motivo_solicitacao: formSugerir.motivo,
        novo_codigo_norma: formSugerir.codigo,
        novo_titulo_norma: formSugerir.titulo,
        nova_descricao_norma: formSugerir.escopo,
        novo_id_orgao: formSugerir.idOrgao ? parseInt(formSugerir.idOrgao) : null,
        nova_revisao_atual: formSugerir.revisaoAtual || null,
        nova_revisao_obsoleta: formSugerir.revisaoObsoleta || null,
        status_proposta: 1,
        data_solicitacao: new Date().toISOString(),
      });

    if (error) {
      setErroForm("Erro ao enviar solicitação: " + error.message);
      setIsSubmitting(false);
      return;
    }

    window.location.reload();
  };

  const handleAlterarStatus = async (novoStatus: number, observacoes: string | null = null) => {
    if (!selectedProposta) return;

    setIsSubmitting(true);

    const { error } = await supabase
      .from("tb_propostas_alteracao_normas")
      .update({
        status_proposta: novoStatus,
        id_verificacao: novoStatus,
        data_analise: new Date().toISOString(),
        observacoes_revisor: observacoes,
      })
      .eq("id_proposta", selectedProposta.id_proposta);

    if (error) {
      setErroForm("Erro ao alterar status: " + error.message);
      setIsSubmitting(false);
      return;
    }

    if (novoStatus === 3 || novoStatus === 4) {
      await supabase
        .from("tb_normas")
        .update({ status_norma: novoStatus })
        .eq("id_norma", selectedProposta.id_norma);
    }

    window.location.reload();
  };

  const handleSalvarEdicaoNorma = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProposta) return;

    setIsSubmitting(true);
    setErroForm("");

    const { error: errorNorma } = await supabase
      .from("tb_normas")
      .update({
        codigo_norma: selectedProposta.novo_codigo_norma,
        titulo_norma: selectedProposta.novo_titulo_norma,
        escopo_norma: selectedProposta.nova_descricao_norma,
        id_orgao: selectedProposta.novo_id_orgao,
        id_categoria: editCategoria ? parseInt(editCategoria) : selectedProposta.tb_normas?.id_categoria ?? null,
        id_subcategoria: editSubcategoria ? parseInt(editSubcategoria) : selectedProposta.tb_normas?.id_subcategoria ?? null,
        id_tipo: selectedProposta.tb_normas?.id_tipo ?? null,
        revisao_norma_atual: selectedProposta.nova_revisao_atual,
        revisao_norma_obsoleta: selectedProposta.nova_revisao_obsoleta,
        status_norma: 3,
      })
      .eq("id_norma", selectedProposta.id_norma);

    if (!errorNorma) {
      await handleAlterarStatus(3, "Alterações aplicadas com sucesso pelo revisor.");
    } else {
      setErroForm("Erro ao atualizar a norma: " + errorNorma.message);
      setIsSubmitting(false);
    }
  };

  const abrirDetalhes = (prop: Proposta) => {
    setSelectedProposta(prop);
    setErroForm("");
    setJustificativa("");
    setEditCategoria(prop.tb_normas?.id_categoria?.toString() || "");
    setEditSubcategoria(prop.tb_normas?.id_subcategoria?.toString() || "");
    setEditTipo(prop.tb_normas?.id_tipo?.toString() || "");
    setIsDetalhesOpen(true);
  };

  const fecharTudo = () => {
    setIsNovaSolicitacaoOpen(false);
    setIsDetalhesOpen(false);
    setIsReprovarOpen(false);
    setIsEditarNormaOpen(false);
    setSelectedProposta(null);
    setErroForm("");
    setJustificativa("");
    setCodigoBusca("");
    setNormaEncontradaId(null);
    setEditCategoria("");
    setEditSubcategoria("");
    setEditTipo("");
    setFormSugerir({ motivo: "", titulo: "", codigo: "", escopo: "", idOrgao: "", revisaoAtual: "", revisaoObsoleta: "" });
  };

  const filteredPropostas = propostas.filter(p => {
    const term = searchTerm.toLowerCase();
    const titulo = p.tb_normas?.titulo_norma?.toLowerCase() || "";
    const codigo = p.tb_normas?.codigo_norma?.toLowerCase() || "";
    const nomeUser = `${p.tb_usuarios?.nome_usuario} ${p.tb_usuarios?.sobrenome_usuario}`.toLowerCase();
    return titulo.includes(term) || codigo.includes(term) || nomeUser.includes(term);
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Solicitações de Normas</h1>
          <p className={styles.subtitle}>
            {userRole === "CONSULTOR"
              ? "Acompanhe o status das solicitações de alteração que você enviou."
              : "Gerencie e analise as propostas de alteração enviadas pelos consultores."}
          </p>
        </div>

        {userRole === "CONSULTOR" && (
          <button className={styles.btnNovaSolicitacao} onClick={() => setIsNovaSolicitacaoOpen(true)}>
            <PlusCircle size={20} /> Sugerir uma solicitação de mudança de norma
          </button>
        )}
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchContainer}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Pesquisar por norma, código ou solicitante..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableWrapper}>
        {isLoading ? (
          <div className={styles.loading}>Carregando solicitações...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Norma Original</th>
                <th className={styles.th}>Solicitante</th>
                <th className={styles.th}>Data do Pedido</th>
                <th className={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPropostas.length === 0 ? (
                <tr>
                  <td colSpan={4} className={styles.loading}>Nenhuma solicitação encontrada.</td>
                </tr>
              ) : (
                filteredPropostas.map((prop) => {
                  const status = getStatusInfo(prop.status_proposta);
                  return (
                    <tr key={prop.id_proposta} className={styles.tr} onClick={() => abrirDetalhes(prop)}>
                      <td className={styles.td}>
                        <div className={styles.normaInfo}>
                          <span className={styles.normaTitulo}>{prop.tb_normas?.titulo_norma}</span>
                          <span className={styles.normaCodigo}>{prop.tb_normas?.codigo_norma}</span>
                        </div>
                      </td>
                      <td className={styles.td}>{prop.tb_usuarios?.nome_usuario} {prop.tb_usuarios?.sobrenome_usuario}</td>
                      <td className={styles.td}>{formatData(prop.data_solicitacao)}</td>
                      <td className={styles.td}>
                        <span className={`${styles.badge} ${status.css}`}>{status.label}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {isNovaSolicitacaoOpen && (
        <div className={styles.modalOverlay} onClick={fecharTudo}>
          <div className={styles.modalContentLarge} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Sugerir Mudança de Norma</h2>
              <button className={styles.closeBtn} onClick={fecharTudo}><X size={24} /></button>
            </div>

            <div className={styles.modalBody}>
              {erroForm && <div className={styles.alertError}>{erroForm}</div>}

              <div className={styles.formGroup}>
                <label className={styles.label}>Código da Norma Atual (Busca):</label>
                <div className={styles.searchNormaGroup}>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Ex: XXX-Y-ZZZ"
                    value={codigoBusca}
                    onChange={(e) => setCodigoBusca(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleBuscarNorma()}
                  />
                  <button type="button" className={styles.btnBuscar} onClick={handleBuscarNorma}>
                    <Search size={20} />
                  </button>
                </div>
              </div>

              {normaEncontradaId && (
                <form onSubmit={handleSubmitNovaSolicitacao}>
                  <h3 className={styles.sectionTitle}>1. Motivo da Solicitação</h3>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Explique detalhadamente a não conformidade encontrada:</label>
                    <textarea
                      className={styles.textarea}
                      rows={3}
                      required
                      placeholder="Descreva o motivo desta solicitação..."
                      value={formSugerir.motivo}
                      onChange={e => setFormSugerir({ ...formSugerir, motivo: e.target.value })}
                    />
                  </div>

                  <h3 className={styles.sectionTitle}>2. Sugestão de Preenchimento</h3>

                  <div className={styles.rowSplit}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Novo Título Sugerido:</label>
                      <input
                        type="text"
                        className={styles.input}
                        required
                        value={formSugerir.titulo}
                        onChange={e => setFormSugerir({ ...formSugerir, titulo: e.target.value })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Novo Código Sugerido:</label>
                      <input
                        type="text"
                        className={styles.input}
                        required
                        value={formSugerir.codigo}
                        onChange={e => setFormSugerir({ ...formSugerir, codigo: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className={styles.rowSplit}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Novo Órgão Sugerido:</label>
                      <select
                        className={styles.select}
                        value={formSugerir.idOrgao}
                        onChange={e => setFormSugerir({ ...formSugerir, idOrgao: e.target.value })}
                      >
                        <option value="">Manter o mesmo</option>
                        {orgaos.map(org => <option key={org.id} value={org.id}>{org.nome}</option>)}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Revisão Atual Sugerida:</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={formSugerir.revisaoAtual}
                        onChange={e => setFormSugerir({ ...formSugerir, revisaoAtual: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className={styles.rowSplit}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Revisão Obsoleta Sugerida:</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={formSugerir.revisaoObsoleta}
                        onChange={e => setFormSugerir({ ...formSugerir, revisaoObsoleta: e.target.value })}
                      />
                    </div>
                    <div className={styles.formGroup} />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Nova Descrição/Escopo:</label>
                    <textarea
                      className={styles.textarea}
                      rows={3}
                      value={formSugerir.escopo}
                      onChange={e => setFormSugerir({ ...formSugerir, escopo: e.target.value })}
                    />
                  </div>

                  <div className={styles.modalActions}>
                    <button type="button" className={styles.btnSecondary} onClick={fecharTudo}>Cancelar</button>
                    <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
                      {isSubmitting ? "A enviar..." : "Enviar Solicitação"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {isDetalhesOpen && selectedProposta && !isReprovarOpen && !isEditarNormaOpen && (
        <div className={styles.modalOverlay} onClick={fecharTudo}>
          <div className={styles.modalContentLarge} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Detalhes da Solicitação</h2>
              <button className={styles.closeBtn} onClick={fecharTudo}><X size={24} /></button>
            </div>

            <div className={styles.modalBody}>
              <div style={{ marginBottom: "20px" }}>
                <strong>Status Atual: </strong>
                <span className={`${styles.badge} ${getStatusInfo(selectedProposta.status_proposta).css}`}>
                  {getStatusInfo(selectedProposta.status_proposta).label}
                </span>
              </div>

              {selectedProposta.motivo_solicitacao && (
                <div style={{ backgroundColor: "#f9f9f9", padding: "16px", borderRadius: "8px", marginBottom: "20px", borderLeft: "3px solid #7A2E44" }}>
                  <strong style={{ color: "#7A2E44" }}>Motivo da Solicitação:</strong>
                  <p style={{ marginTop: "8px", fontSize: "14px", color: "#444" }}>{selectedProposta.motivo_solicitacao}</p>
                </div>
              )}

              <div className={styles.comparacaoGrid}>
                <div>
                  <h3 style={{ color: "#888", borderBottom: "1px solid #ddd", paddingBottom: "8px", marginBottom: "12px" }}>Norma Atual</h3>
                  <p><strong>Código:</strong> {selectedProposta.tb_normas?.codigo_norma}</p>
                  <p><strong>Título:</strong> {selectedProposta.tb_normas?.titulo_norma}</p>
                  <p><strong>Órgão:</strong> {getNomePorId(orgaos, selectedProposta.tb_normas?.id_orgao)}</p>
                  <p><strong>Revisão Atual:</strong> {selectedProposta.tb_normas?.revisao_norma_atual || "—"}</p>
                  <p><strong>Revisão Obsoleta:</strong> {selectedProposta.tb_normas?.revisao_norma_obsoleta || "—"}</p>
                  <p style={{ marginTop: "8px" }}><strong>Escopo:</strong> {selectedProposta.tb_normas?.escopo_norma}</p>
                </div>

                <div>
                  <h3 style={{ color: "#7A2E44", borderBottom: "1px solid #ddd", paddingBottom: "8px", marginBottom: "12px" }}>Sugestão do Consultor</h3>
                  <p><strong>Código:</strong> {selectedProposta.novo_codigo_norma}</p>
                  <p><strong>Título:</strong> {selectedProposta.novo_titulo_norma}</p>
                  <p><strong>Órgão:</strong> {getNomePorId(orgaos, selectedProposta.novo_id_orgao)}</p>
                  <p><strong>Revisão Atual:</strong> {selectedProposta.nova_revisao_atual || "—"}</p>
                  <p><strong>Revisão Obsoleta:</strong> {selectedProposta.nova_revisao_obsoleta || "—"}</p>
                  <p style={{ marginTop: "8px" }}><strong>Escopo:</strong> {selectedProposta.nova_descricao_norma}</p>
                </div>
              </div>

              {selectedProposta.observacoes_revisor && (
                <div style={{ backgroundColor: "#FFF3E0", padding: "16px", borderRadius: "8px", marginTop: "16px" }}>
                  <strong>Justificativa/Observação do Revisor:</strong>
                  <p style={{ marginTop: "8px" }}>{selectedProposta.observacoes_revisor}</p>
                </div>
              )}

              {(userRole === "ADMIN" || userRole === "REVISOR") && selectedProposta.status_proposta < 3 && (
                <div className={styles.modalActions}>
                  {selectedProposta.status_proposta === 1 && (
                    <button className={styles.btnSecondary} onClick={() => handleAlterarStatus(2)} disabled={isSubmitting}>
                      <Clock size={18} style={{ marginRight: "6px", verticalAlign: "middle" }} /> Iniciar Análise
                    </button>
                  )}
                  <button className={styles.btnDanger} onClick={() => setIsReprovarOpen(true)} disabled={isSubmitting}>
                    <XCircle size={18} style={{ marginRight: "6px", verticalAlign: "middle" }} /> Reprovar
                  </button>
                  <button className={styles.btnSuccess} onClick={() => setIsEditarNormaOpen(true)} disabled={isSubmitting}>
                    <Edit3 size={18} style={{ marginRight: "6px", verticalAlign: "middle" }} /> Editar Norma & Concluir
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isReprovarOpen && selectedProposta && (
        <div className={styles.modalOverlay} onClick={() => setIsReprovarOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Reprovar Solicitação</h2>
              <button className={styles.closeBtn} onClick={() => setIsReprovarOpen(false)}><X size={24} /></button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ marginBottom: "16px" }}>Por favor, insira a justificativa para a reprovação. O consultor terá acesso a esta mensagem.</p>
              <textarea
                className={styles.textarea}
                rows={5}
                placeholder="Motivo da reprovação..."
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
              />
              <div className={styles.modalActions}>
                <button className={styles.btnSecondary} onClick={() => setIsReprovarOpen(false)} disabled={isSubmitting}>Cancelar</button>
                <button
                  className={styles.btnDanger}
                  disabled={!justificativa.trim() || isSubmitting}
                  onClick={() => handleAlterarStatus(4, justificativa)}
                >
                  {isSubmitting ? "A reprovar..." : "Confirmar Reprovação"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditarNormaOpen && selectedProposta && (
        <div className={styles.modalOverlay} onClick={() => setIsEditarNormaOpen(false)}>
          <div className={styles.modalContentLarge} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Aplicar Alterações na Norma</h2>
              <button className={styles.closeBtn} onClick={() => setIsEditarNormaOpen(false)}><X size={24} /></button>
            </div>
            <div className={styles.modalBody}>
              {erroForm && <div className={styles.alertError}>{erroForm}</div>}
              <p style={{ marginBottom: "16px", fontSize: "14px", color: "#555" }}>
                Os campos abaixo foram preenchidos com a sugestão do consultor. Faça as revisões finais antes de salvar no banco de dados.
              </p>

              <form onSubmit={handleSalvarEdicaoNorma}>
                <div className={styles.rowSplit}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Título Definitivo:</label>
                    <input
                      type="text"
                      className={styles.input}
                      required
                      value={selectedProposta.novo_titulo_norma || ""}
                      onChange={e => setSelectedProposta({ ...selectedProposta, novo_titulo_norma: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Código Definitivo:</label>
                    <input
                      type="text"
                      className={styles.input}
                      required
                      value={selectedProposta.novo_codigo_norma || ""}
                      onChange={e => setSelectedProposta({ ...selectedProposta, novo_codigo_norma: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.rowSplit}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Órgão Definitivo:</label>
                    <select
                      className={styles.select}
                      value={selectedProposta.novo_id_orgao || ""}
                      onChange={e => setSelectedProposta({ ...selectedProposta, novo_id_orgao: parseInt(e.target.value) })}
                    >
                      <option value="">Nenhum</option>
                      {orgaos.map(org => <option key={org.id} value={org.id}>{org.nome}</option>)}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Categoria Definitiva:</label>
                    <select
                      className={styles.select}
                      value={editCategoria}
                      onChange={e => setEditCategoria(e.target.value)}
                    >
                      <option value="">Nenhuma</option>
                      {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>
                </div>

                <div className={styles.rowSplit}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Sub Categoria Definitiva:</label>
                    <div className={styles.inputIconWrapper}>
                      <select
                        className={styles.select}
                        disabled={!editCategoria}
                        value={editSubcategoria}
                        onChange={e => setEditSubcategoria(e.target.value)}
                      >
                        <option value="">Nenhuma</option>
                        {subcategoriasFiltradas.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                      </select>
                      {!editCategoria && <Lock size={16} className={styles.inputIcon} />}
                    </div>
                  </div>
                  <div className={styles.formGroup} />
                </div>

                <div className={styles.rowSplit}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Revisão Atual Definitiva:</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={selectedProposta.nova_revisao_atual || ""}
                      onChange={e => setSelectedProposta({ ...selectedProposta, nova_revisao_atual: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Revisão Obsoleta Definitiva:</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={selectedProposta.nova_revisao_obsoleta || ""}
                      onChange={e => setSelectedProposta({ ...selectedProposta, nova_revisao_obsoleta: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Escopo Definitivo:</label>
                  <textarea
                    className={styles.textarea}
                    rows={3}
                    value={selectedProposta.nova_descricao_norma || ""}
                    onChange={e => setSelectedProposta({ ...selectedProposta, nova_descricao_norma: e.target.value })}
                  />
                </div>

                <div className={styles.modalActions}>
                  <button type="button" className={styles.btnSecondary} onClick={() => setIsEditarNormaOpen(false)} disabled={isSubmitting}>Voltar</button>
                  <button type="submit" className={styles.btnSuccess} disabled={isSubmitting}>
                    <CheckCircle size={18} style={{ marginRight: "6px", verticalAlign: "middle" }} />
                    {isSubmitting ? "A salvar..." : "Salvar Norma & Concluir"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}