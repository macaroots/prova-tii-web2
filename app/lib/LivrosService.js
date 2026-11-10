// Regras de negócio de livros
class LivrosService {
    constructor(repository) {
        this.repository = repository;
    }
    validar(livro) {
        if (!livro.titulo) {
            throw new Error('Título não pode ser em branco!');
        }
        if (!livro.autor) {
            throw new Error('Autor não pode ser em branco!');
        }
    }
    async inserir(livro) {
        this.validar(livro);
        return this.repository.inserir(livro);
    }
    async listar() {
        return this.repository.listar();
    }
    async ver(id) {
        return this.repository.ver(id);
    }
    async alterar(id, livro) {
        this.validar(livro);
        return this.repository.alterar(id, livro);
    }
    async deletar(id) {
        return this.repository.deletar(id);
    }
}
module.exports = LivrosService;
