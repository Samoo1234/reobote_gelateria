import { supabase } from './supabase';

// Função para verificar e criar as tabelas necessárias no Supabase
export async function initializeDatabase() {
  console.log('Verificando estrutura do banco de dados...');
  
  try {
    // 1. Verificar se a tabela surveys existe
    const { error: checkSurveysError } = await supabase
      .from('surveys')
      .select('count')
      .limit(1);
    
    // Se ocorrer um erro, provavelmente a tabela não existe
    if (checkSurveysError) {
      console.error('Erro ao verificar tabelas:', checkSurveysError.message);
      
      // Verificar se o erro é devido à tabela não existir
      if (checkSurveysError.message.includes('does not exist') || 
          checkSurveysError.message.includes('relation') ||
          checkSurveysError.code === '42P01') {
        console.error('As tabelas necessárias não existem no banco de dados.');
        console.error('Por favor, execute o script de configuração do banco de dados:');
        console.error('1. Acesse o painel do Supabase');
        console.error('2. Vá para a seção SQL Editor');
        console.error('3. Execute o script setup-supabase.sql');
        
        return false;
      }
      
      return false;
    } else {
      console.log('Banco de dados já está configurado.');
      return true;
    }
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    return false;
  }
}