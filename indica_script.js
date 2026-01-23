/**
 * Função para enviar uma mensagem pré-definida para o WhatsApp.
 * @param {string} type - O tipo de mensagem a ser enviada (ex: 'geral', 'duvida', 'nível1').
 */
function sendWhatsApp(type) {
    // CORREÇÃO: Removido o dígito '9' extra para seguir o padrão da API (12 dígitos)
    const phoneNumber = '558481878563'; 
    let message = '';

    // CORREÇÃO: Removidos acentos das chaves para garantir compatibilidade com o HTML
    const messages = {
        geral: 'Olá! Gostaria de fazer uma indicação para o programa de parceria ECOMP 2026.',
        duvida: 'Olá! Tenho uma dúvida sobre o programa de parceria ECOMP 2026.',
        nivel1: 'Olá! Quero enviar minha lista de indicações (Nível 1).',
        nivel2: 'Olá! Gostaria de ajuda para agendar reuniões com meus indicados (Nível 2).',
        nivel3: 'Olá! Acredito que uma de minhas indicações foi convertida e gostaria de validar (Nível 3).'
    };

    message = messages[type] || messages['geral'];

    const encodedMessage = encodeURIComponent(message);
    
    // Utilizando o formato wa.me que é mais moderno e estável
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
}

// Adiciona os 'event listeners' quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('button[data-action]');
    buttons.forEach(button => {
        button.addEventListener('click', () => sendWhatsApp(button.dataset.action));
    });

    /**
     * ------------------------------------------------------------------
     * CARREGADOR DE RANKING A PARTIR DO GOOGLE SHEETS
     * ------------------------------------------------------------------
     */

    // URLs das suas planilhas publicadas como CSV.
    // IMPORTANTE: Substitua 'URL_DA_SUA_PLANILHA_CSV' pela URL real.
    const segcompSheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTP-xjQMZPvSjxVmex59sqVjCqMxxwj_GQr2u_Zj89Cz5tw4h8qLz0Fuxa-oBvY7H37-yAh2FpIRq0U/pub?gid=0&single=true&output=csv';
    const techcompSheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTP-xjQMZPvSjxVmex59sqVjCqMxxwj_GQr2u_Zj89Cz5tw4h8qLz0Fuxa-oBvY7H37-yAh2FpIRq0U/pub?gid=1771790272&single=true&output=csv';

    // Chama a função para carregar os dados em cada card de ranking.
    displayRanking(segcompSheetUrl, 'segcomp-ranking');
    displayRanking(techcompSheetUrl, 'techcomp-ranking');

    /**
     * ------------------------------------------------------------------
     * MANIPULADOR DO FORMULÁRIO DE CONTATO (via mailto:)
     * ------------------------------------------------------------------
     */
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Impede o envio padrão do formulário

            const name = document.getElementById('contact-name').value;
            const message = document.getElementById('contact-message').value;
            const recipientEmail = 'Wenderson.cunha@grupoecomp.com.br';
            
            const subject = encodeURIComponent(`Dúvida do Programa de Indicações - ${name}`);
            const body = encodeURIComponent(`Nome: ${name}\n\nMensagem:\n${message}`);

            // Cria e aciona o link mailto: para abrir o cliente de e-mail do usuário
            window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
        });
    }
});

/**
 * Busca dados de uma planilha Google (publicada como CSV), processa e exibe em um card de ranking.
 * @param {string} sheetUrl - A URL da planilha publicada como CSV.
 * @param {string} cardId - O ID do elemento do card de ranking onde os dados serão exibidos.
 */
async function displayRanking(sheetUrl, cardId) {
    const rankingCard = document.getElementById(cardId);
    if (!rankingCard) {
        console.error(`Elemento de ranking com ID "${cardId}" não encontrado.`);
        return;
    }

    // Remove os itens de placeholder existentes
    const placeholders = rankingCard.querySelectorAll('.rank-item');
    placeholders.forEach(p => p.remove());

    try {
        // Validação da URL para evitar erros de fetch com a string placeholder
        if (!sheetUrl || !sheetUrl.startsWith('http')) {
            throw new Error('URL da planilha inválida ou não configurada.');
        }

        // Usamos 'no-cache' para garantir que os dados do ranking estejam sempre atualizados.
        const response = await fetch(sheetUrl, { cache: 'no-cache' });
        if (!response.ok) throw new Error(`Falha na rede (status: ${response.status})`);

        const csvText = await response.text();
        const data = csvText.trim().split('\n').map(row => {
            const [name, score] = row.split(',');
            return { name: name.trim(), score: parseInt(score, 10) };
        }).filter(item => item.name && !isNaN(item.score));

        data.sort((a, b) => b.score - a.score); // Ordena por pontuação (maior primeiro)

        if (data.length === 0) {
            rankingCard.innerHTML += '<div class="rank-item inactive"><span>-</span><span>Nenhum dado para exibir.</span></div>';
        } else {
            data.slice(0, 3).forEach((item, index) => {
                rankingCard.innerHTML += `<div class="rank-item ${index > 0 ? 'inactive' : ''}"><span>${index + 1}º</span><span>${item.name} (${item.score} pts)</span></div>`;
            });
        }
    } catch (error) {
        console.error(`Erro ao carregar o ranking para "${cardId}":`, error);
        // Um TypeError geralmente indica um erro de CORS ao rodar de um arquivo local (file://).
        // Esta mensagem no console ajuda a diagnosticar o problema.
        if (error instanceof TypeError) {
            console.warn("DICA: Este erro pode ser causado pela política de CORS do navegador. Tente rodar a página a partir de um servidor local (como o 'Live Server' do VS Code) em vez de abrir o arquivo HTML diretamente.");
        }
        rankingCard.innerHTML += '<div class="rank-item inactive"><span>!</span><span>Erro ao carregar dados.</span></div>';
    }
}