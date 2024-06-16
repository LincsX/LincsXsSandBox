// Importa o módulo SQLite
const sqlite3 = require('sqlite3').verbose();

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

// Função para obter o último link acessado do banco de dados SQLite
function getLastVisitedLink() {
    return new Promise((resolve, reject) => {
        // Abre a conexão com o banco de dados
        let db = new sqlite3.Database(':memory:', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
            if (err) {
                console.error('Erro ao abrir o banco de dados:', err.message);
                reject(err);
            } else {
                console.log('Conexão com o banco de dados SQLite estabelecida.');
                // Cria a tabela se não existir
                db.run('CREATE TABLE IF NOT EXISTS visited_links (id INTEGER PRIMARY KEY, url TEXT)');
                
                // Obtém o último link acessado
                db.get('SELECT url FROM visited_links ORDER BY id DESC LIMIT 1', (err, row) => {
                    if (err) {
                        console.error('Erro ao consultar o banco de dados:', err.message);
                        reject(err);
                    } else {
                        const lastVisited = row ? row.url : null;
                        resolve(lastVisited);
                    }
                });
            }
        });

        // Fecha a conexão com o banco de dados após a consulta
        db.close((err) => {
            if (err) {
                console.error('Erro ao fechar o banco de dados:', err.message);
                reject(err);
            }
        });
    });
}

// Função para atualizar o último link acessado no banco de dados SQLite
function updateLastVisitedLink(url) {
    // Abre a conexão com o banco de dados
    let db = new sqlite3.Database(':memory:', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
            console.error('Erro ao abrir o banco de dados:', err.message);
        } else {
            console.log('Conexão com o banco de dados SQLite estabelecida.');
            // Cria a tabela se não existir
            db.run('CREATE TABLE IF NOT EXISTS visited_links (id INTEGER PRIMARY KEY, url TEXT)');
            
            // Insere o último link acessado
            db.run('INSERT INTO visited_links (url) VALUES (?)', [url], (err) => {
                if (err) {
                    console.error('Erro ao inserir o último link acessado:', err.message);
                } else {
                    console.log('Último link acessado atualizado:', url);
                }
            });
        }
    });

    // Fecha a conexão com o banco de dados após a inserção
    db.close((err) => {
        if (err) {
            console.error('Erro ao fechar o banco de dados:', err.message);
        }
    });
}

// Função principal para redirecionar
async function redirect() {
    // Recupera o último link acessado do banco de dados SQLite
    let lastVisited = await getLastVisitedLink();
    
    // Seleciona o próximo link que não seja o último visitado
    let nextUrl = links.find(url => url !== lastVisited);
    
    // Verifica se o próximo link está acessível
    const isLinkAccessible = await checkLink(nextUrl);
    
    if (!isLinkAccessible) {
        console.log(`O link ${nextUrl} está quebrado. Redirecionando para o outro link disponível.`);
        // Seleciona o outro link disponível
        nextUrl = links.find(url => url !== nextUrl);
    }
    
    // Atualiza o último link acessado no banco de dados SQLite
    updateLastVisitedLink(nextUrl);
    
    // Redireciona para o próximo link
    window.location.href = nextUrl;
}

// Executa a função de redirecionamento ao carregar a página
window.onload = redirect;