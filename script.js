document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const experienceStars = document.querySelectorAll('#experience-stars i');
    const experienceText = document.getElementById('experience-text');
    const experienceValue = document.getElementById('experience-value');
    
    const frequencyStars = document.querySelectorAll('#frequency-stars i');
    const frequencyText = document.getElementById('frequency-text');
    const frequencyValue = document.getElementById('frequency-value');
    
    const varietyStars = document.querySelectorAll('#variety-stars i');
    const varietyText = document.getElementById('variety-text');
    const varietyValue = document.getElementById('variety-value');
    
    const qualityStars = document.querySelectorAll('#quality-stars i');
    const qualityText = document.getElementById('quality-text');
    const qualityValue = document.getElementById('quality-value');
    
    const serviceStars = document.querySelectorAll('#service-stars i');
    const serviceText = document.getElementById('service-text');
    const serviceValue = document.getElementById('service-value');
    
    const recommendStars = document.querySelectorAll('#recommend-stars i');
    const recommendText = document.getElementById('recommend-text');
    const recommendValue = document.getElementById('recommend-value');
    
    const form = document.getElementById('satisfaction-form');
    const thankYou = document.getElementById('thank-you');
    const newSurveyBtn = document.getElementById('new-survey');
    const phoneInput = document.getElementById('phone');
    
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
    
    // Função para configurar o sistema de estrelas
    function setupStarRating(stars, textElement, valueElement, textsArray) {
        stars.forEach(star => {
            // Evento ao passar o mouse sobre a estrela
            star.addEventListener('mouseover', function() {
                const rating = this.getAttribute('data-rating');
                highlightStars(stars, rating);
                textElement.textContent = textsArray[rating];
            });
            
            // Evento ao tirar o mouse da estrela
            star.addEventListener('mouseout', function() {
                const currentRating = valueElement.value;
                highlightStars(stars, currentRating);
                textElement.textContent = textsArray[currentRating];
            });
            
            // Evento ao clicar na estrela
            star.addEventListener('click', function() {
                const rating = this.getAttribute('data-rating');
                valueElement.value = rating;
                highlightStars(stars, rating);
                textElement.textContent = textsArray[rating];
                
                // Adiciona classe para efeito de seleção
                stars.forEach(s => s.classList.remove('selected'));
                this.classList.add('selected');
            });
        });
    }
    
    // Função para destacar estrelas até o rating selecionado
    function highlightStars(stars, rating) {
        stars.forEach(star => {
            const starRating = star.getAttribute('data-rating');
            if (starRating <= rating) {
                star.classList.remove('far');
                star.classList.add('fas');
            } else {
                star.classList.remove('fas');
                star.classList.add('far');
            }
        });
    }
    
    // Configurar cada conjunto de estrelas
    setupStarRating(experienceStars, experienceText, experienceValue, ratingTexts);
    setupStarRating(frequencyStars, frequencyText, frequencyValue, frequencyTexts);
    setupStarRating(varietyStars, varietyText, varietyValue, ratingTexts);
    setupStarRating(qualityStars, qualityText, qualityValue, ratingTexts);
    setupStarRating(serviceStars, serviceText, serviceValue, ratingTexts);
    setupStarRating(recommendStars, recommendText, recommendValue, recommendTexts);
    
    // Máscara para o campo de telefone
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            // Formata como (XX) XXXXX-XXXX
            if (value.length <= 2) {
                value = `(${value}`;
            } else if (value.length <= 7) {
                value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
            } else if (value.length <= 11) {
                value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
            } else {
                value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7, 11)}`;
            }
        }
        e.target.value = value;
    });
    
    // Validação e envio do formulário
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validação básica para todas as classificações
        if (experienceValue.value === '0' || frequencyValue.value === '0' || 
            varietyValue.value === '0' || qualityValue.value === '0' || 
            serviceValue.value === '0' || recommendValue.value === '0') {
            alert('Por favor, responda todas as perguntas da pesquisa.');
            return;
        }
        
        // Simulação de envio (aqui você conectaria com seu backend)
        // Em um cenário real, você enviaria os dados para um servidor
        
        // Exibe a tela de agradecimento
        thankYou.classList.add('visible');
        
        // Limpa o formulário
        form.reset();
        
        // Resetar todas as classificações
        highlightStars(experienceStars, 0);
        experienceText.textContent = ratingTexts[0];
        experienceValue.value = 0;
        
        highlightStars(frequencyStars, 0);
        frequencyText.textContent = frequencyTexts[0];
        frequencyValue.value = 0;
        
        highlightStars(varietyStars, 0);
        varietyText.textContent = ratingTexts[0];
        varietyValue.value = 0;
        
        highlightStars(qualityStars, 0);
        qualityText.textContent = ratingTexts[0];
        qualityValue.value = 0;
        
        highlightStars(serviceStars, 0);
        serviceText.textContent = ratingTexts[0];
        serviceValue.value = 0;
        
        highlightStars(recommendStars, 0);
        recommendText.textContent = recommendTexts[0];
        recommendValue.value = 0;
    });
    
    // Botão para nova avaliação
    newSurveyBtn.addEventListener('click', function() {
        thankYou.classList.remove('visible');
    });
});