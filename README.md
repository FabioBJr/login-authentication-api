# Web Login
![alt text](image.png)

- Projeto simples para aprender e praticar alguns conceitos do desenvolvimento web (rotas, server, autenticação...) com Nodejs. <br>
Quis explorar os fundamentos e entender como as coisas funcionavam, então me limitei às ferramentas<br> 
do próprio node e evitei utilizar frameworks e libs como o Express e o jsonwebtoken.

- Utilizei um modelo de LLM como uma fonte de consulta para auxiliar no desenvolvimento e na criação do layout no front.

## Sobre
A aplicação lida com as principais rotinas de autenticação de login, <br>
executa as principais validações desse processo e faz a integração <br>
através do protocolo oAuth2 para acesso por meio de outras plataformas

### Funcionalidades
- **Recuperação de conta** com disparo de email.
- Expiração de token de autorização
- **Cadastro/Login** com Github
- **Cadastro/Login** com Google
- **Sicronização de dados** com outras plataformas
- Edição de informações de perfil e avatar

## Como rodar projeto
### Pré-instalação
Garanta que o Node.js `v20.6.0+` e o PostgreSQL `v14+` estão instalados.

### Configuração do `.env`
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```env
#Auth
JWT_SECRET=chave_para_gerar_token_jwt

#Database
DB_USER=seu_usuario
DB_HOST=localhost
DB_NAME=nome_do_banco
DB_PASSWORD=senha_pgadmin
DB_PORT=porta_do_banco

#Mail
MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASS=

#Github
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

#Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

#Facebook
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
```

### Instalação

1. Clone o repositório no teu computador:
    ```bash
    git clone https://github.com/FabioBJr/login-authentication-api.git
    ```
2. Já dentro do projeto instale os pacotes do projeto:
    ```bash
    npm install
    ```
3. Crie a tabela de usuários:
    ```bash
    node src/setup.js
    ```
4. Inicie a aplicação:
    ```bash
    node src/server.js
    ```

### Uso
Acesse localmente pelo navegador `http://localhost:3000`.
