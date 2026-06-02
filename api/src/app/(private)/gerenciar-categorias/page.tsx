"use client";

import { useState, useEffect } from "react";
import { Plus, Tag, Layers, Wrench, Trash2, Pencil, X, ChevronRight, Search } from "lucide-react";
import styles from "./gerenciar-categorias.module.css";
import { supabase } from "@/services/supabase";

interface Categoria {
  id_categoria: number;
  nome_categoria: string;
  descricao_categoria: string;
}

interface SubCategoria {
  id_subcategoria: number;
  id_categoria: number;
  nome_subcategoria: string;
  descricao_subcategoria: string;
}

interface Tipo {
  id_tipo: number;
  id_subcategoria: number;
  nome_tipo: string;
}

type Aba = "categorias" | "subcategorias" | "tipos";

const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function GerenciarCategorias() {
  const [abaAtiva, setAbaAtiva] = useState<Aba>("categorias");

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subCategorias, setSubCategorias] = useState<SubCategoria[]>([]);
  const [tipos, setTipos] = useState<Tipo[]>([]);

  const [editandoCategoria, setEditandoCategoria] = useState<Categoria | null>(null);
  const [nomeCategoria, setNomeCategoria] = useState("");
  const [descricaoCategoria, setDescricaoCategoria] = useState("");

  const [editandoSub, setEditandoSub] = useState<SubCategoria | null>(null);
  const [idCategoriaParaSub, setIdCategoriaParaSub] = useState("");
  const [nomeSubCategoria, setNomeSubCategoria] = useState("");
  const [descricaoSubCategoria, setDescricaoSubCategoria] = useState("");

  const [editandoTipo, setEditandoTipo] = useState<Tipo | null>(null);
  const [idSubCategoriaParaTipo, setIdSubCategoriaParaTipo] = useState("");
  const [nomeTipo, setNomeTipo] = useState("");

  const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });
  const [isLoading, setIsLoading] = useState(false);

  const [filtroCategorias, setFiltroCategorias] = useState("");
  const [filtroSubs, setFiltroSubs] = useState("");
  const [filtroTipos, setFiltroTipos] = useState("");

  const [catAtivaParaSubs, setCatAtivaParaSubs] = useState<number | null>(null);
  const [catAtivaParaTipos, setCatAtivaParaTipos] = useState<number | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    const [{ data: dadosCat }, { data: dadosSub }, { data: dadosTipo }] = await Promise.all([
      supabase.from("tb_categorias").select("*").order("nome_categoria"),
      supabase.from("tb_subcategoria").select("*").order("nome_subcategoria"),
      supabase.from("tb_tipo").select("*").order("nome_tipo"),
    ]);
    if (dadosCat) setCategorias(dadosCat);
    if (dadosSub) setSubCategorias(dadosSub);
    if (dadosTipo) setTipos(dadosTipo);
  }

  function exibirMensagem(tipo: string, texto: string) {
    setMensagem({ tipo, texto });
    setTimeout(() => setMensagem({ tipo: "", texto: "" }), 4000);
  }

  function iniciarEdicaoCategoria(cat: Categoria) {
    setEditandoCategoria(cat);
    setNomeCategoria(cat.nome_categoria);
    setDescricaoCategoria(cat.descricao_categoria ?? "");
  }

  function cancelarEdicaoCategoria() {
    setEditandoCategoria(null);
    setNomeCategoria("");
    setDescricaoCategoria("");
  }

  async function salvarCategoria() {
    if (!nomeCategoria.trim()) return;
    setIsLoading(true);

    if (editandoCategoria) {
      const { error } = await supabase
        .from("tb_categorias")
        .update({
          nome_categoria: nomeCategoria.trim(),
          descricao_categoria: descricaoCategoria.trim() || null,
        })
        .eq("id_categoria", editandoCategoria.id_categoria);
      setIsLoading(false);
      if (error) {
        exibirMensagem("erro", "Erro ao atualizar categoria.");
      } else {
        exibirMensagem("sucesso", "Categoria atualizada com sucesso.");
        cancelarEdicaoCategoria();
        carregarDados();
      }
    } else {
      const { error } = await supabase.from("tb_categorias").insert({
        nome_categoria: nomeCategoria.trim(),
        descricao_categoria: descricaoCategoria.trim() || null,
      });
      setIsLoading(false);
      if (error) {
        exibirMensagem("erro", "Erro ao salvar categoria.");
      } else {
        exibirMensagem("sucesso", "Categoria cadastrada com sucesso.");
        setNomeCategoria("");
        setDescricaoCategoria("");
        carregarDados();
      }
    }
  }

  async function excluirCategoria(id: number) {
    const { error } = await supabase.from("tb_categorias").delete().eq("id_categoria", id);
    if (error) {
      exibirMensagem("erro", "Nao foi possivel excluir. Verifique se ha sub-categorias vinculadas.");
    } else {
      carregarDados();
    }
  }

  function iniciarEdicaoSub(sub: SubCategoria) {
    setEditandoSub(sub);
    setIdCategoriaParaSub(String(sub.id_categoria));
    setNomeSubCategoria(sub.nome_subcategoria);
    setDescricaoSubCategoria(sub.descricao_subcategoria ?? "");
  }

  function cancelarEdicaoSub() {
    setEditandoSub(null);
    setIdCategoriaParaSub("");
    setNomeSubCategoria("");
    setDescricaoSubCategoria("");
  }

  async function salvarSubCategoria() {
    if (!nomeSubCategoria.trim() || !idCategoriaParaSub) return;
    setIsLoading(true);

    if (editandoSub) {
      const { error } = await supabase
        .from("tb_subcategoria")
        .update({
          id_categoria: Number(idCategoriaParaSub),
          nome_subcategoria: nomeSubCategoria.trim(),
          descricao_subcategoria: descricaoSubCategoria.trim() || null,
        })
        .eq("id_subcategoria", editandoSub.id_subcategoria);
      setIsLoading(false);
      if (error) {
        exibirMensagem("erro", "Erro ao atualizar sub-categoria.");
      } else {
        exibirMensagem("sucesso", "Sub-categoria atualizada com sucesso.");
        cancelarEdicaoSub();
        carregarDados();
      }
    } else {
      const { error } = await supabase.from("tb_subcategoria").insert({
        id_categoria: Number(idCategoriaParaSub),
        nome_subcategoria: nomeSubCategoria.trim(),
        descricao_subcategoria: descricaoSubCategoria.trim() || null,
      });
      setIsLoading(false);
      if (error) {
        exibirMensagem("erro", "Erro ao salvar sub-categoria.");
      } else {
        exibirMensagem("sucesso", "Sub-categoria cadastrada com sucesso.");
        cancelarEdicaoSub();
        carregarDados();
      }
    }
  }

  async function excluirSubCategoria(id: number) {
    const { error } = await supabase.from("tb_subcategoria").delete().eq("id_subcategoria", id);
    if (error) {
      exibirMensagem("erro", "Nao foi possivel excluir. Verifique se ha tipos vinculados.");
    } else {
      carregarDados();
    }
  }

  function iniciarEdicaoTipo(tipo: Tipo) {
    setEditandoTipo(tipo);
    setIdSubCategoriaParaTipo(String(tipo.id_subcategoria));
    setNomeTipo(tipo.nome_tipo);
  }

  function cancelarEdicaoTipo() {
    setEditandoTipo(null);
    setIdSubCategoriaParaTipo("");
    setNomeTipo("");
  }

  async function salvarTipo() {
    if (!nomeTipo.trim() || !idSubCategoriaParaTipo) return;
    setIsLoading(true);

    if (editandoTipo) {
      const { error } = await supabase
        .from("tb_tipo")
        .update({
          id_subcategoria: Number(idSubCategoriaParaTipo),
          nome_tipo: nomeTipo.trim(),
        })
        .eq("id_tipo", editandoTipo.id_tipo);
      setIsLoading(false);
      if (error) {
        exibirMensagem("erro", "Erro ao atualizar tipo.");
      } else {
        exibirMensagem("sucesso", "Tipo atualizado com sucesso.");
        cancelarEdicaoTipo();
        carregarDados();
      }
    } else {
      const { error } = await supabase.from("tb_tipo").insert({
        id_subcategoria: Number(idSubCategoriaParaTipo),
        nome_tipo: nomeTipo.trim(),
      });
      setIsLoading(false);
      if (error) {
        exibirMensagem("erro", "Erro ao salvar tipo.");
      } else {
        exibirMensagem("sucesso", "Tipo cadastrado com sucesso.");
        cancelarEdicaoTipo();
        carregarDados();
      }
    }
  }

  async function excluirTipo(id: number) {
    const { error } = await supabase.from("tb_tipo").delete().eq("id_tipo", id);
    if (error) {
      exibirMensagem("erro", "Erro ao excluir tipo.");
    } else {
      carregarDados();
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Gerenciar Categorias</h1>

      {mensagem.texto && (
        <div className={`${styles.alert} ${mensagem.tipo === "sucesso" ? styles.alertSuccess : styles.alertError}`}>
          {mensagem.texto}
        </div>
      )}

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${abaAtiva === "categorias" ? styles.tabActive : ""}`}
          onClick={() => setAbaAtiva("categorias")}
        >
          <Tag size={15} />
          Categorias
        </button>
        <button
          className={`${styles.tab} ${abaAtiva === "subcategorias" ? styles.tabActive : ""}`}
          onClick={() => setAbaAtiva("subcategorias")}
        >
          <Layers size={15} />
          Sub-Categorias
        </button>
        <button
          className={`${styles.tab} ${abaAtiva === "tipos" ? styles.tabActive : ""}`}
          onClick={() => setAbaAtiva("tipos")}
        >
          <Wrench size={15} />
          Tipos
        </button>
      </div>

      {abaAtiva === "categorias" && (
        <div className={styles.grid}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              {editandoCategoria ? "Editar Categoria" : "Nova Categoria"}
            </h2>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Nome <span className={styles.required}>*</span>
              </label>
              <input
                className={styles.input}
                type="text"
                value={nomeCategoria}
                onChange={(e) => setNomeCategoria(e.target.value)}
                placeholder="Ex: Estrutural"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Descricao</label>
              <textarea
                className={styles.textarea}
                value={descricaoCategoria}
                onChange={(e) => setDescricaoCategoria(e.target.value)}
                placeholder="Descricao opcional"
              />
            </div>
            <div className={styles.formActions}>
              {editandoCategoria && (
                <button className={styles.cancelBtn} onClick={cancelarEdicaoCategoria}>
                  <X size={16} />
                  Cancelar
                </button>
              )}
              <button
                className={styles.submitBtn}
                onClick={salvarCategoria}
                disabled={!nomeCategoria.trim() || isLoading}
              >
                <Plus size={16} />
                {isLoading ? "Salvando..." : editandoCategoria ? "Salvar alteracoes" : "Adicionar"}
              </button>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.listHeader}>
              <h2 className={styles.cardTitle}>Cadastradas ({categorias.length})</h2>
              <div className={styles.searchWrapper}>
                <Search size={14} className={styles.searchIcon} />
                <input
                  className={styles.searchInput}
                  type="text"
                  value={filtroCategorias}
                  onChange={(e) => setFiltroCategorias(e.target.value)}
                  placeholder="Filtrar..."
                />
              </div>
            </div>
            {categorias.length === 0 ? (
              <p className={styles.emptyText}>Nenhuma categoria cadastrada.</p>
            ) : (
              <>
                {(() => {
                  const termo = normalizar(filtroCategorias);
                  const filtradas = categorias.filter((cat) =>
                    normalizar(cat.nome_categoria).includes(termo) ||
                    normalizar(cat.descricao_categoria ?? "").includes(termo)
                  );
                  return filtradas.length === 0 ? (
                    <p className={styles.emptyText}>Nenhum resultado para "{filtroCategorias}".</p>
                  ) : (
                    <ul className={styles.list}>
                      {filtradas.map((cat) => {
                        const totalSubs = subCategorias.filter((s) => s.id_categoria === cat.id_categoria).length;
                        const emEdicao = editandoCategoria?.id_categoria === cat.id_categoria;
                        return (
                          <li key={cat.id_categoria} className={`${styles.listItem} ${emEdicao ? styles.listItemEditing : ""}`}>
                            <div className={styles.itemBody}>
                              <span className={styles.itemName}>{cat.nome_categoria}</span>
                              {cat.descricao_categoria && (
                                <span className={styles.itemDesc}>{cat.descricao_categoria}</span>
                              )}
                              <span className={styles.itemCount}>
                                {totalSubs} {totalSubs === 1 ? "sub-categoria" : "sub-categorias"}
                              </span>
                            </div>
                            <div className={styles.itemActions}>
                              <button className={styles.editBtn} onClick={() => iniciarEdicaoCategoria(cat)} title="Editar">
                                <Pencil size={15} />
                              </button>
                              <button className={styles.deleteBtn} onClick={() => excluirCategoria(cat.id_categoria)} title="Excluir">
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      )}

      {abaAtiva === "subcategorias" && (
        <div className={styles.grid}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              {editandoSub ? "Editar Sub-Categoria" : "Nova Sub-Categoria"}
            </h2>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Categoria <span className={styles.required}>*</span>
              </label>
              <select
                className={styles.select}
                value={idCategoriaParaSub}
                onChange={(e) => setIdCategoriaParaSub(e.target.value)}
              >
                <option value="">Selecione uma categoria...</option>
                {categorias.map((cat) => (
                  <option key={cat.id_categoria} value={cat.id_categoria}>
                    {cat.nome_categoria}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Nome <span className={styles.required}>*</span>
              </label>
              <input
                className={styles.input}
                type="text"
                value={nomeSubCategoria}
                onChange={(e) => setNomeSubCategoria(e.target.value)}
                placeholder="Ex: Fundacoes"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Descricao</label>
              <textarea
                className={styles.textarea}
                value={descricaoSubCategoria}
                onChange={(e) => setDescricaoSubCategoria(e.target.value)}
                placeholder="Descricao opcional"
              />
            </div>
            <div className={styles.formActions}>
              {editandoSub && (
                <button className={styles.cancelBtn} onClick={cancelarEdicaoSub}>
                  <X size={16} />
                  Cancelar
                </button>
              )}
              <button
                className={styles.submitBtn}
                onClick={salvarSubCategoria}
                disabled={!nomeSubCategoria.trim() || !idCategoriaParaSub || isLoading}
              >
                <Plus size={16} />
                {isLoading ? "Salvando..." : editandoSub ? "Salvar alteracoes" : "Adicionar"}
              </button>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.listHeader}>
              <h2 className={styles.cardTitle}>Cadastradas ({subCategorias.length})</h2>
              <div className={styles.searchWrapper}>
                <Search size={14} className={styles.searchIcon} />
                <input
                  className={styles.searchInput}
                  type="text"
                  value={filtroSubs}
                  onChange={(e) => setFiltroSubs(e.target.value)}
                  placeholder="Filtrar por nome..."
                />
              </div>
            </div>

            {categorias.length > 0 && (
              <div className={styles.pillRow}>
                <button
                  className={`${styles.pill} ${catAtivaParaSubs === null ? styles.pillActive : ""}`}
                  onClick={() => setCatAtivaParaSubs(null)}
                >
                  Todas
                </button>
                {categorias
                  .filter((cat) => subCategorias.some((s) => s.id_categoria === cat.id_categoria))
                  .map((cat) => (
                    <button
                      key={cat.id_categoria}
                      className={`${styles.pill} ${catAtivaParaSubs === cat.id_categoria ? styles.pillActive : ""}`}
                      onClick={() => setCatAtivaParaSubs(cat.id_categoria)}
                    >
                      {cat.nome_categoria}
                    </button>
                  ))}
              </div>
            )}

            {subCategorias.length === 0 ? (
              <p className={styles.emptyText}>Nenhuma sub-categoria cadastrada.</p>
            ) : (
              <>
                {(() => {
                  const termo = normalizar(filtroSubs);
                  const filtradas = subCategorias.filter((sub) => {
                    const cat = categorias.find((c) => c.id_categoria === sub.id_categoria);
                    const passaPill = catAtivaParaSubs === null || sub.id_categoria === catAtivaParaSubs;
                    const passaTexto =
                      normalizar(sub.nome_subcategoria).includes(termo) ||
                      normalizar(sub.descricao_subcategoria ?? "").includes(termo) ||
                      normalizar(cat?.nome_categoria ?? "").includes(termo);
                    return passaPill && passaTexto;
                  });
                  return filtradas.length === 0 ? (
                    <p className={styles.emptyText}>Nenhum resultado para "{filtroSubs}".</p>
                  ) : (
                    <ul className={styles.list}>
                      {filtradas.map((sub) => {
                        const cat = categorias.find((c) => c.id_categoria === sub.id_categoria);
                        const totalTipos = tipos.filter((t) => t.id_subcategoria === sub.id_subcategoria).length;
                        const emEdicao = editandoSub?.id_subcategoria === sub.id_subcategoria;
                        return (
                          <li key={sub.id_subcategoria} className={`${styles.listItem} ${emEdicao ? styles.listItemEditing : ""}`}>
                            <div className={styles.itemBody}>
                              <span className={styles.itemName}>{sub.nome_subcategoria}</span>
                              {cat && (
                                <span className={styles.itemBreadcrumb}>
                                  <Tag size={11} />
                                  {cat.nome_categoria}
                                </span>
                              )}
                              {sub.descricao_subcategoria && (
                                <span className={styles.itemDesc}>{sub.descricao_subcategoria}</span>
                              )}
                              <span className={styles.itemCount}>
                                {totalTipos} {totalTipos === 1 ? "tipo" : "tipos"}
                              </span>
                            </div>
                            <div className={styles.itemActions}>
                              <button className={styles.editBtn} onClick={() => iniciarEdicaoSub(sub)} title="Editar">
                                <Pencil size={15} />
                              </button>
                              <button className={styles.deleteBtn} onClick={() => excluirSubCategoria(sub.id_subcategoria)} title="Excluir">
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      )}

      {abaAtiva === "tipos" && (
        <div className={styles.grid}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              {editandoTipo ? "Editar Tipo" : "Novo Tipo"}
            </h2>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Sub-Categoria <span className={styles.required}>*</span>
              </label>
              <select
                className={styles.select}
                value={idSubCategoriaParaTipo}
                onChange={(e) => setIdSubCategoriaParaTipo(e.target.value)}
              >
                <option value="">Selecione uma sub-categoria...</option>
                {subCategorias.map((sub) => {
                  const cat = categorias.find((c) => c.id_categoria === sub.id_categoria);
                  return (
                    <option key={sub.id_subcategoria} value={sub.id_subcategoria}>
                      {cat ? `${cat.nome_categoria} › ${sub.nome_subcategoria}` : sub.nome_subcategoria}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Nome <span className={styles.required}>*</span>
              </label>
              <input
                className={styles.input}
                type="text"
                value={nomeTipo}
                onChange={(e) => setNomeTipo(e.target.value)}
                placeholder="Ex: NBR"
              />
            </div>
            <div className={styles.formActions}>
              {editandoTipo && (
                <button className={styles.cancelBtn} onClick={cancelarEdicaoTipo}>
                  <X size={16} />
                  Cancelar
                </button>
              )}
              <button
                className={styles.submitBtn}
                onClick={salvarTipo}
                disabled={!nomeTipo.trim() || !idSubCategoriaParaTipo || isLoading}
              >
                <Plus size={16} />
                {isLoading ? "Salvando..." : editandoTipo ? "Salvar alteracoes" : "Adicionar"}
              </button>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.listHeader}>
              <h2 className={styles.cardTitle}>Cadastrados ({tipos.length})</h2>
              <div className={styles.searchWrapper}>
                <Search size={14} className={styles.searchIcon} />
                <input
                  className={styles.searchInput}
                  type="text"
                  value={filtroTipos}
                  onChange={(e) => setFiltroTipos(e.target.value)}
                  placeholder="Filtrar por nome..."
                />
              </div>
            </div>

            {categorias.length > 0 && (
              <div className={styles.pillRow}>
                <button
                  className={`${styles.pill} ${catAtivaParaTipos === null ? styles.pillActive : ""}`}
                  onClick={() => setCatAtivaParaTipos(null)}
                >
                  Todas
                </button>
                {categorias
                  .filter((cat) =>
                    tipos.some((t) => {
                      const sub = subCategorias.find((s) => s.id_subcategoria === t.id_subcategoria);
                      return sub?.id_categoria === cat.id_categoria;
                    })
                  )
                  .map((cat) => (
                    <button
                      key={cat.id_categoria}
                      className={`${styles.pill} ${catAtivaParaTipos === cat.id_categoria ? styles.pillActive : ""}`}
                      onClick={() => setCatAtivaParaTipos(cat.id_categoria)}
                    >
                      {cat.nome_categoria}
                    </button>
                  ))}
              </div>
            )}

            {tipos.length === 0 ? (
              <p className={styles.emptyText}>Nenhum tipo cadastrado.</p>
            ) : (
              <>
                {(() => {
                  const termo = normalizar(filtroTipos);
                  const filtrados = tipos.filter((tipo) => {
                    const sub = subCategorias.find((s) => s.id_subcategoria === tipo.id_subcategoria);
                    const cat = sub ? categorias.find((c) => c.id_categoria === sub.id_categoria) : undefined;
                    const passaPill = catAtivaParaTipos === null || cat?.id_categoria === catAtivaParaTipos;
                    const passaTexto =
                      normalizar(tipo.nome_tipo).includes(termo) ||
                      normalizar(sub?.nome_subcategoria ?? "").includes(termo) ||
                      normalizar(cat?.nome_categoria ?? "").includes(termo);
                    return passaPill && passaTexto;
                  });
                  return filtrados.length === 0 ? (
                    <p className={styles.emptyText}>Nenhum resultado para "{filtroTipos}".</p>
                  ) : (
                    <ul className={styles.list}>
                      {filtrados.map((tipo) => {
                        const sub = subCategorias.find((s) => s.id_subcategoria === tipo.id_subcategoria);
                        const cat = sub ? categorias.find((c) => c.id_categoria === sub.id_categoria) : undefined;
                        const emEdicao = editandoTipo?.id_tipo === tipo.id_tipo;
                        return (
                          <li key={tipo.id_tipo} className={`${styles.listItem} ${emEdicao ? styles.listItemEditing : ""}`}>
                            <div className={styles.itemBody}>
                              <span className={styles.itemName}>{tipo.nome_tipo}</span>
                              {(cat || sub) && (
                                <span className={styles.itemBreadcrumb}>
                                  {cat && (
                                    <>
                                      <Tag size={11} />
                                      {cat.nome_categoria}
                                    </>
                                  )}
                                  {cat && sub && <ChevronRight size={11} />}
                                  {sub && <span>{sub.nome_subcategoria}</span>}
                                </span>
                              )}
                            </div>
                            <div className={styles.itemActions}>
                              <button className={styles.editBtn} onClick={() => iniciarEdicaoTipo(tipo)} title="Editar">
                                <Pencil size={15} />
                              </button>
                              <button className={styles.deleteBtn} onClick={() => excluirTipo(tipo.id_tipo)} title="Excluir">
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
