'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIceCream, faCheckCircle, faCog } from '@fortawesome/free-solid-svg-icons';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import { faStar as fasStar } from '@fortawesome/free-solid-svg-icons';
import { getSurveyQuestions, submitSurveyResponse } from '@/lib/api';
import { Survey } from '@/lib/supabase';
import { initializeDatabase } from '@/lib/initSupabase';

export default function Home() {
  // Estados para cada classificação
  const [experienceRating, setExperienceRating] = useState(0);
  const [frequencyRating, setFrequencyRating] = useState(0);
  const [varietyRating, setVarietyRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(0);
  const [serviceRating, setServiceRating] = useState(0);
  const [recommendRating, setRecommendRating] = useState(0);
  
  // Estado para controlar a inicialização do banco de dados
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  
  // Estados para os textos de classificação
  const [experienceText, setExperienceText] = useState('Selecione uma classificação');
  const [frequencyText, setFrequencyText] = useState('Selecione uma classificação');
  const [varietyText, setVarietyText] = useState('Selecione uma classificação');
  const [qualityText, setQualityText] = useState('Selecione uma classificação');
  const [serviceText, setServiceText] = useState('Selecione uma classificação');
  const [recommendText, setRecommendText] = useState('Selecione uma classificação');
  
  // Estado para o formulário
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    comments: ''
  });
  
  // Estado para a tela de agradecimento
  const [showThankYou, setShowThankYou] = useState(false);
  
  // Textos de classificação
  const ratingTexts = [
    'Selecione uma classificação',
    'Muito insatisfeito',
    'Insatisfeito',
    'Neutro',
    'Satisfeito',
    'Muito satisfeito'
  ];
  
  // Textos específicos para frequência
  const frequencyTexts = [
    'Selecione uma classificação',
    'Primeira vez',
    'Raramente (algumas vezes por ano)',
    'Ocasionalmente (mensalmente)',
    'Frequentemente (semanalmente)',
    'Muito frequentemente (várias vezes por semana)'
  ];
  
  // Textos específicos para recomendação
  const recommendTexts = [
    'Selecione uma classificação',
    'Definitivamente não',
    'Provavelmente não',
    'Talvez',
    'Provavelmente sim',
    'Definitivamente sim'
  ];
  
  // Função para formatar o telefone
  const formatPhone = (value: string) => {
    value = value.replace(/\D/g, '');
    if (value.length > 0) {
      if (value.length <= 2) {
        return `(${value}`;
      } else if (value.length <= 7) {
        return `(${value.substring(0, 2)}) ${value.substring(2)}`;
      } else if (value.length <= 11) {
        return `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
      } else {
        return `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7, 11)}`;
      }
    }
    return value;
  };
  
  // Função para lidar com a mudança nos campos do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      setFormData({
        ...formData,
        [name]: formatPhone(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // Função para lidar com o envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica para todas as classificações
    if (experienceRating === 0 || frequencyRating === 0 || 
        varietyRating === 0 || qualityRating === 0 || 
        serviceRating === 0 || recommendRating === 0) {
      alert('Por favor, responda todas as perguntas da pesquisa.');
      return;
    }
    
    // Verificar se o banco de dados foi inicializado
    if (!dbInitialized) {
      try {
        const success = await initializeDatabase();
        if (!success) {
          alert('Não foi possível conectar ao banco de dados. Por favor, tente novamente mais tarde.');
          return;
        }
        setDbInitialized(true);
      } catch (error) {
        console.error('Erro ao inicializar banco de dados:', error);
        alert('Ocorreu um erro ao conectar ao banco de dados. Por favor, tente novamente mais tarde.');
        return;
      }
    }
    
    try {
      // Preparar os dados da resposta principal
      const response = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        comments: formData.comments
      };
      
      // Preparar as respostas individuais para cada pergunta
      const answers = [
        { survey_id: 1, rating: experienceRating },
        { survey_id: 2, rating: frequencyRating },
        { survey_id: 3, rating: varietyRating },
        { survey_id: 4, rating: qualityRating },
        { survey_id: 5, rating: serviceRating },
        { survey_id: 6, rating: recommendRating }
      ];
      
      console.log('Enviando dados para o Supabase:', { response, answers });
      
      // Enviar dados para o Supabase usando a função da API
      const success = await submitSurveyResponse(response, answers);
      
      if (success) {
        console.log('Dados enviados com sucesso!');
        // Exibe a tela de agradecimento
        setShowThankYou(true);
        
        // Limpa o formulário
        resetForm();
      } else {
        console.error('Erro ao enviar dados para o Supabase');
        alert('Ocorreu um erro ao enviar sua avaliação. Por favor, tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      alert('Ocorreu um erro ao enviar sua avaliação. Por favor, tente novamente.');
    }
  };
  
  // Função para resetar o formulário
  const resetForm = () => {
    setExperienceRating(0);
    setFrequencyRating(0);
    setVarietyRating(0);
    setQualityRating(0);
    setServiceRating(0);
    setRecommendRating(0);
    
    setExperienceText('Selecione uma classificação');
    setFrequencyText('Selecione uma classificação');
    setVarietyText('Selecione uma classificação');
    setQualityText('Selecione uma classificação');
    setServiceText('Selecione uma classificação');
    setRecommendText('Selecione uma classificação');
    
    setFormData({
      name: '',
      email: '',
      phone: '',
      comments: ''
    });
  };
  
  // Componente para o sistema de classificação por estrelas
  const StarRating = ({
    rating,
    setRating,
    setText,
    texts
  }: {
    rating: number;
    setRating: (rating: number) => void;
    setText: (text: string) => void;
    texts: string[];
  }) => {
    const handleStarHover = (hoveredRating: number) => {
      setText(texts[hoveredRating]);
    };
    
    const handleStarLeave = () => {
      setText(texts[rating]);
    };
    
    const handleStarClick = (clickedRating: number) => {
      setRating(clickedRating);
      setText(texts[clickedRating]);
    };
    
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span 
            key={star}
            onMouseEnter={() => handleStarHover(star)}
            onMouseLeave={handleStarLeave}
            onClick={() => handleStarClick(star)}
            style={{ display: 'inline-block' }}
          >
            <FontAwesomeIcon 
              icon={star <= rating ? fasStar : farStar} 
              style={{ color: star <= rating ? '#FFD700' : '#ddd', display: 'block' }}
            />
          </span>
        ))}
      </div>
    );
  };
  
  // Inicializar o banco de dados quando o componente for montado
  useEffect(() => {
    const initDb = async () => {
      try {
        const success = await initializeDatabase();
        setDbInitialized(success);
        if (!success) {
          setDbError('Não foi possível conectar ao banco de dados. Verifique se as tabelas foram criadas no Supabase.');
        }
      } catch (error) {
        console.error('Erro ao inicializar banco de dados:', error);
        setDbError('Erro ao conectar ao banco de dados. Por favor, tente novamente mais tarde.');
      }
    };
    
    initDb();
  }, []);
  
  return (
    <div className="container">
      {dbError ? (
        <div className="error-message">
          <h2>{dbError}</h2>
          <p>Para resolver este problema:</p>
          <ol>
            <li>Verifique se as credenciais do Supabase estão corretas no arquivo .env.local</li>
            <li>Acesse o painel do Supabase e execute o script setup-supabase.sql no SQL Editor</li>
            <li>Recarregue esta página após configurar o banco de dados</li>
          </ol>
          <button 
            className="submit-btn" 
            onClick={() => window.location.reload()}
          >
            Tentar Novamente
          </button>
        </div>
      ) : (
        <div className="survey-card">
          <div className="header">
            <div className="logo">
              <FontAwesomeIcon icon={faIceCream} />
            </div>
            <h1>Pesquisa de Satisfação</h1>
            <p>Sua opinião é muito importante para nós! Ajude-nos a melhorar sua experiência.</p>
          </div>
          
          <form id="satisfaction-form" onSubmit={handleSubmit}>
            <div className="rating-container">
              <h2>Como você avalia sua experiência?</h2>
              <StarRating 
                rating={experienceRating} 
                setRating={setExperienceRating} 
                setText={setExperienceText} 
                texts={ratingTexts} 
              />
              <p>{experienceText}</p>
            </div>
            
            <div className="rating-container">
              <h2>Com que frequência você visita nossa sorveteria?</h2>
              <StarRating 
                rating={frequencyRating} 
                setRating={setFrequencyRating} 
                setText={setFrequencyText} 
                texts={frequencyTexts} 
              />
              <p>{frequencyText}</p>
            </div>
            
            <div className="rating-container">
              <h2>Como você classificaria a variedade de sabores de sorvete disponíveis?</h2>
              <StarRating 
                rating={varietyRating} 
                setRating={setVarietyRating} 
                setText={setVarietyText} 
                texts={ratingTexts} 
              />
              <p>{varietyText}</p>
            </div>
            
            <div className="rating-container">
              <h2>Como você classificaria a qualidade e o sabor dos nossos sorvetes?</h2>
              <StarRating 
                rating={qualityRating} 
                setRating={setQualityRating} 
                setText={setQualityText} 
                texts={ratingTexts} 
              />
              <p>{qualityText}</p>
            </div>
            
            <div className="rating-container">
              <h2>Quão satisfeito você está com o atendimento ao cliente?</h2>
              <StarRating 
                rating={serviceRating} 
                setRating={setServiceRating} 
                setText={setServiceText} 
                texts={ratingTexts} 
              />
              <p>{serviceText}</p>
            </div>
            
            <div className="rating-container">
              <h2>Você recomendaria nossa sorveteria a amigos e familiares?</h2>
              <StarRating 
                rating={recommendRating} 
                setRating={setRecommendRating} 
                setText={setRecommendText} 
                texts={recommendTexts} 
              />
              <p>{recommendText}</p>
            </div>
            
            <div className="form-group">
              <label htmlFor="name">Nome Completo</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                value={formData.name}
                onChange={handleInputChange}
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email}
                onChange={handleInputChange}
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Telefone</label>
              <input 
                type="tel" 
                id="phone" 
                name="phone" 
                placeholder="(00) 00000-0000" 
                value={formData.phone}
                onChange={handleInputChange}
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="comments">Comentários (opcional)</label>
              <textarea 
                id="comments" 
                name="comments" 
                rows={4}
                value={formData.comments}
                onChange={handleInputChange}
              ></textarea>
            </div>
            
            <button type="submit" className="submit-btn">Enviar Avaliação</button>
          </form>
          
          <div id="thank-you" className={showThankYou ? 'visible' : 'hidden'}>
            <div className="thank-you-content">
              <FontAwesomeIcon icon={faCheckCircle} style={{ fontSize: '60px', color: '#4CAF50', marginBottom: '20px' }} />
              <h2>Obrigado pela sua avaliação!</h2>
              <p>Sua opinião é muito importante para continuarmos melhorando nossos produtos e serviços.</p>
              <button 
                className="submit-btn" 
                onClick={() => setShowThankYou(false)}
              >
                Nova Avaliação
              </button>
            </div>
          </div>
          <div className="admin-link">
            <a href="/admin" title="Área Administrativa">
              <FontAwesomeIcon icon={faCog} style={{ color: '#aaa', fontSize: '16px' }} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}