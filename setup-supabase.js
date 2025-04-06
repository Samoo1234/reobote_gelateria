// Script para configurar as tabelas do Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configurações do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: Variáveis de ambiente do Supabase não configuradas.');
  process.exit(1);
}

// Cria o cliente do Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('Iniciando configuração do banco de dados...');

  try {
    // 1. Criar tabela de perguntas da pesquisa (surveys)
    console.log('Criando tabela surveys...');
    const { error: surveysError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'surveys',
      table_definition: `
        id serial primary key,
        question text not null,
        question_type text not null,
        order integer not null,
        active boolean default true,
        created_at timestamp with time zone default now()
      `
    });

    if (surveysError) {
      console.error('Erro ao criar tabela surveys:', surveysError);
    } else {
      console.log('Tabela surveys criada com sucesso!');
    }

    // 2. Criar tabela de opções de resposta (survey_options)
    console.log('Criando tabela survey_options...');
    const { error: optionsError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'survey_options',
      table_definition: `
        id serial primary key,
        survey_id integer references surveys(id) on delete cascade,
        text text not null,
        value integer not null,
        order integer not null
      `
    });

    if (optionsError) {
      console.error('Erro ao criar tabela survey_options:', optionsError);
    } else {
      console.log('Tabela survey_options criada com sucesso!');
    }

    // 3. Criar tabela de respostas da pesquisa (survey_responses)
    console.log('Criando tabela survey_responses...');
    const { error: responsesError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'survey_responses',
      table_definition: `
        id serial primary key,
        name text not null,
        email text not null,
        phone text not null,
        comments text,
        created_at timestamp with time zone default now()
      `
    });

    if (responsesError) {
      console.error('Erro ao criar tabela survey_responses:', responsesError);
    } else {
      console.log('Tabela survey_responses criada com sucesso!');
    }

    // 4. Criar tabela de respostas individuais (survey_answers)
    console.log('Criando tabela survey_answers...');
    const { error: answersError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'survey_answers',
      table_definition: `
        id serial primary key,
        response_id integer references survey_responses(id) on delete cascade,
        survey_id integer references surveys(id) on delete cascade,
        rating integer not null,
        created_at timestamp with time zone default now()
      `
    });

    if (answersError) {
      console.error('Erro ao criar tabela survey_answers:', answersError);
    } else {
      console.log('Tabela survey_answers criada com sucesso!');
    }

    // 5. Inserir perguntas padrão se a tabela estiver vazia
    const { data: existingQuestions } = await supabase
      .from('surveys')
      .select('id')
      .limit(1);

    if (!existingQuestions || existingQuestions.length === 0) {
      console.log('Inserindo perguntas padrão...');
      const defaultQuestions = [
        { question: 'Como você avalia sua experiência?', question_type: 'experience', order: 1 },
        { question: 'Com que frequência você visita nossa sorveteria?', question_type: 'frequency', order: 2 },
        { question: 'Como você classificaria a variedade de sabores de sorvete disponíveis?', question_type: 'variety', order: 3 },
        { question: 'Como você classificaria a qualidade e o sabor dos nossos sorvetes?', question_type: 'quality', order: 4 },
        { question: 'Quão satisfeito você está com o atendimento ao cliente?', question_type: 'service', order: 5 },
        { question: 'Você recomendaria nossa sorveteria a amigos e familiares?', question_type: 'recommend', order: 6 }
      ];

      const { error: insertError } = await supabase
        .from('surveys')
        .insert(defaultQuestions);

      if (insertError) {
        console.error('Erro ao inserir perguntas padrão:', insertError);
      } else {
        console.log('Perguntas padrão inseridas com sucesso!');
      }
    }

    console.log('Configuração do banco de dados concluída!');
  } catch (error) {
    console.error('Erro durante a configuração do banco de dados:', error);
  }
}

// Executar a configuração
setupDatabase();