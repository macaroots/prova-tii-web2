const { describe, it } = require('node:test');
const assert = require('node:assert');
const { JSDOM } = require('jsdom');
const { api } = require('./helpers');

async function pagina(rota) {
    const r = await api('GET', rota);
    assert.strictEqual(r.status, 200);
    return new JSDOM(r.texto).window.document;
}
const titulos = doc => [...doc.querySelectorAll('li strong')].map(e => e.textContent);

describe('Questão 4 — Formulário e SSR', () => {
    it('a) /livros tem formulário GET com campo "autor"', async () => {
        const doc = await pagina('/livros');
        const form = doc.querySelector('form');
        assert.ok(form, 'formulário não encontrado');
        assert.strictEqual((form.getAttribute('method') || 'get').toLowerCase(), 'get');
        assert.ok(form.querySelector('[name="autor"]'), 'campo name="autor" não encontrado');
    });

    it('b) sem filtro mostra todos os livros', async () => {
        const doc = await pagina('/livros');
        const t = titulos(doc);
        assert.ok(t.includes('Dom Casmurro') && t.includes('Vidas Secas'));
    });

    it('b) ?autor=Machado mostra só livros do Machado', async () => {
        const doc = await pagina('/livros?autor=Machado');
        const t = titulos(doc);
        assert.ok(t.includes('Dom Casmurro'), 'deveria mostrar Dom Casmurro');
        assert.ok(!t.includes('Vidas Secas'), 'não deveria mostrar Vidas Secas');
    });
});
