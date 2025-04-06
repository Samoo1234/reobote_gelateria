'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIceCream, faPlus, faEdit, faTrash, faArrowUp, faArrowDown, faSave, faTimes, faSignOutAlt, faChartBar } from '@fortawesome/free-solid-svg-icons';
import { useSupabase } from '@/contexts/SupabaseContext';
import { getSurveyQuestions, createSurveyQuestion, updateSurveyQuestion, deleteSurveyQuestion } from '@/lib/api';
import { Survey } from '@/lib/supabase';

export default function AdminPage() {
  const { user, signIn, signOut } = useSupabase();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  
  // Carregar perguntas quando o componente montar
  useEffect(() => {
    loadQuestions();
  }, [user]);
  
  async function loadQuestions() {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await getSurveyQuestions();
      setQuestions(data);
    } catch (error) {
      console.error('Erro ao carregar perguntas:', error);
    } finally {
      setIsLoading(false);
    }
  }
  
  // Funções para gerenciar perguntas
  const handleAddQuestion = () => {
    setEditingQuestion({
      question: '',
      question_type: 'experience',
      order: questions.length + 1,
      active: true,
      options: [
        { text: 'Muito insatisfeito', value: 1, order: 1 },
        { text: 'Insatisfeito', value: 2, order: 2 },
        { text: 'Neutro', value: 3, order: 3 },
        { text: 'Satisfeito', value: 4, order: 4 },
        { text: 'Muito satisfeito', value: 5, order: 5 }
      ]
    });
  };
  
  const handleEditQuestion = (question: any) => {
    setEditingQuestion({ ...question });
  };
  
  const handleSaveQuestion = async () => {
    if (!editingQuestion.question.trim()) {
      alert('Por favor, insira o texto da pergunta.');
      return;
    }
    
    try {
      if (editingQuestion.id) {
        // Atualizar pergunta existente
        await updateSurveyQuestion(editingQuestion.id, {
          question: editingQuestion.question,
          question_type: editingQuestion.question_type,
          order: editingQuestion.order,
          active: editingQuestion.active
        });
      } else {
        // Criar nova pergunta
        await createSurveyQuestion({
          question: editingQuestion.question,
          question_type: editingQuestion.question_type,
          order: editingQuestion.order,
          active: editingQuestion.active
        });
      }
      
      // Recarregar perguntas
      await loadQuestions();
      setEditingQuestion(null);
    } catch (error) {
      console.error('Erro ao salvar pergunta:', error);
      alert('Ocorreu um erro ao salvar a pergunta. Por favor, tente novamente.');
    }
  };
  
  const handleDeleteQuestion = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta pergunta?')) {
      return;
    }
    
    try {
      await deleteSurveyQuestion(id);
      await loadQuestions();
    } catch (error) {
      console.error('Erro ao excluir pergunta:', error);
      alert('Ocorreu um erro ao excluir a pergunta. Por favor, tente novamente.');
    }
  };
  
  const handleMoveQuestion = async (id: number, direction: 'up' | 'down') => {
    const index = questions.findIndex(q => q.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === questions.length - 1)) {
      return;
    }
    
    const newQuestions = [...questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Trocar as ordens
    const currentOrder = newQuestions[index].order;
    newQuestions[index].order = newQuestions[targetIndex].order;
    newQuestions[targetIndex].order = currentOrder;
    
    // Atualizar no banco de dados
    try {
      await updateSurveyQuestion(newQuestions[index].id, { order: newQuestions[index].order });
      await updateSurveyQuestion(newQuestions[targetIndex].id, { order: newQuestions[targetIndex].order });
      await loadQuestions();
    } catch (error) {
      console.error('Erro ao reordenar perguntas:', error);
      alert('Ocorreu um erro ao reordenar as perguntas. Por favor, tente novamente.');
    }
  };
  
  // Funções de autenticação
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      const { error } = await signIn(loginData.email, loginData.password);
      if (error) throw error;
    } catch (error: any) {
      console.error('Erro de login:', error);
      setLoginError(error.message || 'Falha na autenticação. Verifique suas credenciais.');
    }
  };
  
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };
  
  // Renderização condicional baseada no estado de autenticação
  if (!user) {
    return (
      <div className="container">
        <div className="survey-card admin-login">
          <div className="header">
            <div className="logo">
              <FontAwesomeIcon icon={faIceCream} />
            </div>
            <h1>Área Administrativa</h1>
            <p>Faça login para gerenciar a pesquisa de satisfação</p>
          </div>
          
          <form onSubmit={handleLogin} className="login-form">
            {loginError && <div className="error-message">{loginError}</div>}
            
            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input 
                type="email" 
                id="email" 
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <input 
                type="password" 
                id="password" 
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                required 
              />
            </div>
            
            <button type="submit" className="submit-btn">Entrar</button>
          </form>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container">
      <div className="survey-card admin-panel">
        <div className="header">
          <div className="logo">
            <FontAwesomeIcon icon={faIceCream} />
          </div>
          <h1>Gerenciamento de Pesquisa</h1>
          <div className="admin-actions">
            <button className="action-btn" onClick={() => router.push('/admin/stats')}>
              <FontAwesomeIcon icon={faChartBar} /> Estatísticas
            </button>
            <button className="action-btn logout-btn" onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} /> Sair
            </button>
          </div>
        </div>
        
        <div className="admin-content">
          <div className="admin-header">
            <h2>Perguntas da Pesquisa</h2>
            <button className="add-btn" onClick={handleAddQuestion}>
              <FontAwesomeIcon icon={faPlus} /> Nova Pergunta
            </button>
          </div>
          
          {isLoading ? (
            <div className="loading">Carregando...</div>
          ) : (
            <div className="questions-list">
              {questions.length === 0 ? (
                <div className="no-questions">Nenhuma pergunta cadastrada. Clique em "Nova Pergunta" para começar.</div>
              ) : (
                questions.map((question) => (
                  <div key={question.id} className={`question-item ${!question.active ? 'inactive' : ''}`}>
                    <div className="question-content">
                      <h3>{question.question}</h3>
                      <div className="question-meta">
                        <span className="question-type">{question.question_type}</span>
                        <span className="question-status">{question.active ? 'Ativa' : 'Inativa'}</span>
                      </div>
                    </div>
                    <div className="question-actions">
                      <button onClick={() => handleMoveQuestion(question.id, 'up')} className="action-icon">
                        <FontAwesomeIcon icon={faArrowUp} />
                      </button>
                      <button onClick={() => handleMoveQuestion(question.id, 'down')} className="action-icon">
                        <FontAwesomeIcon icon={faArrowDown} />
                      </button>
                      <button onClick={() => handleEditQuestion(question)} className="action-icon">
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button onClick={() => handleDeleteQuestion(question.id)} className="action-icon delete">
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        
        {editingQuestion && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>{editingQuestion.id ? 'Editar Pergunta' : 'Nova Pergunta'}</h2>
                <button className="close-btn" onClick={() => setEditingQuestion(null)}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              
              <div className="form-group">
                <label htmlFor="question">Texto da Pergunta</label>
                <input 
                  type="text" 
                  id="question" 
                  value={editingQuestion.question}
                  onChange={(e) => setEditingQuestion({...editingQuestion, question: e.target.value})}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="question_type">Tipo de Pergunta</label>
                <select 
                  id="question_type" 
                  value={editingQuestion.question_type}
                  onChange={(e) => setEditingQuestion({...editingQuestion, question_type: e.target.value})}
                >
                  <option value="experience">Experiência Geral</option>
                  <option value="frequency">Frequência</option>
                  <option value="variety">Variedade</option>
                  <option value="quality">Qualidade</option>
                  <option value="service">Atendimento</option>
                  <option value="recommend">Recomendação</option>
                  <option value="custom">Personalizada</option>
                </select>
              </div>
              
              <div className="form-group checkbox-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={editingQuestion.active}
                    onChange={(e) => setEditingQuestion({...editingQuestion, active: e.target.checked})}
                  />
                  Pergunta Ativa
                </label>
              </div>
              
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setEditingQuestion(null)}>
                  Cancelar
                </button>
                <button className="save-btn" onClick={handleSaveQuestion}>
                  <FontAwesomeIcon icon={faSave} /> Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}