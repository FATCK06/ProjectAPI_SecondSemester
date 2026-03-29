"use client";

import { useState, useRef } from "react";
import { Plus, UploadCloud, FileText, Trash2 } from "lucide-react";
import styles from "./cadastrar.module.css";

export default function CadastrarNorma() {
  // 1. Estados do Formulário e Arquivos
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 2. Funções de Drag & Drop (Arrastar e Soltar)
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); 
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    // Pega os arquivos que foram soltos na área
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      // Filtra para aceitar apenas PDFs (opcional, igual o código do seu amigo)
      const pdfFiles = droppedFiles.filter(file => file.type === "application/pdf");
      setFiles((prev) => [...prev, ...pdfFiles]);
    }
  };

  // 3. Funções de Clique Tradicional (Selecionar Arquivo)
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

  // 4. Salvar Formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Formulário enviado com ${files.length} arquivos! Lógica de salvamento entra aqui.`);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Cadastro de Norma</h1>

      <form className={styles.grid} onSubmit={handleSubmit}>
        
        {/* COLUNA ESQUERDA: FORMULÁRIO */}
        <div className={styles.form}>

          <div className={styles.formGroup}>
            <label className={styles.label}>Código da Norma:<span className={styles.required}>*</span></label>
            <input type="text" className={styles.input} placeholder="Código da Norma" required />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Título da Norma: <span className={styles.required}>*</span></label>
            <input type="text" className={styles.input} placeholder="Insira um título" required/>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Descrição da Norma</label>
            <input type="" className={styles.input} placeholder="Insira a descrição"/>
          </div>

          <div className={styles.formGroup}> {/* aqui tem que ser dropdown*/}
            <label className={styles.label}>Categoria</label>
            <input type="text" className={styles.input} placeholder="Insira categoria" required/>
          </div>

          

          <div className={styles.formGroup}>
            <label className={styles.label}>Escopo:</label>
            <input type="text" className={styles.input} placeholder="???" />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Normas Correlacionadas:</label>
            <input type="text" className={styles.input} placeholder="Adicionar normas correlacionadas" />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Data de criação:</label>
            <input type="date" className={styles.input} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Palavra-chave:</label>
            <input type="text" className={styles.input} placeholder="Adicionar palavras-chave" />
          </div>

          <div className={styles.submitWrapper}>
            <button type="submit" className={styles.submitBtn}>
              <Plus size={18} /> Cadastrar Norma
            </button>
          </div>
        </div>

        {/* COLUNA DIREITA: UPLOAD DE ARQUIVOS */}
        <div className={styles.uploadSection}>
          
          <input 
            type="file" 
            accept="application/pdf"
            multiple 
            ref={fileInputRef}
            onChange={handleFileSelect}
            className={styles.hiddenFileInput} 
          />

          {/* Área tracejada de clique e drop */}
          <div 
            className={`${styles.dropzone} ${isDragging ? styles.dragging : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()} 
          >
            <UploadCloud size={64} className={styles.uploadIcon} />
            <p className={styles.dropzoneText}>Selecione ou Arraste o seu arquivo aqui.</p>
            <p className={styles.dropzoneSubText}>Escolher Arquivo</p>
          </div>

          {/* Lista de Arquivos Anexados */}
          {files.map((file, index) => (
            <div key={index} className={styles.fileCard}>
              <div className={styles.fileInfo}>
                <FileText size={20} color="#000000" />
                <span>{file.name}</span>
              </div>
              <button 
                type="button" 
                className={styles.deleteBtn} 
                onClick={() => removeFile(index)}
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}

        </div>
      </form>
    </div>
  );
}