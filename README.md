# 💡 Authentication API

Projeto simples para aprender e praticar alguns conceitos do desenvolvimento web (rotas, server, autenticação...) com Nodejs. Quis explorar os fundamentos e entender como as coisas funcionavam, então usei me limitei as ferramentas do próprio node e evitei utilizar frameworks e libs como o Express e o jsonwebtoken.

## 📌 Projeto

Estou atualizando esse projeto sempre que posso e pretendo finalizar integrando com o front e publicando mais para frente. Abaixo é um rascunho que me ajudou a sintetizar as funcionalidades que eu pensei para esse projeto:

![image](https://github.com/FabioBJr/login-authentication-api/blob/main/loginScratch.png)

## 🛠️ Stack
- **Linguagem:** JavaScript, NodeJs
- **Banco de Dados:** PostgreSQL

## ⚙ Como Executar (construindo...)

### 1. Requisitos
- Node.js `v20.6.0+`.
- PostgreSQL `v8.2+` instalado.

### 2. Configuração do `.env`
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```env
DB_USER=seu_usuario
DB_HOST=localhost
DB_NAME=nome_do_database
DB_PASSWORD=sua_senha
DB_PORT=porta_do_bd
JWT_SECRET=chave_para_gerar_token_jwt
