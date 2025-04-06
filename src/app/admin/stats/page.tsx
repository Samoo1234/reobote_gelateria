'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIceCream, faChartBar, faSignOutAlt, faArrowLeft, faDownload } from '@fortawesome/free-solid-svg-icons';
import { useSupabase } from '@/contexts/SupabaseContext';
import { getSurveyStats, getSurveyQuestions, getSurveyResponses } from '@/lib/api';

export default function StatsPage() {
  const { user, signOut } = useSupabase();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'responses'
  
  useEffect(() => {
    if (!user) {
      router.push('/admin');
      return;
    }
    
    loadData();
  }, [user, router]);
  
  async function loadData() {
    setIsLoading(true);
    try {
      // Carregar estatísticas
      const statsData = await getSurveyStats();
      setStats(statsData);
      
      // Carregar perguntas
      const questionsData = await getSurveyQuestions();
      setQuestions(questionsData);
      
      // Carregar respostas recentes
      const responsesData = await getSurveyResponses(20, 0);
      setResponses(responsesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  }
  
  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/admin');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };
  
  const exportToCSV = () => {
    if (!responses.length) return;
    
    // Preparar cabeçalhos
    const headers = ['ID', 'Nome', 'Email', 'Telefone', 'Comentários', 'Data'];
    questions.forEach(q => headers.push(q.question));
    
    // Preparar linhas
    const rows = responses.map(response => {
      const row = [
        response.id,
        response.name,
        response.email,
        response.phone,
        `"${response.comments?.replace(/"/g, '""') || ''}"`,
        new Date(response.created_at).toLocaleString('pt-BR')
      ];
      
      // Adicionar respostas para cada pergunta
      questions.forEach(question => {
        const answer = response.survey_answers?.find((a: any) => a.survey_id === question.id);
        row.push(answer ? answer.rating : 'N/A');
      });
      
      return row;
    });
    
    // Combinar tudo em CSV
    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Criar e baixar o arquivo
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pesquisa_satisfacao_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Renderizar gráfico de barras simples
  const renderBarChart = (questionId: number) => {
    if (!stats || !stats.questionStats || !stats.questionStats[questionId]) {
      return <div className="no-data">Sem dados disponíveis</div>;
    }
    
    const questionStats = stats.questionStats[questionId];
    const maxPercentage = Math.max(...questionStats.percentages.slice(1));
    
    return (
      <div className="bar-chart">
        {[1, 2, 3, 4, 5].map(rating => {
          const percentage = questionStats.percentages[rating] || 0;
          const width = percentage > 0 ? (percentage / maxPercentage) * 100 : 0;
          
          return (
            <div key={rating} className="chart-row">
              <div className="rating-label">{rating} ★</div>
              <div className="bar-container">
                <div 
                  className="bar" 
                  style={{ 
                    width: `${width}%`,
                    backgroundColor: rating === 5 ? '#4CAF50' : 
                                     rating === 4 ? '#8BC34A' : 
                                     rating === 3 ? '#FFC107' : 
                                     rating === 2 ? '#FF9800' : 
                                     '#F44336'
                  }}
                ></div>
                <span className="percentage">{percentage.toFixed(1)}%</span>
              </div>
              <div className="count">{questionStats.ratings[rating] || 0} respostas</div>
            </div>
          );
        })}
      </div>
    );
  };
  
  if (!user) {
    return null; // Redirecionando para a página de login
  }
  
  return (
    <div className="container">
      <div className="survey-card admin-panel stats-panel">
        <div className="header">
          <div className="logo">
            <FontAwesomeIcon icon={faIceCream} />
          </div>
          <h1>Estatísticas da Pesquisa</h1>
          <div className="admin-actions">
            <button className="action-btn" onClick={() => router.push('/admin')}>
              <FontAwesomeIcon icon={faArrowLeft} /> Voltar
            </button>
            <button className="action-btn logout-btn" onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} /> Sair
            </button>
          </div>
        </div>
        
        <div className="admin-content">
          <div className="tabs">
            <button 
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <FontAwesomeIcon icon={faChartBar} /> Visão Geral
            </button>
            <button 
              className={`tab-btn ${activeTab === 'responses' ? 'active' : ''}`}
              onClick={() => setActiveTab('responses')}
            >
              <FontAwesomeIcon icon={faDownload} /> Respostas
            </button>
          </div>
          
          {isLoading ? (
            <div className="loading">Carregando...</div>
          ) : (
            <div className="tab-content">
              {activeTab === 'overview' && (
                <div className="overview-tab">
                  <div className="stats-summary">
                    <div className="stat-card">
                      <h3>Total de Respostas</h3>
                      <div className="stat-value">{stats?.totalResponses || 0}</div>
                    </div>
                  </div>
                  
                  <div className="question-stats">
                    {questions.map(question => (
                      <div key={question.id} className="question-stat-card">
                        <h3>{question.question}</h3>
                        <div className="stat-details">
                          <div className="average-rating">
                            <span className="label">Média:</span>
                            <span className="value">
                              {stats?.questionStats?.[question.id]?.average?.toFixed(1) || 'N/A'}
                            </span>
                            <span className="stars">
                              {'★'.repeat(Math.round(stats?.questionStats?.[question.id]?.average || 0))}
                              {'☆'.repeat(5 - Math.round(stats?.questionStats?.[question.id]?.average || 0))}
                            </span>
                          </div>
                          {renderBarChart(question.id)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'responses' && (
                <div className="responses-tab">
                  <div className="export-actions">
                    <button className="export-btn" onClick={exportToCSV}>
                      <FontAwesomeIcon icon={faDownload} /> Exportar para CSV
                    </button>
                  </div>
                  
                  {responses.length === 0 ? (
                    <div className="no-data">Nenhuma resposta encontrada.</div>
                  ) : (
                    <div className="responses-table-container">
                      <table className="responses-table">
                        <thead>
                          <tr>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Telefone</th>
                            <th>Data</th>
                            <th>Comentários</th>
                          </tr>
                        </thead>
                        <tbody>
                          {responses.map(response => (
                            <tr key={response.id}>
                              <td>{response.name}</td>
                              <td>{response.email}</td>
                              <td>{response.phone}</td>
                              <td>{new Date(response.created_at).toLocaleString('pt-BR')}</td>
                              <td>{response.comments || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}