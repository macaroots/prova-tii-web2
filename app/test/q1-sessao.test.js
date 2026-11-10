const { describe, it, before } = require('node:test');
const assert = require('node:assert');
const { login, api } = require('./helpers');

describe('Questão 1 — Sessão', () => {
    let admin;
    before(async () => { admin = await login('admin', 'admin123'); });

    it('a) GET /logout redireciona para /', async () => {
        const r = await api('GET', '/logout', admin);
        assert.ok([301, 302, 303, 307].includes(r.status), `esperava redirecionamento, recebeu ${r.status}`);
        assert.strictEqual(r.headers.get('location'), '/');
    });

    it('a) GET /logout apaga o cookie token', async () => {
        const r = await api('GET', '/logout', admin);
        const setCookie = r.headers.get('set-cookie') || '';
        assert.match(setCookie, /token=;/, 'o cookie "token" deve ser apagado');
    });

    it('b) GET /api/eu sem login responde 401', async () => {
        const r = await api('GET', '/api/eu');
        assert.strictEqual(r.status, 401);
    });

    it('b) GET /api/eu com login responde o usuário em JSON', async () => {
        const r = await api('GET', '/api/eu', admin);
        assert.strictEqual(r.status, 200);
        assert.ok(r.json, 'a resposta deve ser JSON');
        assert.strictEqual(r.json.usuario, 'admin');
        assert.strictEqual(r.json.perfil, 'admin');
    });
});
