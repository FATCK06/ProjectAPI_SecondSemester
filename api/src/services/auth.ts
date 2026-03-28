import { supabase } from "./supabase";

export async function verificarLogin(loginDigitado: string, senhaDigitada: string) {
  
  // aqui usa verificação do supabase
  const emailFalso = `${loginDigitado.trim().toLowerCase()}@projeto.com`;
  
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: emailFalso,
    password: senhaDigitada,
  });

  if (!authError && authData.user) {
    return { sucesso: true, dados: authData.user, tipo: "Oficial" };
  }

  // aqui jeito rapido pega direto na tabela
  const { data: dbData, error: dbError } = await supabase
    .from('tb_usuarios') 
    .select('*')
    .eq('nome_usuario', loginDigitado) 
    .eq('senha_usuario', senhaDigitada) 
    .single(); 

  if (!dbError && dbData) {
    return { sucesso: true, dados: dbData, tipo: "Tabela" };
  }


  return { sucesso: false, mensagem: "Usuário ou senha incorretos." };
}


/*  esse codigo caso precise mudar de nome de usuario para email, vou deixar comentado
    const { data, error } = await supabase.auth.signInWithPassword({
    email: emailParaSupabase,
    password: senhaDigitada,
  });

  if (error) {
    return { sucesso: false, mensagem: "Usuário ou senha incorretos." };
  }

  return { sucesso: true, dados: data };
} */