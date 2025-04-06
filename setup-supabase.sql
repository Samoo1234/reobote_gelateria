-- Script SQL para configurar as tabelas no Supabase

-- Tabela de perguntas da pesquisa
CREATE TABLE IF NOT EXISTS surveys (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  question_type TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de opções de resposta
CREATE TABLE IF NOT EXISTS survey_options (
  id SERIAL PRIMARY KEY,
  survey_id INTEGER REFERENCES surveys(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  value INTEGER NOT NULL,
  "order" INTEGER NOT NULL
);

-- Tabela de respostas da pesquisa
CREATE TABLE IF NOT EXISTS survey_responses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de respostas individuais
CREATE TABLE IF NOT EXISTS survey_answers (
  id SERIAL PRIMARY KEY,
  response_id INTEGER REFERENCES survey_responses(id) ON DELETE CASCADE,
  survey_id INTEGER REFERENCES surveys(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir perguntas padrão se a tabela estiver vazia
INSERT INTO surveys (question, question_type, "order")
SELECT 'Como você avalia sua experiência?', 'experience', 1
WHERE NOT EXISTS (SELECT 1 FROM surveys WHERE id = 1);

INSERT INTO surveys (question, question_type, "order")
SELECT 'Com que frequência você visita nossa sorveteria?', 'frequency', 2
WHERE NOT EXISTS (SELECT 1 FROM surveys WHERE id = 2);

INSERT INTO surveys (question, question_type, "order")
SELECT 'Como você classificaria a variedade de sabores de sorvete disponíveis?', 'variety', 3
WHERE NOT EXISTS (SELECT 1 FROM surveys WHERE id = 3);

INSERT INTO surveys (question, question_type, "order")
SELECT 'Como você classificaria a qualidade e o sabor dos nossos sorvetes?', 'quality', 4
WHERE NOT EXISTS (SELECT 1 FROM surveys WHERE id = 4);

INSERT INTO surveys (question, question_type, "order")
SELECT 'Quão satisfeito você está com o atendimento ao cliente?', 'service', 5
WHERE NOT EXISTS (SELECT 1 FROM surveys WHERE id = 5);

INSERT INTO surveys (question, question_type, "order")
SELECT 'Você recomendaria nossa sorveteria a amigos e familiares?', 'recommend', 6
WHERE NOT EXISTS (SELECT 1 FROM surveys WHERE id = 6);