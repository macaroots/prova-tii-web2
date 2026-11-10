const { describe, it, before } = require('node:test');
const assert = require('node:assert');
const { JSDOM } = require('jsdom');
const { login, api, criarLivro, carregarPaginaAdmin, esperar, LIVROS_FALSOS } = require('./helpers');

describe('Extra 1 — Usuário logado', () => {
    it('mostra "Logado como: admin (admin)" em #usuario-logado', async () => {
        const { document } = carregarPaginaAdmin((metodo, url) =>
            /\/api\/eu$/.test(url) ? { json: { id: 1, usuario: 'admin', perfil: 'admin' } } : { json: LIVROS_FALSOS });
        await esperar();
        assert.match(document.getElementById('usuario-logado').textContent, /Logado como: admin \(admin\)/);
    });
});

describe('Extra 2 — Alterar', () => {
    it('PUT /api/livros/:id altera o livro', async () => {
        const admin = await login('admin', 'admin123');
        const livro = await criarLivro(admin);
        const r = await api('PUT', '/api/livros/' + livro.id, admin,
            { titulo: 'Titulo Alterado', autor: 'Autor Alterado', ano: 1990, disponivel: false });
        assert.strictEqual(r.status, 200);
        const ver = await api('GET', '/api/livros/' + livro.id, admin);
        assert.strictEqual(ver.json.titulo, 'Titulo Alterado');
        assert.strictEqual(ver.json.autor, 'Autor Alterado');
        assert.strictEqual(ver.json.ano, 1990);
        await api('DELETE', '/api/livros/' + livro.id, admin); // limpeza
    });
});

describe('Extra 3 — Apagar pelo front', () => {
    it('envia DELETE e remove a linha da tabela', async () => {
        const { document, chamadas } = carregarPaginaAdmin((metodo) =>
            metodo == 'DELETE' ? { json: { mensagem: 'Apagado com sucesso' } } : { json: LIVROS_FALSOS });
        await esperar();
        assert.strictEqual(document.querySelectorAll('#lista-livros tr').length, 2);
        document.querySelector('#lista-livros tr .apagar').click();
        await esperar();
        const del = chamadas.find(c => c.metodo == 'DELETE');
        assert.ok(del, 'nenhum fetch com method DELETE');
        assert.match(del.url, /\/api\/livros\/1$/);
        assert.strictEqual(document.querySelectorAll('#lista-livros tr').length, 1, 'a linha não foi removida');
    });

    it('em caso de 403, mantém a linha e mostra a mensagem', async () => {
        const { document } = carregarPaginaAdmin((metodo) =>
            metodo == 'DELETE' ? { status: 403, json: { mensagem: 'Acesso negado' } } : { json: LIVROS_FALSOS });
        await esperar();
        document.querySelector('#lista-livros tr .apagar').click();
        await esperar();
        assert.strictEqual(document.querySelectorAll('#lista-livros tr').length, 2, 'a linha não deveria ser removida');
        assert.strictEqual(document.getElementById('mensagem').textContent.trim(), 'Acesso negado');
    });
});

describe('Extra 4 — Busca melhor', () => {
    it('?autor=machado (minúsculo) encontra Machado de Assis e mantém o campo preenchido', async () => {
        const r = await api('GET', '/livros?autor=machado');
        const doc = new JSDOM(r.texto).window.document;
        const titulos = [...doc.querySelectorAll('li strong')].map(e => e.textContent);
        assert.ok(titulos.includes('Dom Casmurro'), 'deveria encontrar Dom Casmurro');
        assert.ok(!titulos.includes('Vidas Secas'), 'não deveria mostrar Vidas Secas');
        assert.strictEqual(doc.querySelector('[name="autor"]').value, 'machado');
    });
});

describe('Extra 5 — Correção do login', () => {
    it('senha errada NÃO faz login', async () => {
        const token = await login('admin', 'senha-errada');
        assert.strictEqual(token, null, 'logou com senha errada!');
    });
    it('senha certa faz login', async () => {
        assert.ok(await login('admin', 'admin123'));
    });
});
