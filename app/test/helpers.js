// Funções de apoio para os testes. Não é preciso alterar este arquivo.
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const BASE = process.env.BASE_URL || 'http://localhost:3000';

// Faz login e devolve o cookie "token=..."
async function login(usuario, senha) {
    const res = await fetch(BASE + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ usuario, senha }),
        redirect: 'manual',
    });
    const setCookie = res.headers.get('set-cookie') || '';
    const token = setCookie.split(';')[0];
    return token.startsWith('token=') && token.length > 'token='.length ? token : null;
}

// Requisição à API com cookie e JSON
async function api(metodo, rota, cookie, corpo) {
    const opcoes = { method: metodo, headers: {}, redirect: 'manual' };
    if (cookie) opcoes.headers.Cookie = cookie;
    if (corpo) {
        opcoes.headers['Content-Type'] = 'application/json';
        opcoes.body = JSON.stringify(corpo);
    }
    const res = await fetch(BASE + rota, opcoes);
    const texto = await res.text();
    let json;
    try { json = JSON.parse(texto); } catch { json = undefined; }
    return { status: res.status, headers: res.headers, texto, json };
}

// Cria um livro de teste (inserir já funciona na versão inicial)
async function criarLivro(cookie, dados = {}) {
    const livro = { titulo: 'Livro de Teste ' + Date.now(), autor: 'Autor Teste', ano: 2000, disponivel: true, ...dados };
    const r = await api('POST', '/api/livros', cookie, livro);
    return { ...livro, id: r.json && r.json.id };
}

// Carrega admin/livros.html + js/livros.js num navegador simulado (jsdom).
// `responder(metodo, url, corpo)` define o que o fetch simulado devolve: { status, json }.
function carregarPaginaAdmin(responder) {
    const publico = path.join(__dirname, '..', 'public');
    const html = fs.readFileSync(path.join(publico, 'admin', 'livros.html'), 'utf8')
        .replace(/<script[^>]*src=[^>]*><\/script>/g, '');
    const script = fs.readFileSync(path.join(publico, 'js', 'livros.js'), 'utf8');

    const dom = new JSDOM(html, { url: 'http://localhost/admin/livros.html', runScripts: 'outside-only' });
    const chamadas = [];
    dom.window.fetch = async (url, opcoes = {}) => {
        const metodo = (opcoes.method || 'GET').toUpperCase();
        const chamada = { url: String(url), metodo, headers: Object.fromEntries(new Headers(opcoes.headers || {})), corpo: opcoes.body };
        chamadas.push(chamada);
        const { status = 200, json = {} } = responder(metodo, chamada.url, chamada.corpo) || {};
        return new Response(JSON.stringify(json), { status, headers: { 'Content-Type': 'application/json' } });
    };
    dom.window.eval(script);
    return { window: dom.window, document: dom.window.document, chamadas };
}

const esperar = (ms = 100) => new Promise(r => setTimeout(r, ms));

const LIVROS_FALSOS = [
    { id: 1, titulo: 'Livro A', autor: 'Autor A', ano: 2001, disponivel: 1 },
    { id: 2, titulo: 'Livro B', autor: 'Autor B', ano: 2002, disponivel: 0 },
];

module.exports = { BASE, login, api, criarLivro, carregarPaginaAdmin, esperar, LIVROS_FALSOS };
