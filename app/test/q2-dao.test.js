const { describe, it, before } = require('node:test');
const assert = require('node:assert');
const { login, api, criarLivro } = require('./helpers');

describe('Questão 2 — DAO e CRUD REST', () => {
    let admin;
    before(async () => { admin = await login('admin', 'admin123'); });

    it('GET /api/livros/:id devolve o livro', async () => {
        const livro = await criarLivro(admin);
        const r = await api('GET', '/api/livros/' + livro.id, admin);
        assert.strictEqual(r.status, 200);
        assert.ok(r.json, 'a resposta deve ser JSON');
        assert.strictEqual(r.json.id, livro.id);
        assert.strictEqual(r.json.titulo, livro.titulo);
        assert.strictEqual(r.json.autor, livro.autor);
    });

    it('GET /api/livros/:id inexistente responde 404', async () => {
        const r = await api('GET', '/api/livros/999999', admin);
        assert.strictEqual(r.status, 404);
    });

    it('DELETE /api/livros/:id apaga o livro', async () => {
        const livro = await criarLivro(admin);
        const r = await api('DELETE', '/api/livros/' + livro.id, admin);
        assert.strictEqual(r.status, 200);
        const lista = await api('GET', '/api/livros', admin);
        assert.ok(!lista.json.some(l => l.id == livro.id), 'o livro ainda aparece na listagem');
    });
});
