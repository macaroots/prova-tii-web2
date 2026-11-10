const { describe, it, before } = require('node:test');
const assert = require('node:assert');
const { login, api, criarLivro } = require('./helpers');

describe('Questão 3 — Autorização', () => {
    let admin, leitor;
    before(async () => {
        admin = await login('admin', 'admin123');
        leitor = await login('leitor', 'leitor123');
    });

    it('leitor NÃO pode apagar livro (403)', async () => {
        const livro = await criarLivro(admin);
        const r = await api('DELETE', '/api/livros/' + livro.id, leitor);
        assert.strictEqual(r.status, 403);
        assert.strictEqual(r.json && r.json.mensagem, 'Acesso negado');
        await api('DELETE', '/api/livros/' + livro.id, admin); // limpeza
    });

    it('admin pode apagar livro', async () => {
        const livro = await criarLivro(admin);
        const r = await api('DELETE', '/api/livros/' + livro.id, admin);
        assert.strictEqual(r.status, 200);
        const lista = await api('GET', '/api/livros', admin);
        assert.ok(!lista.json.some(l => l.id == livro.id), 'o livro não foi apagado (verifique também a Questão 2)');
    });

    it('leitor continua podendo listar e cadastrar', async () => {
        const lista = await api('GET', '/api/livros', leitor);
        assert.strictEqual(lista.status, 200);
        const novo = await api('POST', '/api/livros', leitor, { titulo: 'Teste Leitor', autor: 'X' });
        assert.strictEqual(novo.status, 201);
        await api('DELETE', '/api/livros/' + novo.json.id, admin); // limpeza
    });
});
