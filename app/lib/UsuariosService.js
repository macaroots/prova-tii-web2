const bcrypt = require('bcrypt');

class UsuariosService {
    constructor(repository) {
        this.repository = repository;
    }
    async logar(usuario, senha) {
        const usuarioBanco = await this.repository.procurarPorUsuario(usuario);
        if (usuarioBanco && bcrypt.compare(senha, usuarioBanco.senha)) {
            return { id: usuarioBanco.id, usuario: usuarioBanco.usuario, perfil: usuarioBanco.perfil };
        }
        throw new Error('Usuário ou senha inválidos!');
    }
}
module.exports = UsuariosService;
