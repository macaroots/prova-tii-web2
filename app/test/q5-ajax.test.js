const { describe, it } = require('node:test');
const assert = require('node:assert');
const { carregarPaginaAdmin, esperar, LIVROS_FALSOS } = require('./helpers');

function preencherEEnviar(doc, titulo) {
    const form = doc.getElementById('form-livro');
    form.querySelector('[name="titulo"]').value = titulo;
    form.querySelector('[name="autor"]').value = 'Autor X';
    form.querySelector('[name="ano"]').value = '1999';
    const evento = new doc.defaultView.Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(evento);
    return evento;
}

describe('Questão 5 — DOM e AJAX', () => {
    it('cancela o envio padrão do formulário', async () => {
        const { document } = carregarPaginaAdmin(() => ({ json: LIVROS_FALSOS }));
        await esperar();
        const evento = preencherEEnviar(document, 'Novo');
        assert.ok(evento.defaultPrevented, 'faltou evento.preventDefault()');
    });

    it('envia POST /api/livros com os dados em JSON', async () => {
        const { document, chamadas } = carregarPaginaAdmin((metodo) =>
            metodo == 'POST' ? { status: 201, json: { mensagem: 'Cadastrado com sucesso', id: 9 } } : { json: LIVROS_FALSOS });
        await esperar();
        preencherEEnviar(document, 'Novo Livro');
        await esperar();
        const post = chamadas.find(c => c.metodo == 'POST');
        assert.ok(post, 'nenhum fetch com method POST');
        assert.match(post.url, /\/api\/livros$/);
        const tipo = post.headers['content-type'];
        assert.match(String(tipo), /application\/json/, 'faltou o cabeçalho Content-Type: application/json');
        const corpo = JSON.parse(post.corpo);
        assert.strictEqual(corpo.titulo, 'Novo Livro');
        assert.strictEqual(corpo.autor, 'Autor X');
    });

    it('mostra a mensagem do servidor e recarrega a tabela', async () => {
        const { document, chamadas } = carregarPaginaAdmin((metodo) =>
            metodo == 'POST' ? { status: 201, json: { mensagem: 'Cadastrado com sucesso', id: 9 } } : { json: LIVROS_FALSOS });
        await esperar();
        const getsAntes = chamadas.filter(c => c.metodo == 'GET' && /\/api\/livros$/.test(c.url)).length;
        preencherEEnviar(document, 'Novo Livro');
        await esperar();
        assert.strictEqual(document.getElementById('mensagem').textContent.trim(), 'Cadastrado com sucesso');
        const getsDepois = chamadas.filter(c => c.metodo == 'GET' && /\/api\/livros$/.test(c.url)).length;
        assert.ok(getsDepois > getsAntes, 'a tabela não foi recarregada (carregarLivros)');
    });

    it('mostra a mensagem de erro do servidor', async () => {
        const { document } = carregarPaginaAdmin((metodo) =>
            metodo == 'POST' ? { status: 400, json: { mensagem: 'Título não pode ser em branco!' } } : { json: LIVROS_FALSOS });
        await esperar();
        preencherEEnviar(document, '');
        await esperar();
        assert.strictEqual(document.getElementById('mensagem').textContent.trim(), 'Título não pode ser em branco!');
    });
});
