const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

const LivrosMysqlRepository = require('./lib/LivrosMysqlRepository');
const UsuariosMysqlRepository = require('./lib/UsuariosMysqlRepository');
const LivrosService = require('./lib/LivrosService');
const UsuariosService = require('./lib/UsuariosService');
const LivrosController = require('./controllers/LivrosController');

const app = express();
const port = 3000;

// Banco de dados (pool de conexões)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

// Camadas: Controller -> Service -> Repository (DAO)
const livrosService = new LivrosService(new LivrosMysqlRepository(pool));
const usuariosService = new UsuariosService(new UsuariosMysqlRepository(pool));
const livrosController = new LivrosController(livrosService);

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// ---------- Controle de acesso ----------

// Autenticação: verifica o token JWT guardado no cookie
function autenticar(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ mensagem: 'Não autenticado' });
    }
    jwt.verify(token, process.env.SEGREDO_JWT, (err, decoded) => {
        if (err) {
            return res.status(401).json({ mensagem: 'Token inválido' });
        }
        req.usuario = decoded.usuario;
        next();
    });
}

// TODO Questão 3: implementar o middleware de autorização.
// Deve permitir seguir (next) apenas se req.usuario.perfil for igual a `perfil`.
// Caso contrário, responder 403 com JSON { mensagem: 'Acesso negado' }.
function autorizar(perfil) {
    return (req, res, next) => {
        next();
    };
}

// ---------- Rotas ----------

// Página pública com SSR (Server Side Rendering)
app.get('/livros', livrosController.catalogo.bind(livrosController));

// API REST de livros (protegida)
app.use('/api/livros', autenticar, livrosController.getRouter(autorizar));

app.post('/login', async (req, res) => {
    try {
        const usuario = await usuariosService.logar(req.body.usuario, req.body.senha);
        const token = jwt.sign({ usuario }, process.env.SEGREDO_JWT, { expiresIn: '1h' });
        res.cookie('token', token, { maxAge: 60 * 60 * 1000, httpOnly: true, sameSite: true });
        res.redirect('/admin/livros.html');
    } catch (e) {
        res.status(401).send('Falha no login: ' + e.message + ' <a href="/">voltar</a>');
    }
});

// TODO Questão 1: implementar as rotas abaixo.
// GET /logout  -> apaga o cookie 'token' e redireciona para '/'
// GET /api/eu  -> (protegida por autenticar) responde JSON com o usuário logado (id, usuario, perfil)

app.listen(port, () => {
    console.log(`Servidor ouvindo na porta ${port}`);
});
