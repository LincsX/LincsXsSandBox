// Array com os links alternados
const links = ["http://example1.com", "http://example2.com"];

// Função para verificar se o link está acessível
async function checkLink(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        console.error(`Erro ao verificar o link ${url}:`, error.message);
        return false;
    }
}

// Função para obter o último link acessado do localStorage
function getLastVisitedLink() {
    return localStorage.getItem('lastVisited');
}

// Função para atualizar o último link acessado no localStorage
function updateLastVisitedLink(url) {
    localStorage.setItem('lastVisited', url);
}

// Função principal para redirecionar
async function redirect() {
    // Recupera o último link acessado do localStorage
    let lastVisited = getLastVisitedLink();
    
    // Se não houver último link visitado ou se o último link não está na lista, inicializa com o primeiro link
    if (!lastVisited || !links.includes(lastVisited)) {
        lastVisited = links[0];
        updateLastVisitedLink(lastVisited);
    }
    
    // Seleciona o próximo link que não seja o último visitado
    let nextUrl = links.find(url => url !== lastVisited);
    
    // Verifica se o próximo link está acessível
    const isLinkAccessible = await checkLink(nextUrl);
    
    if (!isLinkAccessible) {
        console.log(`O link ${nextUrl} está quebrado. Redirecionando para o outro link disponível.`);
        // Seleciona o outro link disponível
        nextUrl = links.find(url => url !== nextUrl);
    }
    
    // Atualiza o último link acessado no localStorage
    updateLastVisitedLink(nextUrl);
    
    // Redireciona para o próximo link
    window.location.href = nextUrl;
}

// Executa a função de redirecionamento ao carregar a página
window.onload = redirect;
