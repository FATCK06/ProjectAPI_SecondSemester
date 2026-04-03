"use client";

import { useState, useEffect } from "react";
import { UserPlus, Edit2, Trash2, Search, X, Shield, Mail, Lock, User, Phone, Briefcase, Eye, EyeOff, Filter } from "lucide-react";
import { supabase } from "@/services/supabase";
import { useRouter } from "next/navigation";
import styles from "./usuarios.module.css";

interface Usuario {
  id_usuario: number;
  nome_usuario: string;
  sobrenome_usuario: string;
  cargo_usuario: string | null;
  telefone_usuario: string | null;
  email_usuario: string;
  senha_usuario: string;
  permissao_usuario: "ADMIN" | "REVISOR" | "CONSULTOR";
  data_criacao_usuario: string;
}

const PERMISSION_MAP = {
  ADMIN: { label: "Administrador", className: "badgeAdmin" },
  REVISOR: { label: "Revisor", className: "badgeRevisor" },
  CONSULTOR: { label: "Consultor", className: "badgeConsultor" },
};

// Formata Telefone
const formatPhone = (value: string) => {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

export default function ListarUsuarios() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [searchRole, setSearchRole] = useState<string>(""); // Filtro de Nível de Acesso

  // Modal de Edição
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    nome: "", sobrenome: "", cargo: "", telefone: "", email: "", senha: "", confirmarSenha: "", permissao: "CONSULTOR" as any,
  });
  const [isSaving, setIsSaving] = useState(false);
  
  const senhasDiferentes = formData.senha !== formData.confirmarSenha && formData.confirmarSenha !== "";

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("tb_usuarios")
      .select("*")
      .order("data_criacao_usuario", { ascending: false });

    if (!error && data) {
      setUsuarios(data as Usuario[]);
    }
    setIsLoading(false);
  }

  const normalizeText = (text: string | null) => {
    if (!text) return "";
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  const filteredUsers = usuarios.filter((user) => {
    const term = normalizeText(searchTerm);
    const nomeCompleto = normalizeText(`${user.nome_usuario} ${user.sobrenome_usuario}`);
    const cargo = normalizeText(user.cargo_usuario);
    const telefone = normalizeText(user.telefone_usuario);
    
    // Filtro por Texto (Nome, Email, Cargo ou Telefone)
    const matchesSearch = nomeCompleto.includes(term) || normalizeText(user.email_usuario).includes(term) || cargo.includes(term) || telefone.includes(term);
    
    // Filtro por Nível de Acesso
    const matchesRole = searchRole ? user.permissao_usuario === searchRole : true;

    return matchesSearch && matchesRole;
  });

  const handleDelete = async (id: number, nome: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o usuário ${nome}?`)) return;
    const { error } = await supabase.from("tb_usuarios").delete().eq("id_usuario", id);
    if (!error) {
      setUsuarios((prev) => prev.filter((u) => u.id_usuario !== id));
    }
  };

  const openEditModal = (user: Usuario) => {
    setSelectedUserId(user.id_usuario);
    setShowEditPassword(false); 
    setShowConfirmPassword(false);
    setFormData({
      nome: user.nome_usuario,
      sobrenome: user.sobrenome_usuario || "",
      cargo: user.cargo_usuario || "",
      telefone: user.telefone_usuario || "",
      email: user.email_usuario,
      senha: user.senha_usuario,
      confirmarSenha: user.senha_usuario, // Preenche a confirmação com a senha existente para evitar erros logo de cara
      permissao: user.permissao_usuario,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senhasDiferentes) return;

    setIsSaving(true);
    const { error } = await supabase.from("tb_usuarios").update({
      nome_usuario: formData.nome,
      sobrenome_usuario: formData.sobrenome,
      cargo_usuario: formData.cargo,
      telefone_usuario: formData.telefone,
      email_usuario: formData.email,
      senha_usuario: formData.senha,
      permissao_usuario: formData.permissao,
    }).eq("id_usuario", selectedUserId);

    setIsSaving(false);
    if (!error) {
      setIsEditModalOpen(false);
      fetchUsers();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.headerTexts}>
          <h1 className={styles.title}>Gerenciar Usuários</h1>
        </div>
        <button className={styles.addButton} onClick={() => router.push('/usuarios/cadastrar')}>
          <UserPlus size={18} />
          Adicionar Novo Usuário
        </button>
      </div>

      <div className={styles.searchSection}>
        <div className={styles.filtersWrapper}>
          <div className={styles.searchContainer}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Pesquisar por nome, email, cargo ou telefone..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className={styles.filterRoleContainer}>
            <Filter size={18} className={styles.searchIcon} />
            <select 
              className={styles.roleSelect}
              value={searchRole}
              onChange={(e) => setSearchRole(e.target.value)}
            >
              <option value="">Todos os Níveis</option>
              <option value="ADMIN">Administrador</option>
              <option value="REVISOR">Revisor</option>
              <option value="CONSULTOR">Consultor</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        {isLoading ? (
          <div className={styles.loading}>Carregando usuários...</div>
        ) : filteredUsers.length === 0 ? (
          <div className={styles.loading}>Nenhum usuário encontrado.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Nome Completo</th>
                <th className={styles.th}>Cargo</th>
                <th className={styles.th}>Endereço de e-mail</th>
                <th className={styles.th}>Telefone</th>
                <th className={styles.th}>Nível de acesso</th>
                <th className={styles.th} style={{ textAlign: "center" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const badgeConfig = PERMISSION_MAP[user.permissao_usuario] || PERMISSION_MAP.CONSULTOR;
                return (
                  <tr key={user.id_usuario} className={styles.tr}>
                    <td className={styles.td}>
                      <span className={styles.nomeCompleto}>
                        {user.nome_usuario} {user.sobrenome_usuario}
                      </span>
                    </td>
                    <td className={styles.td}>{user.cargo_usuario || "—"}</td>
                    <td className={styles.td}>{user.email_usuario}</td>
                    <td className={styles.td}>{user.telefone_usuario || "—"}</td>
                    <td className={styles.td}>
                      <span className={`${styles.badge} ${styles[badgeConfig.className]}`}>
                        {badgeConfig.label}
                      </span>
                    </td>
                    <td className={styles.td} style={{ textAlign: "center" }}>
                      <div className={styles.actionsContainer}>
                        <button className={styles.actionBtnEdit} onClick={() => openEditModal(user)}>
                          <Edit2 size={18} />
                        </button>
                        <button className={styles.actionBtnDelete} onClick={() => handleDelete(user.id_usuario, user.nome_usuario)}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL DE EDIÇÃO PREMIUM */}
      {isEditModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsEditModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Editar Usuário</h2>
              <button className={styles.closeBtn} onClick={() => setIsEditModalOpen(false)}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleEditSubmit} className={styles.formBody}>
              <div className={styles.rowSplit}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nome</label>
                  <div className={styles.inputWrapper}>
                    <User size={18} className={styles.inputIcon} />
                    <input type="text" className={styles.input} required value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Sobrenome</label>
                  <div className={styles.inputWrapper}>
                    <User size={18} className={styles.inputIcon} />
                    <input type="text" className={styles.input} required value={formData.sobrenome} onChange={(e) => setFormData({...formData, sobrenome: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className={styles.rowSplit}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Cargo</label>
                  <div className={styles.inputWrapper}>
                    <Briefcase size={18} className={styles.inputIcon} />
                    <input type="text" className={styles.input} value={formData.cargo} onChange={(e) => setFormData({...formData, cargo: e.target.value})} />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Telefone</label>
                  <div className={styles.inputWrapper}>
                    <Phone size={18} className={styles.inputIcon} />
                    <input type="text" className={styles.input} maxLength={15} value={formData.telefone} onChange={(e) => setFormData({...formData, telefone: formatPhone(e.target.value)})} />
                  </div>
                </div>
              </div>

              <div className={styles.formGroupFull}>
                <label className={styles.label}>E-mail Corporativo</label>
                <div className={styles.inputWrapper}>
                  <Mail size={18} className={styles.inputIcon} />
                  <input type="email" className={styles.input} required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>

              <div className={styles.rowSplit}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Senha de Acesso</label>
                  <div className={styles.inputWrapper}>
                    <Lock size={18} className={styles.inputIcon} />
                    <input 
                      type={showEditPassword ? "text" : "password"} 
                      className={styles.inputPassword} 
                      required 
                      value={formData.senha} 
                      onChange={(e) => setFormData({...formData, senha: e.target.value})} 
                    />
                    <button type="button" className={styles.eyeBtn} onClick={() => setShowEditPassword(!showEditPassword)}>
                      {showEditPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Confirme a Senha</label>
                  <div className={styles.inputWrapper}>
                    <Lock size={18} className={styles.inputIcon} />
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      className={`${styles.inputPassword} ${senhasDiferentes ? styles.inputError : ''}`} 
                      required 
                      value={formData.confirmarSenha} 
                      onChange={(e) => setFormData({...formData, confirmarSenha: e.target.value})} 
                    />
                    <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {senhasDiferentes && <span className={styles.errorText}>As senhas não coincidem.</span>}
                </div>
              </div>

              <div className={styles.rowSplit}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nível de Acesso</label>
                  <div className={styles.inputWrapper}>
                    <Shield size={18} className={styles.inputIcon} />
                    <select
                      className={styles.inputSelect}
                      required
                      value={formData.permissao}
                      onChange={(e) => setFormData({ ...formData, permissao: e.target.value as "ADMIN" | "REVISOR" | "CONSULTOR" })}
                    >
                      <option value="CONSULTOR">Consultor</option>
                      <option value="REVISOR">Revisor</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formGroup}></div> {/* Espaço vazio para alinhar a grid */}
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsEditModalOpen(false)}>Cancelar</button>
                <button type="submit" className={styles.saveBtn} disabled={isSaving || senhasDiferentes}>
                  {isSaving ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}