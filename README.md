# Prova — Desenvolvimento Web (Node.js + Express)

**Duração: 2 horas.** Consulta liberada a materiais da disciplina e à documentação oficial. Não é permitido usar IA nem trocar código com colegas.

O sistema é uma **Biblioteca**: catálogo público de livros e área administrativa com login. Uma parte já funciona; você deve completar o que falta. Os pontos a completar estão marcados no código com `TODO Questão N`.

## Como rodar

Requisitos: Git e Docker Compose ([instalação](https://docs.docker.com/compose/install/)).

```sh
git clone <URL_DO_REPOSITORIO_DA_PROVA> prova-web
cd prova-web
docker compose up
```

- Aplicação: http://localhost:3000
- O MySQL sobe junto e é criado a partir de `bd/init.sql` (porta 3307 na sua máquina).
- O servidor reinicia sozinho ao salvar arquivos (`node --watch`).
- Para recriar o banco do zero: `docker compose down -v && docker compose up`.

Usuários cadastrados:

| usuário | senha     | perfil |
|---------|-----------|--------|
| admin   | admin123  | admin  |
| leitor  | leitor123 | leitor |

### Testando a API pela linha de comando

```sh
# login (guarda o cookie com o token JWT em cookies.txt)
curl -c cookies.txt -d usuario=admin -d senha=admin123 http://localhost:3000/login

# listar
curl -b cookies.txt http://localhost:3000/api/livros

# inserir (JSON)
curl -b cookies.txt -H 'Content-Type: application/json' \
     -d '{"titulo":"Iracema","autor":"José de Alencar","ano":1865,"disponivel":true}' \
     http://localhost:3000/api/livros

# ver / alterar / apagar
curl -b cookies.txt http://localhost:3000/api/livros/1
curl -b cookies.txt -X PUT -H 'Content-Type: application/json' \
     -d '{"titulo":"Dom Casmurro","autor":"Machado de Assis","ano":1900,"disponivel":false}' \
     http://localhost:3000/api/livros/1
curl -b cookies.txt -X DELETE http://localhost:3000/api/livros/1
```

## Estrutura

```
docker-compose.yml        containers node + mysql
bd/init.sql               criação das tabelas e dados iniciais
app/
  express.js              servidor, middlewares, login e rotas
  controllers/            Controllers (MVC): CrudController, LivrosController
  lib/                    Services (regras) e Repositories (DAO / MySQL)
  views/catalogo.ejs      View renderizada no servidor (SSR)
  public/                 arquivos estáticos (HTML, CSS, JS do front-end)
```

Fluxo: `rota → Controller → Service → Repository (DAO) → MySQL`.

---

## Questões

### Questão 0 — Git: entrega e histórico (1,5 ponto)

1. Crie um repositório **privado** no GitHub (ou GitLab) e dê acesso ao professor.
2. Aponte o remoto do clone para o seu repositório e envie:
   ```sh
   git remote set-url origin <URL_DO_SEU_REPOSITORIO>
   git push -u origin main
   ```
3. Faça **pelo menos um commit por questão**, com mensagem descritiva (ex.: `Questão 2: implementa ver e deletar no DAO`).
4. Ao final, faça `git push` de **todas** as branches.

> Avaliado: commits pequenos e com mensagens claras, histórico coerente, entrega no prazo. Commits após o horário da prova não serão considerados.

### Questão 1 — Sessão (1,5 ponto)

Em `app/express.js`:

a) Crie `GET /logout`, que apaga o cookie `token` e redireciona para `/`.

b) Crie `GET /api/eu`, **protegida** pelo middleware `autenticar`, que responde em JSON o usuário logado (`id`, `usuario`, `perfil`). Sem login, deve responder `401`.

### Questão 2 — DAO e CRUD REST (2,5 pontos)

Em `app/lib/LivrosMysqlRepository.js`, implemente `ver(id)` e `deletar(id)` usando SQL com parâmetros (`?`). Os métodos `inserir` e `listar` servem de exemplo.

