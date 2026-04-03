"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Briefcase, Phone, Mail, Lock, Check, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/services/supabase";
import styles from "./cadastrar-usuario.module.css";

// Função para aplicar máscara de telefone: (XX) XXXXX-XXXX
const formatPhone = (value: string) => {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

export default function CadastrarUsuarioWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    sobrenome: "",
    cargo: "",
    telefone: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    permissao: "CONSULTOR" as "ADMIN" | "REVISOR" | "CONSULTOR",
  });

  const senhasDiferentes = formData.senha !== formData.confirmarSenha && formData.confirmarSenha !== "";

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from("tb_usuarios").insert({
        nome_usuario: formData.nome,
        sobrenome_usuario: formData.sobrenome,
        cargo_usuario: formData.cargo,
        telefone_usuario: formData.telefone,
        email_usuario: formData.email,
        senha_usuario: formData.senha, 
        permissao_usuario: formData.permissao,
      });

      if (error) throw error;
      alert("Usuário cadastrado com sucesso!");
      router.push("/usuarios");
    } catch (error) {
      const e = error as Error;
      alert("Erro ao cadastrar: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.wizardContainer}>
        
        {/* CABEÇALHO DO WIZARD - Stepper */}
        <div className={styles.stepperWrapper}>
          <div className={styles.step}>
            <div className={`${styles.stepCircle} ${currentStep >= 1 ? styles.activeCircle : ''}`}>
              {currentStep > 1 ? <Check size={16} /> : "1"}
            </div>
            <span className={`${styles.stepLabel} ${currentStep >= 1 ? styles.activeLabel : ''}`}>
              Detalhes de Cadastro
            </span>
          </div>
          <div className={`${styles.stepLine} ${currentStep >= 2 ? styles.activeLine : ''}`} />
          
          <div className={styles.step}>
            <div className={`${styles.stepCircle} ${currentStep >= 2 ? styles.activeCircle : ''}`}>
              {currentStep > 2 ? <Check size={16} /> : "2"}
            </div>
            <span className={`${styles.stepLabel} ${currentStep >= 2 ? styles.activeLabel : ''}`}>
              Nível de Acesso
            </span>
          </div>
          <div className={`${styles.stepLine} ${currentStep >= 3 ? styles.activeLine : ''}`} />

          <div className={styles.step}>
            <div className={`${styles.stepCircle} ${currentStep === 3 ? styles.activeCircle : ''}`}>
              3
            </div>
            <span className={`${styles.stepLabel} ${currentStep === 3 ? styles.activeLabel : ''}`}>
              Revisar
            </span>
          </div>
        </div>

        {/* ======================= PASSO 1 ======================= */}
        {currentStep === 1 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Informações Pessoais</h2>
            <p className={styles.stepSubtitle}>Preencha os dados básicos do novo usuário.</p>
            
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nome</label>
                <div className={styles.inputWrapper}>
                  <User size={18} className={styles.inputIcon} />
                  <input type="text" className={styles.input} placeholder="Ex: João" 
                    value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Sobrenome</label>
                <div className={styles.inputWrapper}>
                  <User size={18} className={styles.inputIcon} />
                  <input type="text" className={styles.input} placeholder="Ex: Silva" 
                    value={formData.sobrenome} onChange={(e) => setFormData({...formData, sobrenome: e.target.value})} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Cargo</label>
                <div className={styles.inputWrapper}>
                  <Briefcase size={18} className={styles.inputIcon} />
                  <input type="text" className={styles.input} placeholder="Ex: Engenheiro de Qualidade" 
                    value={formData.cargo} onChange={(e) => setFormData({...formData, cargo: e.target.value})} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Telefone</label>
                <div className={styles.inputWrapper}>
                  <Phone size={18} className={styles.inputIcon} />
                  {/* Máscara de Telefone Adicionada */}
                  <input type="text" className={styles.input} placeholder="(00) 00000-0000" maxLength={15}
                    value={formData.telefone} onChange={(e) => setFormData({...formData, telefone: formatPhone(e.target.value)})} />
                </div>
              </div>
              
              <div className={styles.formGroupFull}>
                <label className={styles.label}>E-mail Corporativo</label>
                <div className={styles.inputWrapper}>
                  <Mail size={18} className={styles.inputIcon} />
                  <input type="email" className={styles.input} placeholder="joao@empresa.com" 
                    value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Senha Temporária</label>
                <div className={styles.inputWrapper}>
                  <Lock size={18} className={styles.inputIcon} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className={styles.inputPassword} 
                    placeholder="Defina uma senha" 
                    value={formData.senha} 
                    onChange={(e) => setFormData({...formData, senha: e.target.value})} 
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {/* Aviso de segurança */}
                <span className={styles.warningText}>
                  Recomendamos inserir uma senha exclusiva apenas para este site. Evite usar senhas de uso pessoal para a sua segurança.
                </span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Confirme a Senha</label>
                <div className={styles.inputWrapper}>
                  <Lock size={18} className={styles.inputIcon} />
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    className={`${styles.inputPassword} ${senhasDiferentes ? styles.inputError : ''}`} 
                    placeholder="Repita a senha" 
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
          </div>
        )}

        {/* ======================= PASSO 2 ======================= */}
        {currentStep === 2 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Definir Nível de Acesso</h2>
            <p className={styles.stepSubtitle}>Escolha as permissões que este usuário terá no sistema.</p>
            
            <div className={styles.radioGroup}>
              <label className={`${styles.radioCard} ${formData.permissao === 'CONSULTOR' ? styles.radioCardActive : ''}`}>
                <input type="radio" name="permissao" value="CONSULTOR" className={styles.hiddenRadio}
                  checked={formData.permissao === 'CONSULTOR'} onChange={() => setFormData({...formData, permissao: 'CONSULTOR'})} />
                <div className={styles.radioHeader}>
                  <div className={styles.radioCheckmark}></div>
                  <span className={styles.radioTitle}>Consultor</span>
                </div>
                <p className={styles.radioDesc}>Apenas leitura. Pode visualizar normas e sugerir revisões.</p>
              </label>

              <label className={`${styles.radioCard} ${formData.permissao === 'REVISOR' ? styles.radioCardActive : ''}`}>
                <input type="radio" name="permissao" value="REVISOR" className={styles.hiddenRadio}
                  checked={formData.permissao === 'REVISOR'} onChange={() => setFormData({...formData, permissao: 'REVISOR'})} />
                <div className={styles.radioHeader}>
                  <div className={styles.radioCheckmark}></div>
                  <span className={styles.radioTitle}>Revisor</span>
                </div>
                <p className={styles.radioDesc}>Pode criar novas normas e julgar solicitações de revisão.</p>
              </label>

              <label className={`${styles.radioCard} ${formData.permissao === 'ADMIN' ? styles.radioCardActive : ''}`}>
                <input type="radio" name="permissao" value="ADMIN" className={styles.hiddenRadio}
                  checked={formData.permissao === 'ADMIN'} onChange={() => setFormData({...formData, permissao: 'ADMIN'})} />
                <div className={styles.radioHeader}>
                  <div className={styles.radioCheckmark}></div>
                  <span className={styles.radioTitle}>Administrador</span>
                </div>
                <p className={styles.radioDesc}>Acesso total. Pode gerenciar usuários e configurações do sistema.</p>
              </label>
            </div>
          </div>
        )}

        {/* ======================= PASSO 3 ======================= */}
        {currentStep === 3 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Revisar e Finalizar</h2>
            <p className={styles.stepSubtitle}>Confirme se os dados abaixo estão corretos antes de salvar.</p>
            
            <div className={styles.summaryCard}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Nome Completo</span>
                <span className={styles.summaryValue}>{formData.nome} {formData.sobrenome}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Cargo</span>
                <span className={styles.summaryValue}>{formData.cargo || "Não informado"}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Telefone</span>
                <span className={styles.summaryValue}>{formData.telefone || "Não informado"}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>E-mail</span>
                <span className={styles.summaryValue}>{formData.email}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Nível de Acesso</span>
                <span className={`${styles.summaryBadge} ${
                  formData.permissao === 'ADMIN' ? styles.badgeAdmin : 
                  formData.permissao === 'REVISOR' ? styles.badgeRevisor : styles.badgeConsultor
                }`}>
                  {formData.permissao === 'ADMIN' ? 'Administrador' : formData.permissao === 'REVISOR' ? 'Revisor' : 'Consultor'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* RODAPÉ DO WIZARD - Botões */}
        <div className={styles.wizardFooter}>
          {currentStep === 1 ? (
            <button className={styles.btnSecondary} onClick={() => router.push('/usuarios')}>
              Cancelar
            </button>
          ) : (
            <button className={styles.btnSecondary} onClick={prevStep}>
              Voltar
            </button>
          )}

          {currentStep < 3 ? (
            <button 
              className={styles.btnPrimary} 
              onClick={nextStep}
              disabled={
                (currentStep === 1 && (!formData.nome || !formData.email || !formData.senha || !formData.confirmarSenha || senhasDiferentes))
              }
            >
              Próximo passo
            </button>
          ) : (
            <button className={styles.btnPrimary} onClick={handleFinish} disabled={isSaving}>
              {isSaving ? "Finalizando..." : "Finalizar Cadastro"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}