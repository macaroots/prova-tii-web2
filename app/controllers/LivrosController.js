const express = require('express');
const CrudController = require('./CrudController');

class LivrosController extends CrudController {
    getRouter(autorizar) {
        const router = express.Router();
        router.post('/', this.inserir.bind(this));
        router.get('/', this.listar.bind(this));
        router.get('/:id', this.ver.bind(this));
        router.put('/:id', this.alterar.bind(this));
        // TODO Questão 3: somente usuários com perfil 'admin' podem apagar livros
        router.delete('/:id', this.deletar.bind(this));
        return router;
    }

    getBeanFromRequest(req) {
        return {
            titulo: req.body.titulo,
            autor: req.body.autor,
            ano: req.body.ano ? parseInt(req.body.ano) : null,
            disponivel: req.body.disponivel === true || req.body.disponivel === 'true' || req.body.disponivel === 'on',
        };
    }

    // SSR: renderiza a lista de livros no servidor
    async catalogo(req, res) {
        // TODO Questão 4: filtrar pelo autor recebido na query string (?autor=...)
        const livros = await this.service.listar();
        res.render('catalogo', { livros });
    }
}
module.exports = LivrosController;