| Método | Rota              | Resposta esperada                            |
|--------|-------------------|----------------------------------------------|
| GET    | `/api/livros/:id` | JSON do livro; `404` se não existir          |
| DELETE | `/api/livros/:id` | apaga o livro; ele some do GET `/api/livros` |

### Questão 3 — Autorização (2,0 pontos)

Em `app/express.js`, complete o middleware `autorizar(perfil)`: ele só deixa a requisição seguir se `req.usuario.perfil` for igual a `perfil`; caso contrário, responde `403` com `{ "mensagem": "Acesso negado" }`.

Depois, em `app/controllers/LivrosController.js`, aplique-o na rota `DELETE` para que **apenas o perfil `admin` possa apagar livros**. 

### Questão 4 — Formulário e SSR (1,0 ponto)

A página pública http://localhost:3000/livros é renderizada no servidor (`views/catalogo.ejs`).

a) Adicione um formulário com `method="get"` e um campo `autor`.

b) No método `catalogo` do `LivrosController`, mostre apenas os livros cujo autor contém o texto de `req.query.autor` (dica: `filter` e `includes`). Sem filtro, mostra todos.

### Questão 5 — Front-end: DOM e AJAX (1,5 ponto)

Em `app/public/js/livros.js` (página `admin/livros.html`), complete o evento `submit` do formulário para cadastrar **sem recarregar a página**:

1. cancele o envio padrão (`event.preventDefault()`);
2. envie os dados com `fetch` para `POST /api/livros` em **JSON**;
3. mostre a mensagem retornada pelo servidor no elemento `#mensagem`;
4. se der certo, chame `carregarLivros()` para atualizar a tabela.

---

## Pontos extras (até +3,0)

Faça só se terminar as questões. Extras 1 a 4 valem **+0,5** cada; o Extra 5 vale **+1,0**. Cada um com commit próprio.

- **Extra 1 — Usuário logado:** em `livros.js`, use `fetch('/api/eu')` para mostrar `Logado como: <usuario> (<perfil>)` em `#usuario-logado`.
- **Extra 2 — Alterar:** implemente `alterar(id, livro)` no DAO, para que `PUT /api/livros/:id` funcione.
- **Extra 3 — Apagar pelo front:** implemente `apagar(id, tr)` em `livros.js` com `fetch` (`DELETE`). Se der certo, remova a linha da tabela; se não (ex.: `403`), mostre a mensagem em `#mensagem`.
- **Extra 4 — Busca melhor:** na Questão 4, ignore maiúsculas/minúsculas (`machado` encontra "Machado de Assis") e mantenha o campo preenchido com o texto pesquisado.

### Extra 5 — Correção de erro com branch (+1,0)

**Bug reportado:** _"Consigo entrar como `admin` digitando qualquer senha."_

1. Crie uma branch chamada `correcao-login` a partir da `main`.
2. Encontre e corrija o erro (dica: está na camada de serviço).
3. Faça o commit na branch `correcao-login`.
4. Volte para a `main` e faça o **merge** da `correcao-login`.
5. Envie as duas branches para o remoto.
6. Na seção **Respostas** ao final deste README, explique em até 3 linhas a causa do erro.

---

## Pontuação

| Questão | Assunto                                  | Pontos |
|---------|------------------------------------------|-------:|
| 0       | Git: versionamento e entrega             | 1,5 |
| 1       | Sessão (cookie/JWT), rotas Express       | 1,5 |
| 2       | DAO, banco de dados, CRUD REST           | 2,5 |
| 3       | Controle de acesso (autorização)         | 2,0 |
| 4       | Formulário GET, MVC, SSR                 | 1,0 |
| 5       | DOM, AJAX (fetch), JSON                  | 1,5 |
|         | **Total**                                | **10,0** |
|         | Extras                                   | até +3,0 |

Sugestão de tempo: Q0 (10 min), Q1 (15 min), Q2 (25 min), Q3 (20 min), Q4 (15 min), Q5 (20 min). Sobram ~15 min para revisão e extras.

## Entrega

Envie o **link do seu repositório** na atividade da disciplina até o fim do horário da prova. Será avaliado o último commit enviado dentro do prazo.

---

## Respostas

**Nome:**

**Extra 5 — causa do erro:**

