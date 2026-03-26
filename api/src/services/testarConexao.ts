// TESTE DE CONEXAO 
// import { supabase } from '@/services/supabase';

// export async function testarConexao() {
//   try {
//     const { data, error } = await supabase
//       .from('tb_normas') // tabela interna do PostgreSQL
//       .select('*')
//       .limit(1);

//     if (error) throw error;

//     return { status: 'ok', mensagem: 'Conectou com sucesso 🚀' };
//   } catch (err: any) {
//     return { status: 'erro', mensagem: err.message };
//   }
// }