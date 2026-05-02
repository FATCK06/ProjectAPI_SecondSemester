"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { Plus, UploadCloud, FileText, Trash2, Lock, X } from "lucide-react";
import styles from "./cadastrar.module.css";
import { supabase } from "@/services/supabase";

interface Orgao { id_orgao: number; nome_completo_orgao: string; }
interface Categoria { id_categoria: number; nome_categoria: string; }
interface SubCategoria { id_subcategoria: number; nome_subcategoria: string; }
interface Tipo { id_tipo: number; nome_tipo: string; }
interface NormaSugestao { id_norma: number; codigo_norma: string; titulo_norma: string; }

const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function CadastrarNorma() {
  // ==========================================
  // 1. ESTADOS DO FORMULÁRIO (BD)
  // ==========================================
  const [codigo, setCodigo] = useState("");
  const [titulo, setTitulo] = useState("");
  const [escopo, setEscopo] = useState("");
  const [dataCriacao, setDataCriacao] = useState("");
  const [revisaoAtual, setRevisaoAtual] = useState("");
  const [revisaoObsoleta, setRevisaoObsoleta] = useState("");
  const [palavrasChave, setPalavrasChave] = useState("");

  // Normas Correlacionadas (autocomplete + chips)
  const [listaNormasSugestoes, setListaNormasSugestoes] = useState<NormaSugestao[]>([]);
  const [idsCorrelacionadas, setIdsCorrelacionadas] = useState<number[]>([]);
  const [inputCorrelacao, setInputCorrelacao] = useState("");
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  
  // Chaves estrangeiras selecionadas
  const [idOrgaoSelecionado, setIdOrgaoSelecionado] = useState<string>("");
  const [idCategoriaSelecionada, setIdCategoriaSelecionada] = useState<string>("");
  const [idSubCategoriaSelecionada, setIdSubCategoriaSelecionada] = useState<string>("");
  const [idTipoSelecionado, setIdTipoSelecionado] = useState<string>(""); 

  // Listas populadas pelo banco de dados
  const [orgaos, setOrgaos] = useState<Orgao[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subCategorias, setSubCategorias] = useState<SubCategoria[]>([]);
  const [tipos, setTipos] = useState<Tipo[]>([]); 

  // Estados de loading e erro para feedback visual
  const [isLoading, setIsLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });

  // ==========================================
  // 2. ESTADOS DE ARQUIVOS (DRAG & DROP)
  // ==========================================
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ==========================================
  // 3. BUSCA DE DADOS INICIAIS (USE EFFECT)
  // ==========================================
  useEffect(() => {
    async function fetchInitialData() {
      const { data: dadosOrgaos } = await supabase.from('tb_orgaos').select('id_orgao, nome_completo_orgao');
      if (dadosOrgaos) setOrgaos(dadosOrgaos);

      const { data: dadosCategorias } = await supabase.from('tb_categorias').select('id_categoria, nome_categoria');
      if (dadosCategorias) setCategorias(dadosCategorias);

      const { data: dadosNormas } = await supabase
        .from('tb_normas')
        .select('id_norma, codigo_norma, titulo_norma')
        .order('codigo_norma', { ascending: true });
      if (dadosNormas) setListaNormasSugestoes(dadosNormas);
    }
    fetchInitialData();
  }, []);

  // Fecha sugestões ao clicar fora
  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target as Node)) {
        setMostrarSugestoes(false);
      }
    }
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  const sugestoesFiltradas = listaNormasSugestoes
    .filter((n) => !idsCorrelacionadas.includes(n.id_norma))
    .filter((n) => {
      if (!inputCorrelacao.trim()) return true;
      const termo = normalizar(inputCorrelacao);
      return normalizar(n.codigo_norma).includes(termo) || normalizar(n.titulo_norma).includes(termo);
    })
    .slice(0, 8);

  const adicionarCorrelacao = (id: number) => {
    setIdsCorrelacionadas((prev) => [...prev, id]);
    setInputCorrelacao("");
    setMostrarSugestoes(false);
  };

  const removerCorrelacao = (id: number) => {
    setIdsCorrelacionadas((prev) => prev.filter((x) => x !== id));
  };

  useEffect(() => {
    async function fetchSubCategorias() {
      if (!idCategoriaSelecionada) {
        setSubCategorias([]);
        setIdSubCategoriaSelecionada("");
        setTipos([]);
        setIdTipoSelecionado("");
        return;
      }
      const { data } = await supabase
        .from('tb_subcategoria')
        .select('id_subcategoria, nome_subcategoria')
        .eq('id_categoria', idCategoriaSelecionada);
      
      if (data) setSubCategorias(data);
      setTipos([]);
      setIdTipoSelecionado("");
    }
    fetchSubCategorias();
  }, [idCategoriaSelecionada]);

  useEffect(() => {
    async function fetchTipos() {
      if (!idSubCategoriaSelecionada) {
        setTipos([]);
        setIdTipoSelecionado("");
        return;
      }
      const { data } = await supabase
        .from('tb_tipo')
        .select('id_tipo, nome_tipo')
        .eq('id_subcategoria', idSubCategoriaSelecionada);
      
      if (data) setTipos(data);
    }
    fetchTipos();
  }, [idSubCategoriaSelecionada]);

  // ==========================================
  // 4. FUNÇÕES DE ARQUIVOS
  // ==========================================
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const pdfFiles = droppedFiles.filter(file => file.type === "application/pdf");
      setFiles((prev) => [...prev, ...pdfFiles]);
    }
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const pdfFiles = selectedFiles.filter(file => file.type === "application/pdf");
      setFiles((prev) => [...prev, ...pdfFiles]);
    }
  };
  const removeFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // ==========================================
  // 5. ENVIO PARA O BANCO DE DADOS E STORAGE
  // ==========================================
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMensagem({ tipo: "", texto: "" });

    try {
      let filePath = null;

      // ==========================================
      // OPÇÃO A: UPLOAD DE 1 ÚNICO ARQUIVO
      // ==========================================
      if (files.length > 0) {
        const file = files[0]; 
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        // Faz o upload para o bucket 'normas_pdfs'
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('normas_pdfs')
          .upload(`pdf/${fileName}`, file);

        if (uploadError) {
          throw new Error(`Erro ao enviar o arquivo: ${uploadError.message}`);
        }
        
        // Guarda o caminho do arquivo gerado pelo Supabase
        filePath = uploadData.path; 
      }

      // 1. Inserir na tabela tb_normas
      const { data: normaData, error: normaError } = await supabase
        .from('tb_normas')
        .insert({
          codigo_norma: codigo,
          titulo_norma: titulo,
          escopo_norma: escopo,
          data_publicacao_norma: dataCriacao || null,
          revisao_norma_atual: revisaoAtual,
          revisao_norma_obsoleta: revisaoObsoleta,
          id_orgao: Number(idOrgaoSelecionado),
          status_norma: 0,
          caminho_arquivo: filePath, // Salvando o caminho do arquivo (Opção A)
          id_categoria: idCategoriaSelecionada ? parseInt(idCategoriaSelecionada) : null,
          id_subcategoria: idSubCategoriaSelecionada ? parseInt(idSubCategoriaSelecionada) : null,
          id_tipo: idTipoSelecionado ? parseInt(idTipoSelecionado) : null,
        })
        .select()
        .single(); 

      if (normaError) throw normaError;

      // Insere correlações (espelhadas: A↔B vira 2 linhas)
      if (normaData && idsCorrelacionadas.length > 0) {
        const linhasCorrelacao = idsCorrelacionadas.flatMap((idCorrel) => [
          { id_norma_origem: normaData.id_norma, id_norma_correlacionada: idCorrel },
          { id_norma_origem: idCorrel, id_norma_correlacionada: normaData.id_norma },
        ]);
        const { error: errCorrel } = await supabase
          .from('tb_normas_correlacionadas')
          .insert(linhasCorrelacao);
        if (errCorrel) console.error('Erro ao inserir correlações:', errCorrel);
      }

      // ==========================================
      // OPÇÃO B: MÚLTIPLOS ARQUIVOS (FUTURO)
      // ==========================================
      /*
      if (files.length > 0 && normaData) {
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('normas_pdfs')
            .upload(`pdf/${normaData.id_norma}/${fileName}`, file);
            
          if (!uploadError && uploadData) {
            // A coluna data_publicacao_arquivo não precisa ser enviada, o banco gera sozinha (DEFAULT CURRENT_TIMESTAMP)
            await supabase.from('tb_arquivos_normas').insert({
              id_norma: normaData.id_norma,
              caminho_arquivo: uploadData.path
            });
          }
        }
      }
      */
      
      setMensagem({ tipo: "sucesso", texto: "Norma e arquivo cadastrados com sucesso!" });
      
      // Limpar formulário
      setCodigo(""); setTitulo(""); setEscopo(""); setDataCriacao("");
      setRevisaoAtual(""); setRevisaoObsoleta("");
      setPalavrasChave("");
      setIdOrgaoSelecionado(""); setIdCategoriaSelecionada(""); setIdSubCategoriaSelecionada(""); setIdTipoSelecionado("");
      setFiles([]);
      setIdsCorrelacionadas([]); setInputCorrelacao("");

      // Recarrega a lista para incluir a norma recém-criada nas próximas sugestões
      const { data: dadosNormas } = await supabase
        .from('tb_normas')
        .select('id_norma, codigo_norma, titulo_norma')
        .order('codigo_norma', { ascending: true });
      if (dadosNormas) setListaNormasSugestoes(dadosNormas);

    } catch (error) {
      const e = error as Error;
      console.error("Erro ao inserir:", error);
      setMensagem({ tipo: "erro", texto: e.message || "Erro ao cadastrar norma." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Cadastro de Norma</h1>

      {mensagem.texto && (
        <div className={`${styles.alert} ${mensagem.tipo === 'erro' ? styles.alertError : styles.alertSuccess}`}>
          {mensagem.texto}
        </div>
      )}

      <form className={styles.grid} onSubmit={handleSubmit}>
        
        {/* COLUNA ESQUERDA: FORMULÁRIO TEXTUAL */}
        <div className={styles.leftColumn}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Código da Norma: <span className={styles.required}>*</span></label>
            <input type="text" className={styles.input} placeholder="Número da Norma: Ex. XXX-Y-ZZZ" required 
              value={codigo} onChange={(e) => setCodigo(e.target.value)} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Título da Norma: <span className={styles.required}>*</span></label>
            <input type="text" className={styles.input} placeholder="Insira um título" required
              value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Escopo da Norma:</label>
            <textarea className={styles.textarea} placeholder="Insira o escopo da norma" 
              value={escopo} onChange={(e) => setEscopo(e.target.value)} rows={5} />
          </div>

          <div className={styles.rowSplit}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Revisão Atual: <span className={styles.required}>*</span></label>
              <input type="text" className={styles.input} placeholder="Ex: E" required
                value={revisaoAtual} onChange={(e) => setRevisaoAtual(e.target.value)} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Revisão Obsoleta: <span className={styles.required}>*</span></label>
              <input type="text" className={styles.input} placeholder="Ex: D" required
                value={revisaoObsoleta} onChange={(e) => setRevisaoObsoleta(e.target.value)} />
            </div>
          </div>

          <div className={styles.rowSplit}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Data de publicação:</label>
              <input type="date" className={styles.input} 
                value={dataCriacao} onChange={(e) => setDataCriacao(e.target.value)} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Órgão: <span className={styles.required}>*</span></label>
              <select className={styles.select} required
                value={idOrgaoSelecionado} onChange={(e) => setIdOrgaoSelecionado(e.target.value)}>
                <option value="" disabled>Selecione a Norma/Órgão</option>
                {orgaos.map((orgao) => (
                  <option key={orgao.id_orgao} value={orgao.id_orgao}>
                    {orgao.nome_completo_orgao}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Normas Correlacionadas:</label>

            {idsCorrelacionadas.length > 0 && (
              <div className={styles.chipsContainer}>
                {idsCorrelacionadas.map((id) => {
                  const n = listaNormasSugestoes.find((x) => x.id_norma === id);
                  if (!n) return null;
                  return (
                    <div key={id} className={styles.chip}>
                      <span>{n.codigo_norma}</span>
                      <button
                        type="button"
                        className={styles.chipRemove}
                        onClick={() => removerCorrelacao(id)}
                        aria-label={`Remover ${n.codigo_norma}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className={styles.autocompleteWrapper} ref={autocompleteRef}>
              <input
                type="text"
                className={styles.input}
                placeholder="Digite código ou título da norma..."
                value={inputCorrelacao}
                onChange={(e) => { setInputCorrelacao(e.target.value); setMostrarSugestoes(true); }}
                onFocus={() => setMostrarSugestoes(true)}
              />

              {mostrarSugestoes && sugestoesFiltradas.length > 0 && (
                <ul className={styles.sugestoesList}>
                  {sugestoesFiltradas.map((s) => (
                    <li
                      key={s.id_norma}
                      className={styles.sugestaoItem}
                      onClick={() => adicionarCorrelacao(s.id_norma)}
                    >
                      <span className={styles.sugestaoCodigo}>{s.codigo_norma}</span>
                      <span className={styles.sugestaoTitulo}>{s.titulo_norma}</span>
                    </li>
                  ))}
                </ul>
              )}

              {mostrarSugestoes && inputCorrelacao && sugestoesFiltradas.length === 0 && (
                <div className={styles.sugestoesList}>
                  <div className={styles.sugestaoVazia}>Nenhuma norma encontrada</div>
                </div>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Palavra-chave:</label>
            <input type="text" className={styles.input} placeholder="Adicionar palavras-chave" 
              value={palavrasChave} onChange={(e) => setPalavrasChave(e.target.value)} />
          </div>
        </div>

        {/* COLUNA DIREITA: SELECTS E UPLOADS */}
        <div className={styles.rightColumn}>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Categoria</label>
            <select className={styles.select} 
              value={idCategoriaSelecionada} onChange={(e) => setIdCategoriaSelecionada(e.target.value)}>
              <option value="" disabled>Insira categoria</option>
              {categorias.map((cat) => (
                <option key={cat.id_categoria} value={cat.id_categoria}>
                  {cat.nome_categoria}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Sub Categoria</label>
            <div className={styles.inputIconWrapper}>
              <select className={styles.select} disabled={!idCategoriaSelecionada}
                value={idSubCategoriaSelecionada} onChange={(e) => setIdSubCategoriaSelecionada(e.target.value)}>
                <option value="" disabled>Insira subcategoria</option>
                {subCategorias.map((sub) => (
                  <option key={sub.id_subcategoria} value={sub.id_subcategoria}>
                    {sub.nome_subcategoria}
                  </option>
                ))}
              </select>
              {!idCategoriaSelecionada && <Lock size={18} className={styles.inputIcon} />}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Tipo:</label>
            <div className={styles.inputIconWrapper}>
              <select className={styles.select} disabled={!idSubCategoriaSelecionada || tipos.length === 0}
                value={idTipoSelecionado} onChange={(e) => setIdTipoSelecionado(e.target.value)}>
                <option value="" disabled>
                  {idSubCategoriaSelecionada && tipos.length === 0 ? "Nenhum tipo disponível" : "Insira tipo"}
                </option>
                {tipos.map((tipo) => (
                  <option key={tipo.id_tipo} value={tipo.id_tipo}>
                    {tipo.nome_tipo}
                  </option>
                ))}
              </select>
              {(!idSubCategoriaSelecionada || tipos.length === 0) && <Lock size={18} className={styles.inputIcon} />}
            </div>
          </div>

          <div className={styles.uploadSection}>
            <input 
              type="file" accept="application/pdf" multiple 
              ref={fileInputRef} onChange={handleFileSelect} className={styles.hiddenFileInput} 
            />
            <div 
              className={`${styles.dropzone} ${isDragging ? styles.dragging : ""}`}
              onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()} 
            >
              <div className={styles.uploadIconBackground}>
                <UploadCloud size={48} color="#ffffff" />
              </div>
              <p className={styles.dropzoneText}>Selecione ou Arraste o seu arquivo aqui.</p>
              <p className={styles.dropzoneSubText}>Escolher Arquivo</p>
            </div>

            {files.map((file, index) => (
              <div key={index} className={styles.fileCard}>
                <div className={styles.fileInfo}>
                  <FileText size={20} color="#000000" />
                  <span>{file.name}</span>
                </div>
                <button type="button" className={styles.deleteBtn} onClick={() => removeFile(index)}>
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <div className={styles.submitWrapper}>
            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
              <Plus size={18} /> {isLoading ? "Cadastrando..." : "Cadastrar Norma"}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}