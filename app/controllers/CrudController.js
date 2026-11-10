const express = require('express');

// Controller genérico com as rotas REST de um CRUD
class CrudController {
    constructor(service) {
        this.service = service;
    }
    getRouter() {
        const router = express.Router();
        router.post('/', this.inserir.bind(this));
        router.get('/', this.listar.bind(this));
        router.get('/:id', this.ver.bind(this));
        router.put('/:id', this.alterar.bind(this));
        router.delete('/:id', this.deletar.bind(this));
        return router;
    }
    getBeanFromRequest(req) {
        return {};
    }
    async inserir(req, res) {
        try {
            const bean = this.getBeanFromRequest(req);
            const id = await this.service.inserir(bean);
            res.status(201).json({ mensagem: 'Cadastrado com sucesso', id });
        } catch (e) {
            res.status(400).json({ mensagem: e.message });
        }
    }
    async listar(req, res) {
        res.json(await this.service.listar());
    }
    async ver(req, res) {
        const bean = await this.service.ver(req.params.id);
        if (!bean) {
            return res.status(404).json({ mensagem: 'Não encontrado' });
        }
        res.json(bean);
    }
    async alterar(req, res) {
        try {
            const bean = this.getBeanFromRequest(req);
            await this.service.alterar(req.params.id, bean);
            res.json({ mensagem: 'Alterado com sucesso' });
        } catch (e) {
            res.status(400).json({ mensagem: e.message });
        }
    }
    async deletar(req, res) {
        await this.service.deletar(req.params.id);
        res.json({ mensagem: 'Apagado com sucesso' });
    }
}
module.exports = CrudController;
