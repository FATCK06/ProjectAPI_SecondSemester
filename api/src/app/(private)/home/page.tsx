"use client";

import { useState, useEffect } from "react";
import { Eye, Star, Search, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
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
  status_norma: number;
  caminho_arquivo: string | null;
  id_orgao: number;
  tb_orgaos?: { nome_completo_orgao: string } | { nome_completo_orgao: string }[];
}

type SortField = "titulo_norma" | "status_norma" | "data_publicacao_norma";
type SortDir = "asc" | "desc";

const STATUS_MAP: Record<number, { label: string; className: string }> = {
  0: { label: "Pendente", className: "statusPendente" },
  1: { label: "Aprovado", className: "statusAprovado" },
  2: { label: "Reprovado", className: "statusReprovado" },
};

function getOrgaoNome(tb_orgaos: Norma["tb_orgaos"]): string {
  if (!tb_orgaos) return "—";
  if (Array.isArray(tb_orgaos)) return tb_orgaos[0]?.nome_completo_orgao ?? "—";
  return tb_orgaos.nome_completo_orgao ?? "—";
}

export default function HomePage() {
  const [normas, setNormas] = useState<Norma[]>([]);
  const [filtered, setFiltered] = useState<Norma[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [sortField, setSortField] = useState<SortField>("titulo_norma");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  useEffect(() => {
    async function fetchNormas() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("tb_normas")
        .select(`
          id_norma,
          codigo_norma,
          titulo_norma,
          escopo_norma,
          data_publicacao_norma,
          revisao_norma_atual,
          revisao_norma_obsoleta,
          status_norma,
          caminho_arquivo,
          id_orgao,
          tb_orgaos ( nome_completo_orgao )
        `)
        .order("id_norma", { ascending: false });

      if (!error && data) {
        setNormas(data as unknown as Norma[]);
        setFiltered(data as unknown as Norma[]);
      }
      setIsLoading(false);
    }
    fetchNormas();
  }, []);

  // Filtro de busca
  useEffect(() => {
    const q = search.toLowerCase();
    const result = normas.filter(
      (n) =>
        n.titulo_norma?.toLowerCase().includes(q) ||
        n.codigo_norma?.toLowerCase().includes(q) ||
        getOrgaoNome(n.tb_orgaos).toLowerCase().includes(q)
    );
    setFiltered(sortData(result, sortField, sortDir));
  }, [search, normas, sortField, sortDir]);

  function sortData(data: Norma[], field: SortField, dir: SortDir) {
    return [...data].sort((a, b) => {
      const aVal = a[field] ?? "";
      const bVal = b[field] ?? "";
      if (aVal < bVal) return dir === "asc" ? -1 : 1;
      if (aVal > bVal) return dir === "asc" ? 1 : -1;
      return 0;
    });
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function toggleFavorite(id: number) {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleVisualizar(norma: Norma) {
    if (!norma.caminho_arquivo) return;
    const { data } = supabase.storage
      .from("normas_pdfs")
      .getPublicUrl(norma.caminho_arquivo);
    window.open(data.publicUrl, "_blank");
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ChevronsUpDown size={14} className={styles.sortIcon} />;
    return sortDir === "asc"
      ? <ChevronUp size={14} className={`${styles.sortIcon} ${styles.sortActive}`} />
      : <ChevronDown size={14} className={`${styles.sortIcon} ${styles.sortActive}`} />;
  }

  const totalNormas = normas.length;
  const aprovadas = normas.filter((n) => n.status_norma === 1).length;
  const pendentes = normas.filter((n) => n.status_norma === 0).length;

  return (
    <div className={styles.container}>
      {/* Cabeçalho */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Normas Cadastradas</h1>
          <p className={styles.subtitle}>Visualize e gerencie todas as normas do sistema</p>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{totalNormas}</span>
          <span className={styles.statLabel}>Total de Normas</span>
        </div>
        <div className={`${styles.statCard} ${styles.statCardAprovado}`}>
          <span className={styles.statValue}>{aprovadas}</span>
          <span className={styles.statLabel}>Aprovadas</span>
        </div>
        <div className={`${styles.statCard} ${styles.statCardPendente}`}>
          <span className={styles.statValue}>{pendentes}</span>
          <span className={styles.statLabel}>Pendentes</span>
        </div>
      </div>

      {/* Barra de busca */}
      <div className={styles.searchWrapper}>
        <Search size={18} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Buscar por título, código ou órgão..."
          className={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabela */}
      <div className={styles.tableWrapper}>
        {isLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <span>Carregando normas...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Nenhuma norma encontrada.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th} style={{ width: 40 }}></th>
                <th className={styles.th}>Código</th>
                <th
                  className={`${styles.th} ${styles.sortable}`}
                  onClick={() => handleSort("titulo_norma")}
                >
                  Título da Norma <SortIcon field="titulo_norma" />
                </th>
                <th className={styles.th}>Órgão</th>
                <th className={styles.th}>Tipo de Arquivo</th>
                <th
                  className={`${styles.th} ${styles.sortable}`}
                  onClick={() => handleSort("data_publicacao_norma")}
                >
                  Data de Publicação <SortIcon field="data_publicacao_norma" />
                </th>
                <th
                  className={`${styles.th} ${styles.sortable}`}
                  onClick={() => handleSort("status_norma")}
                >
                  Status <SortIcon field="status_norma" />
                </th>
                <th className={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((norma) => {
                const status = STATUS_MAP[norma.status_norma] ?? { label: "—", className: "statusPendente" };
                const isFav = favorites.has(norma.id_norma);
                return (
                  <tr key={norma.id_norma} className={styles.tr}>
                    <td className={styles.td}>
                      <button
                        className={`${styles.favBtn} ${isFav ? styles.favActive : ""}`}
                        onClick={() => toggleFavorite(norma.id_norma)}
                        title="Favoritar"
                      >
                        <Star size={16} fill={isFav ? "#74213C" : "none"} />
                      </button>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.codigo}>{norma.codigo_norma}</span>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.tituloNorma}>{norma.titulo_norma}</span>
                    </td>
                    <td className={styles.td}>
                      {getOrgaoNome(norma.tb_orgaos)}
                    </td>
                    <td className={styles.td}>
                      <span className={styles.tipoBadge}>PDF</span>
                    </td>
                    <td className={styles.td}>
                      {norma.data_publicacao_norma
                        ? new Date(norma.data_publicacao_norma).toLocaleDateString("pt-BR")
                        : "—"}
                    </td>
                    <td className={styles.td}>
                      <span className={`${styles.statusBadge} ${styles[status.className]}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <button
                        className={styles.visualizarBtn}
                        onClick={() => handleVisualizar(norma)}
                        disabled={!norma.caminho_arquivo}
                        title={norma.caminho_arquivo ? "Visualizar PDF" : "Sem arquivo"}
                      >
                        <Eye size={16} />
                        Visualizar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className={styles.tableFooter}>
        Exibindo {filtered.length} de {totalNormas} norma{totalNormas !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
