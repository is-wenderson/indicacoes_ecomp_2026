function sendWhatsApp(tipo) {
    const fone = "558481878563"; 
    const baseLink = `https://wa.me/${fone}?text=`;
    
    let mensagem = "";

    switch (tipo) {
        case 'nivel1':
            mensagem = "Olá! Gostaria de indicar meu primeiro bloco de 5 contatos (Nível 1) para o Programa 2026 e validar meu crédito de R$ 250.";
            break;
        case 'nivel2':
            mensagem = "Olá! Já realizei a apresentação estratégica para as empresas indicadas e gostaria de validar meu crédito de R$ 500 (Nível 2).";
            break;
        case 'nivel3':
            mensagem = "Olá! Tenho uma conversão de contrato para validar e garantir meus 20% de bônus na fatura deste mês.";
            break;
        case 'duvida':
            mensagem = "Olá! Vi o portal de indicações 2026 e gostaria de tirar dúvidas sobre as regras de adiantamento e o ranking semanal.";
            break;
        case 'geral':
            mensagem = "Olá! Gostaria de falar com o consultor sobre o Programa de Indicações do Grupo Ecomp.";
            break;
        default:
            mensagem = "Olá! Gostaria de falar com o consultor sobre o Programa de Indicações do Grupo Ecomp.";
            break;
    }

    window.open(baseLink + encodeURIComponent(mensagem), '_blank');

}
