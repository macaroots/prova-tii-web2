// DAO (Data Access Object) de livros usando MySQL
class LivrosMysqlRepository {
    constructor(pool) {
        this.pool = pool;
    }

    async inserir(livro) {
        const [result] = await this.pool.query(
            'INSERT INTO livros (titulo, autor, ano, disponivel) VALUES (?, ?, ?, ?)',
            [livro.titulo, livro.autor, livro.ano, livro.disponivel]
        );
        return result.insertId;
    }

    async listar() {
        const [rows] = await this.pool.query('SELECT * FROM livros ORDER BY titulo');
        return rows;
    }

    // TODO Questão 2: retornar o livro com o id informado (ou undefined se não existir)
    async ver(id) {
    }

    // TODO Extra 2: atualizar titulo, autor, ano e disponivel do livro com o id informado
    async alterar(id, livro) {
    }

    // TODO Questão 2: apagar o livro com o id informado
    async deletar(id) {
    }
}
module.exports = LivrosMysqlRepository;
