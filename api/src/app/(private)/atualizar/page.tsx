"use client";

import { useState, useRef, useEffect } from "react";
import { Save, UploadCloud, FileText, Trash2, Lock, ArrowLeft } from "lucide-react";
import styles from "./update.module.css";
import { supabase } from "@/services/supabase"; 
// import { Sidebar } from "@/components/Sidebar";

interface Orgao { id_orgao: number; nome_completo_orgao: string; }
interface Categoria { id_categoria: number; nome_categoria: string; }
interface SubCategoria { id_subcategoria: number; nome_subcategoria: string; }
interface Tipo { id_tipo: number; nome_tipo: string; }

export default function AtualizarNorma({ idNorma }: { idNorma: number }) {
  // ==========================================
  // 1. ESTADOS DO FORMULÁRIO (BD)
  // ==========================================
  const [codigo, setCodigo] = useState("");
  const [titulo, setTitulo] = useState("");
  const [escopo, setEscopo] = useState("");
  const [dataCriacao, setDataCriacao] = useState("");
  const [revisaoAtual, setRevisaoAtual] = useState("");
  const [revisaoObsoleta, setRevisaoObsoleta] = useState("");
  const [normasCorrelacionadas, setNormasCorrelacionadas] = useState("");
  const [palavrasChave, setPalavrasChave] = useState("");
  const [revisaoAnteriorNoBanco, setRevisaoAnteriorNoBanco] = useState("");
  
  // Chaves estrangeiras selecionadas
  const [idOrgaoSelecionado, setIdOrgaoSelecionado] = useState<string>("");
  const [idCategoriaSelecionada, setIdCategoriaSelecionada] = useState<string>("");
  const [idSubCategoriaSelecionada, setIdSubCategoriaSelecionada] = useState<string>("");
  const [idTipoSelecionado, setIdTipoSelecionado] = useState<string>(""); 
  const [listaNormas, setListaNormas] = useState<{id_norma: number, codigo_norma: string}[]>([]);
 const [idNormaSelecionada, setIdNormaSelecionada] = useState<string>("");

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
  const [caminhoArquivoAtual, setCaminhoArquivoAtual] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  // ==========================================
  // 3. BUSCA DE DADOS INICIAIS (USE EFFECT)
  // ==========================================

useEffect(() => {
  async function carregarDadosIniciais() {
    // Busca a lista de normas
    const { data: dNormas } = await supabase.from('tb_normas').select('id_norma, codigo_norma');
    if (dNormas) setListaNormas(dNormas);

    // Busca Órgãos
    const { data: dOrgaos } = await supabase.from('tb_orgaos').select('*');
    if (dOrgaos) setOrgaos(dOrgaos);

    // Busca Categorias
    const { data: dCats } = await supabase.from('tb_categorias').select('*');
    if (dCats) setCategorias(dCats);
  }

  carregarDadosIniciais();
}, []);

useEffect(() => {
  async function buscarDadosDaNorma() {
    const idParaBuscar = idNormaSelecionada || idNorma;
    if (!idParaBuscar) return;

    const { data: norma } = await supabase
      .from('tb_normas')
      .select('*')
      .eq('id_norma', idParaBuscar)
      .single();

    if (norma) {
      setCodigo(norma.codigo_norma);
      setTitulo(norma.titulo_norma);
      setEscopo(norma.escopo_norma || "");
      setDataCriacao(norma.data_publicacao_norma || "");
      setRevisaoAtual(norma.revisao_norma_atual);
      setRevisaoAnteriorNoBanco(norma.revisao_norma_atual); // O que é atual vira "obsoleta" no update
      setIdOrgaoSelecionado(norma.id_orgao?.toString());
      setIdCategoriaSelecionada(norma.id_categoria?.toString());
      setIdSubCategoriaSelecionada(norma.id_subcategoria?.toString());
      setIdTipoSelecionado(norma.id_tipo?.toString());
      setCaminhoArquivoAtual(norma.caminho_arquivo || "");
      setRevisaoObsoleta(norma.revisao_norma_obsoleta || "");
    }
  }

  buscarDadosDaNorma();
}, [idNorma, idNormaSelecionada]);

  // Efeitos para carregar Subcategorias e Tipos conforme seleção
  useEffect(() => {
    async function fetchSub() {
      if (!idCategoriaSelecionada) return;
      const { data } = await supabase.from('tb_subcategoria').select('*').eq('id_categoria', idCategoriaSelecionada);
      if (data) setSubCategorias(data);
    }
    fetchSub();
  }, [idCategoriaSelecionada]);

  useEffect(() => {
    async function fetchTipos() {
      if (!idSubCategoriaSelecionada) return;
      const { data } = await supabase.from('tb_tipo').select('*').eq('id_subcategoria', idSubCategoriaSelecionada);
      if (data) setTipos(data);
    }
    fetchTipos();
  }, [idSubCategoriaSelecionada]);

  useEffect(() => {
  async function carregarNormasParaSelecao() {
    const { data } = await supabase.from('tb_normas').select('id_norma, codigo_norma');
    if (data) setListaNormas(data);
  }
  carregarNormasParaSelecao();
}, []);

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
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
     setMensagem({ tipo: "", texto: "" });
    

    if (revisaoAtual.trim().toUpperCase() === revisaoAnteriorNoBanco.trim().toUpperCase()) {
    setMensagem({ 
      tipo: "erro", 
      texto: `A nova revisão (${revisaoAtual}) não pode ser igual à revisão que já existe no sistema.` 
    });
    return; 
  }

  
  if (revisaoAtual.trim().toUpperCase() === revisaoObsoleta.trim().toUpperCase()) {
    setMensagem({ 
      tipo: "erro", 
      texto: "Você não pode voltar para uma revisão que já foi obsoleta." 
    });
    return;
  }

  setIsLoading(true);
 

  setIsLoading(true);

    try {
      let filePath = caminhoArquivoAtual;

     
      if (files.length > 0) {
        const file = files[0];
        const fileName = `${Date.now()}_edit.${file.name.split('.').pop()}`;
        const { data: upData, error: upErr } = await supabase.storage
          .from('normas_pdfs').upload(`pdf/${fileName}`, file);
        if (upErr) throw upErr;
        filePath = upData.path;
      }

      // Executa o Update no Banco
      const { error: updateError } = await supabase
        .from('tb_normas')
        .update({
          codigo_norma: codigo,
          titulo_norma: titulo,
          escopo_norma: escopo,
          data_publicacao_norma: dataCriacao || null,
          // Lógica de Versionamento
          revisao_norma_atual: revisaoAtual, 
          revisao_norma_obsoleta: revisaoAnteriorNoBanco, 
          id_orgao: Number(idOrgaoSelecionado),
          caminho_arquivo: filePath,
          id_categoria: idCategoriaSelecionada ? parseInt(idCategoriaSelecionada) : null,
          id_subcategoria: idSubCategoriaSelecionada ? parseInt(idSubCategoriaSelecionada) : null,
          id_tipo: idTipoSelecionado ? parseInt(idTipoSelecionado) : null,
        })
        .eq('id_norma', idNormaSelecionada || idNorma);

      if (updateError) throw updateError;
      setMensagem({ tipo: "sucesso", texto: "Norma atualizada com sucesso!" });

    } catch (error: any) {
      setMensagem({ tipo: "erro", texto: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Editar Norma</h1>

      {mensagem.texto && (
        <div className={`${styles.alert} ${mensagem.tipo === 'erro' ? styles.alertError : styles.alertSuccess}`}>
          {mensagem.texto}
        </div>
      )}

      <div className={styles.formGroup}>
  <label className={styles.label}>Selecione a Norma para Editar:</label>
  <select 
    className={styles.select} 
    value={idNormaSelecionada} 
    onChange={(e) => setIdNormaSelecionada(e.target.value)}
  >
    <option value="">-- Escolha uma norma --</option>
    {listaNormas.map(n => (
      <option key={n.id_norma} value={n.id_norma}>{n.codigo_norma}</option>
    ))}
  </select>
</div>

      <form className={styles.grid} onSubmit={handleUpdate}>
        
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
              <label className={styles.label}>Revisão Obsoleta:</label>
              <input type="text" className={styles.input} placeholder="Ex: D" disabled
                value={revisaoObsoleta} />
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
            <input type="text" className={styles.input} placeholder="Adicionar normas correlacionadas" 
              value={normasCorrelacionadas} onChange={(e) => setNormasCorrelacionadas(e.target.value)} />
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
              type="file" accept="application/pdf"
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
              <p className={styles.dropzoneText}>
                {files.length > 0 ? files[0].name : "Selecione ou Arraste o novo PDF aqui."}
              </p>
              <p className={styles.dropzoneSubText}>Substituir Arquivo Atual</p>
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
              <Save size={18} /> {isLoading ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}

