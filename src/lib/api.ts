import { supabase, Survey, SurveyOption, SurveyResponse, SurveyAnswer } from './supabase';

// Funções para gerenciar perguntas da pesquisa
export async function getSurveyQuestions() {
  const { data, error } = await supabase
    .from('surveys')
    .select('*, options(*)')
    .order('order');
  
  if (error) {
    console.error('Erro ao buscar perguntas:', error);
    return [];
  }
  
  return data || [];
}

export async function createSurveyQuestion(question: Omit<Survey, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('surveys')
    .insert(question)
    .select();
  
  if (error) {
    console.error('Erro ao criar pergunta:', error);
    return null;
  }
  
  return data?.[0] || null;
}

export async function updateSurveyQuestion(id: number, updates: Partial<Survey>) {
  const { data, error } = await supabase
    .from('surveys')
    .update(updates)
    .eq('id', id)
    .select();
  
  if (error) {
    console.error('Erro ao atualizar pergunta:', error);
    return null;
  }
  
  return data?.[0] || null;
}

export async function deleteSurveyQuestion(id: number) {
  const { error } = await supabase
    .from('surveys')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Erro ao excluir pergunta:', error);
    return false;
  }
  
  return true;
}

// Funções para gerenciar opções de resposta
export async function createSurveyOption(option: Omit<SurveyOption, 'id'>) {
  const { data, error } = await supabase
    .from('survey_options')
    .insert(option)
    .select();
  
  if (error) {
    console.error('Erro ao criar opção:', error);
    return null;
  }
  
  return data?.[0] || null;
}

export async function updateSurveyOption(id: number, updates: Partial<SurveyOption>) {
  const { data, error } = await supabase
    .from('survey_options')
    .update(updates)
    .eq('id', id)
    .select();
  
  if (error) {
    console.error('Erro ao atualizar opção:', error);
    return null;
  }
  
  return data?.[0] || null;
}

export async function deleteSurveyOption(id: number) {
  const { error } = await supabase
    .from('survey_options')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Erro ao excluir opção:', error);
    return false;
  }
  
  return true;
}

// Funções para salvar respostas da pesquisa
export async function submitSurveyResponse(response: Omit<SurveyResponse, 'id' | 'created_at'>, answers: Omit<SurveyAnswer, 'id' | 'response_id' | 'created_at'>[]) {
  // Primeiro, insere a resposta principal
  const { data: responseData, error: responseError } = await supabase
    .from('survey_responses')
    .insert(response)
    .select();
  
  if (responseError || !responseData?.[0]) {
    console.error('Erro ao salvar resposta:', responseError);
    return false;
  }
  
  const responseId = responseData[0].id;
  
  // Em seguida, insere todas as respostas individuais
  const answersWithResponseId = answers.map(answer => ({
    ...answer,
    response_id: responseId
  }));
  
  const { error: answersError } = await supabase
    .from('survey_answers')
    .insert(answersWithResponseId);
  
  if (answersError) {
    console.error('Erro ao salvar respostas individuais:', answersError);
    return false;
  }
  
  return true;
}

// Funções para obter estatísticas e relatórios
export async function getSurveyStats() {
  const { data: responses, error: responsesError } = await supabase
    .from('survey_responses')
    .select('count');
  
  if (responsesError) {
    console.error('Erro ao buscar estatísticas:', responsesError);
    return null;
  }
  
  const { data: answers, error: answersError } = await supabase
    .from('survey_answers')
    .select('survey_id, rating');
  
  if (answersError) {
    console.error('Erro ao buscar respostas:', answersError);
    return null;
  }
  
  // Define o tipo para o objeto questionStats
  interface QuestionStat {
    count: number;
    sum: number;
    ratings: number[];
    average?: number;
    percentages?: number[];
  }
  
  // Calcula médias por pergunta
  const questionStats: Record<string, QuestionStat> = {};
  
  answers?.forEach(answer => {
    if (!questionStats[answer.survey_id]) {
      questionStats[answer.survey_id] = {
        count: 0,
        sum: 0,
        ratings: [0, 0, 0, 0, 0, 0] // Índice 0 não usado, 1-5 para contagem de cada classificação
      };
    }
    
    questionStats[answer.survey_id].count++;
    questionStats[answer.survey_id].sum += answer.rating;
    questionStats[answer.survey_id].ratings[answer.rating]++;
  });
  
  // Calcula médias e percentuais
  Object.keys(questionStats).forEach(questionId => {
    const stats = questionStats[questionId];
    stats.average = stats.sum / stats.count;
    stats.percentages = stats.ratings.map(count => (count / stats.count) * 100);
  });
  
  return {
    totalResponses: responses?.[0]?.count || 0,
    questionStats
  };
}

export async function getSurveyResponses(limit = 100, offset = 0) {
  const { data, error } = await supabase
    .from('survey_responses')
    .select('*, survey_answers(*)')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) {
    console.error('Erro ao buscar respostas:', error);
    return [];
  }
  
  return data || [];
}