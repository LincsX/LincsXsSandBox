import express from 'express'
import { prismaClient } from './database'

const app = express()
app.use(express.json())

const port = process.env.PORT ?? 4000

app.get('/', async (request, response) => {
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

  return response.json()
})

app.get('/books', async (request, response) => {
  const books = await prismaClient.book.findMany()
  return response.json(books)
})

app.post('/books', async (request, response) => {
  const { description, name } = request.body
  const book = await prismaClient.book.create({
    data: {
      description,
      name,
    },
  })
  return response.json(book)
})

app.listen(port, () => console.log('Server is running on port ', port))


// =========================================================

