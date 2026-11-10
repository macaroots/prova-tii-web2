// DAO de usuários usando MySQL
class UsuariosMysqlRepository {
    constructor(pool) {
        this.pool = pool;
    }
    async procurarPorUsuario(usuario) {
        const [rows] = await this.pool.query(
            'SELECT * FROM usuarios WHERE usuario = ?',
            [usuario]
        );
        return rows[0];
    }
}
module.exports = UsuariosMysqlRepository;
