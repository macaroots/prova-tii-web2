const tbody = document.getElementById('lista-livros');
const form = document.getElementById('form-livro');
const mensagem = document.getElementById('mensagem');

// Cria uma linha (<tr>) da tabela para um livro
function criarLinha(livro) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${livro.titulo}</td>
        <td>${livro.autor}</td>
        <td>${livro.ano ?? ''}</td>
        <td>${livro.disponivel ? 'Sim' : 'Não'}</td>
        <td><button class="apagar">apagar</button></td>
    `;
    const botaoApagar = tr.querySelector('.apagar');
    botaoApagar.addEventListener('click', () => apagar(livro.id, tr));
    return tr;
}

// Busca os livros na API e preenche a tabela
async function carregarLivros() {
    const resposta = await fetch('/api/livros');
    if (resposta.status == 401) {
        window.location = '/';
        return;
    }
    const livros = await resposta.json();
    tbody.innerHTML = '';
    for (const livro of livros) {
        tbody.appendChild(criarLinha(livro));
    }
}

// TODO Questão 5: ao enviar o formulário, NÃO recarregar a página.
// Enviar os dados via fetch (POST /api/livros, corpo em JSON),
// mostrar a mensagem retornada pelo servidor em #mensagem
// e, em caso de sucesso, recarregar a tabela e limpar o formulário.
form.addEventListener('submit', async (evento) => {
});

// TODO Extra 3: apagar o livro via fetch (DELETE /api/livros/:id).
// Se der certo, remover a linha (tr) da tabela sem recarregar a página.
// Se der errado (ex.: 403), mostrar a mensagem do servidor em #mensagem.
async function apagar(id, tr) {
}

// TODO Extra 1: buscar GET /api/eu e mostrar
// "Logado como: <usuario> (<perfil>)" no elemento #usuario-logado.

carregarLivros();
