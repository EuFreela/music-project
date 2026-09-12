<div align="center">

<!-- Banner (Dark) -->
<div class="gh-dark-mode-only">
  <div style="display: inline-block; padding: 32px 40px; border-radius: 20px; border: 1px solid #222222; background: #000000; text-align: center; font-family: Inter, system-ui, sans-serif;">
    <div style="font-size: 44px;">🎵</div>
    <div style="font-size: 28px; font-weight: 700; color: #FFFFFF; margin-top: 8px;">Music Project Manager</div>
    <div style="font-size: 14px; color: #A1A1AA; margin-top: 6px;">Registro e gerenciamento de projetos musicais</div>
    <div style="margin-top: 18px;">
      <span style="display: inline-block; background: rgba(168,85,247,0.15); color: #C084FC; border: 1px solid rgba(168,85,247,0.4); border-radius: 999px; padding: 4px 14px; font-size: 12px;">Dual theme · claro/escuro</span>&nbsp;
      <span style="display: inline-block; background: #1a1a1a; color: #FFFFFF; border: 1px solid #222222; border-radius: 999px; padding: 4px 14px; font-size: 12px;">🎤 Artistas &amp; Lançamentos</span>
    </div>
  </div>
</div>

<!-- Banner (Light) -->
<div class="gh-light-mode-only">
  <div style="display: inline-block; padding: 32px 40px; border-radius: 20px; border: 1px solid #E5E5E5; background: #FFFFFF; box-shadow: 0 1px 2px rgba(0,0,0,0.06); text-align: center; font-family: Inter, system-ui, sans-serif;">
    <div style="font-size: 44px;">🎵</div>
    <div style="font-size: 28px; font-weight: 700; color: #171717; margin-top: 8px;">Music Project Manager</div>
    <div style="font-size: 14px; color: #737373; margin-top: 6px;">Registro e gerenciamento de projetos musicais</div>
    <div style="margin-top: 18px;">
      <span style="display: inline-block; background: rgba(168,85,247,0.08); color: #9333EA; border: 1px solid rgba(168,85,247,0.3); border-radius: 999px; padding: 4px 14px; font-size: 12px;">Dual theme · claro/escuro</span>&nbsp;
      <span style="display: inline-block; background: #F5F5F5; color: #171717; border: 1px solid #E5E5E5; border-radius: 999px; padding: 4px 14px; font-size: 12px;">🎤 Artistas &amp; Lançamentos</span>
    </div>
  </div>
</div>

<br/>

<!-- Badges -->
<a href="https://www.python.org/"><img alt="Python" src="https://img.shields.io/badge/Python-3.13-9333EA?style=for-the-badge&logo=python&logoColor=white"/></a>
<a href="https://fastapi.tiangolo.com/"><img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-0.115-A855F7?style=for-the-badge&logo=fastapi&logoColor=white"/></a>
<a href="https://react.dev/"><img alt="React" src="https://img.shields.io/badge/React-18-7C3AED?style=for-the-badge&logo=react&logoColor=white"/></a>
<a href="https://vite.dev/"><img alt="Vite" src="https://img.shields.io/badge/Vite-6-C084FC?style=for-the-badge&logo=vite&logoColor=white"/></a>
<a href="https://tailwindcss.com/"><img alt="Tailwind CSS" src="https://img.shields.io/badge/TailwindCSS-3-8B5CF6?style=for-the-badge&logo=tailwindcss&logoColor=white"/></a>
<a href="https://www.mysql.com/"><img alt="MySQL" src="https://img.shields.io/badge/MySQL-8-7E22CE?style=for-the-badge&logo=mysql&logoColor=white"/></a>
<a href="https://www.sqlalchemy.org/"><img alt="SQLAlchemy" src="https://img.shields.io/badge/SQLAlchemy-2-6D28D9?style=for-the-badge&logo=sqlalchemy&logoColor=white"/></a>
<a href="https://alembic.sqlalchemy.org/"><img alt="Alembic" src="https://img.shields.io/badge/Alembic-1.19-A855F7?style=for-the-badge"/></a>
<a href="https://jwt.io/"><img alt="JWT" src="https://img.shields.io/badge/Auth-JWT-9333EA?style=for-the-badge&logo=jsonwebtokens&logoColor=white"/></a>
<a href="https://github.com/EuFreela/music-project/releases"><img alt="Versão" src="https://img.shields.io/github/v/tag/EuFreela/music-project?style=for-the-badge&label=versão&color=A855F7"/></a>

<br/>

**FastAPI** · **React** · **MySQL** · **Alembic**

_O registro completo dos projetos musicais de Lameck — artistas, álbuns, EPs e singles, com capas, ISRC, finanças e links de distribuição em um único painel._

<br/>

<a href="#sobre">Sobre</a> · <a href="#funcionalidades">Funcionalidades</a> · <a href="#dados-por-projeto">Dados por projeto</a> · <a href="#stack">Stack</a> · <a href="#instalacao">Instalação</a> · <a href="#migracoes">Migrações</a> · <a href="#estrutura">Estrutura</a> · <a href="#api">API</a> · <a href="#seguranca">Segurança</a>

</div>

---

## 🎯 Sobre o projeto <a id="sobre"></a>

O **Music Project Manager** nasceu de uma necessidade real e pessoal: **colocar ordem nos projetos musicais de Lameck**. Faltava a centralização dos registros de cada projeto.

Este sistema é essa **base central** — onde todo projeto musical tem seus dados organizados: do artista e tipo de lançamento às faixas, dados de catálogo, finanças, colaboradores, arquivos e distribuição.

> 🎧 *"A música é a arte — o catálogo é o patrimônio."*

| Não é | É |
|---|---|
| ❌ Planilha ou lista de tarefas | ✅ Registro técnico completo de lançamentos |
| ❌ Editor de áudio/DAW | ✅ Organização de capas, faixas, ISRC e metadados |
| ❌ Rede social | ✅ Painel pessoal do artista/gestor com JWT |

---

## ✨ Funcionalidades <a id="funcionalidades"></a>

| | | |
|---|---|---|
| 🎤 **Artistas** | Página do artista com foto, bio, redes sociais e todos os lançamentos organizados por **Álbuns, EPs e Singles** | |
| 💿 **Capas** | Upload de capa por projeto e foto do artista — arquivos protegidos por autenticação | |
| 🎵 **Faixas** | Número, **duração em texto livre** (ex.: "3:45"), **letra + tradução** (EN \| PT lado a lado), **ISRC**, **áudio MP3** sem limite de tamanho e **link da letra** | |
| 🌐 **Distribuição** | Links para Spotify, Apple Music, YouTube Music, Deezer, site e redes sociais + flag **"Distribuído"** | |
| 🏷️ **Catálogo** | Gravadora (label), **distribuidora** (ex.: ONErpm, DistroKid), **UPC**, plataforma e data de lançamento | |
| 💰 **Finanças** | Orçamento, receita e resultado por projeto | |
| 👥 **Colaboradores** | Diretório de produtores, engenheiros e parceiros por projeto | |
| 📁 **Arquivos** | Upload seguro de áudio, imagens e documentos (até 50MB, nunca servidos publicamente) | |
| 🔎 **Busca & filtros** | Pesquisa por nome/artista/gênero e filtro por status (planejamento → produção → lançado) | |
| 🌗 **Dual theme** | Interface clara/escura com acento roxo (Tailwind CSS) | |
| 📝 **Markdown** | Textos descritivos (biografia, sobre o álbum, notas, letra/tradução) aceitam **Markdown** para estilização; **bio do artista expansível** (ver mais/ver menos) | |
| 🎬 **Clipe musical por faixa** | Link do **YouTube** de cada música, tocando **dentro do sistema** no botão "▶ Clipe" (aceita `watch?v=`, `youtu.be`, `shorts`, `live`) | |
| 🔐 **Autenticação JWT** | Login único do admin com rate limiting (5 tentativas / 5 min) | |
| 👤 **Minha conta** | Troca de **e-mail** e **senha**, avatar **pré-definido (DiceBear Clay)** ou **imagem própria** | |
| ⏱️ **Duração total do álbum** | Soma das durações das faixas exibida no cabeçalho e na aba Geral do projeto | |
| 🗄️ **Migrações Alembic** | Schema versionado no banco — "o Git do banco de dados" | |

---

## 📋 Dados registrados em cada projeto <a id="dados-por-projeto"></a>

Cada projeto no sistema guarda **todos os dados necessários para o registro de um lançamento musical**:

| Grupo | Dados |
|---|---|
| 🎤 **Artista** | Nome, foto, bio, gênero, cidade/estado e redes sociais |
| 💿 **Identificação** | Nome do projeto, tipo (**Álbum, EP ou Single**), status, data de lançamento, capa e **"Sobre o Álbum"** (descrição em Markdown) |
| 🏷️ **Catálogo** | Gravadora (label), **distribuidora**, **UPC** e plataforma de distribuição |
| 🎵 **Faixas** | Número, título, duração, **letra + tradução** (leitura multilíngue linha por linha), **ISRC**, **áudio MP3** (upload + player protegido, sem limite de tamanho) e **link da letra** |
| 💰 **Finanças** | Orçamento, receita e resultado do projeto |
| 👥 **Colaboradores** | Produtores, engenheiros e parceiros envolvidos |
| 📁 **Arquivos** | Capas, áudios, imagens e documentos (protegidos por autenticação) |
| 🌐 **Distribuição** | Link de onde a música foi publicada — no projeto **e em cada faixa** (Spotify, Apple Music, YouTube Music etc.) | |
| 📝 **Registro** | Datas de criação e atualização automáticas |

---

## 🧰 Stack <a id="stack"></a>

| Camada | Tecnologia |
|---|---|
| **Frontend** | React 18 · Vite 6 · Tailwind CSS 3 (`darkMode: class`) · Axios |
| **Backend** | Python 3.10+ · FastAPI · SQLAlchemy 2 · Pydantic v2 |
| **Banco** | MySQL 8+ (UTF-8mb4) · **Alembic** (migrações versionadas) |
| **Auth** | JWT (python-jose) · bcrypt (passlib) |
| **Segurança** | Rate limiting (slowapi) · Uploads validados por tipo/tamanho · CORS restrito |
| **Infra** | Windows · localhost · Vite dev server (proxy `/api` → `:8000`) |

---

## 🚀 Instalação <a id="instalacao"></a>

### Requisitos

- Python 3.10+
- Node.js 18+
- MySQL 8+

### 1. Banco de dados

```sql
CREATE DATABASE music_project CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
copy .env.example .env         # defina ADMIN_EMAIL etc.
python -m uvicorn main:app --reload --port 8000
```

> ⚠️ Na **1ª execução** as migrações Alembic criam as tabelas e o admin é criado automaticamente — a senha é mostrada no terminal. Anote!
>
> 💡 Dica: defina `ADMIN_EMAIL` **e `ADMIN_PASSWORD`** no `.env` — nesse caso o sistema **sincroniza essas credenciais no banco a cada startup** (o `.env` vira a fonte da verdade do login). Com `ADMIN_PASSWORD` vazio, a senha aleatória é gerada apenas na 1ª execução.
>
> O startup executa `alembic upgrade head` sozinho. Você só precisa rodar o `uvicorn` — nada de `create_all` manual.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse **http://localhost:5173** (o Vite já faz proxy `/api` → `localhost:8000`).

---

## 🗄️ Migrações (Alembic) <a id="migracoes"></a>

O schema do banco é versionado como código. Toda mudança de tabela vira um **migration script** — nada de `ALTER TABLE` na mão.

| Comando | O que faz |
|---|---|
| `alembic upgrade head` | Aplica as migrações pendentes (rodado automaticamente no startup) |
| `alembic revision --autogenerate -m "descricao"` | Gera uma migração a partir das diferenças entre models e banco |
| `alembic current` | Mostra em qual revisão o banco está |
| `alembic history` | Mostra o histórico de migrações |
| `alembic downgrade -1` | Desfaz a última migração (rollback) |

> ⚙️ A URL do banco vem do `backend/.env` (`config.py`) — o `alembic.ini` não guarda credenciais. Rodar sempre dentro de `backend/`.

---

## 🖥️ Atalho Windows — `start.bat` <a id="atalho"></a>

O arquivo `start.bat` na raiz do projeto **sobe o ambiente de desenvolvimento inteiro com um duplo clique**:

1. **Backend** — abre um terminal executando `uvicorn main:app --port 8000 --reload` (API + Swagger em `http://localhost:8000/docs`)
2. **Frontend** — abre outro terminal com `npm run dev` (Vite em `http://localhost:5173`)

```bat
start.bat
```

> 💡 Dica: em vez de abrir dois terminais na mão, use o `start.bat` — cada serviço fica em uma janela separada para você ver os logs com clareza (incluindo o Alembic aplicando migrações no backend).

---

## 📂 Estrutura do projeto <a id="estrutura"></a>

```text
music-project/
├── backend/
│   ├── main.py              # FastAPI + lifespan (migrações Alembic, admin)
│   ├── models.py            # ORM: Artist, Project, Track, Collaborator, ProjectFile
│   ├── schemas.py           # Pydantic: validação de entrada/saída
│   ├── security.py          # JWT, bcrypt, rate limiting
│   ├── seeder.py            # Cria admin na 1ª execução
│   ├── slug.py              # Slug legível por humanos (minúsculas, _ no lugar de espaço)
│   ├── upload_paths.py      # Convenção das pastas de upload: <artista>/<álbum>/
│   ├── alembic/             # Migrações versionadas (env.py + versions/)
│   ├── alembic.ini          # Config do Alembic (URL vem do .env)
│   └── routes/
│       ├── auth.py          # Login + rate limiting
│       ├── artists.py       # CRUD artistas + foto
│       ├── projects.py      # CRUD projetos + capa
│       ├── tracks.py        # CRUD faixas (ISRC, áudio MP3, letra/tradução)
│       ├── collaborators.py # CRUD colaboradores
│       └── uploads.py       # Upload/download protegido de arquivos
├── frontend/
│   ├── src/
│   │   ├── pages/           # Login, Dashboard, ProjectDetail, Artists, ArtistDetail
│   │   ├── components/      # Layout, Projects, Artists, UI (Modal, SecureImage...)
│   │   └── services/api.js  # Cliente axios com interceptor JWT
│   └── vite.config.js       # Proxy /api → localhost:8000
├── start.bat                # Atalho: sobe backend + frontend de uma vez
└── uploads/                 # Arquivos enviados (não versionado)
```

### 📦 Uploads legíveis por humanos

A pasta `uploads/` é organizada **exatamente como o painel**: artista → álbum → faixas/arquivos, tudo em **minúsculas** e com espaços substituídos por `_`. Assim você pode guardar a pasta num lugar seguro e, ao abri-la, já sabe de quem é cada coisa.

```text
uploads/
└── bunny_land_music/                        ← artista
    ├── foto.png                             ← foto do artista
    └── chapter_1_caution_audio_gateway/     ← álbum (projeto)
        ├── capa.jpg                         ← capa do álbum
        ├── 01_the_gateway_to_bunny_land.mp3 ← faixa: <nº>_<título>
        └── contrato_distribuicao.pdf        ← arquivos originais (colisão vira _1, _2...)
```

> Projetos sem artista ficam em `sem_artista/<álbum>/`. Nomes seguros (sem acentos/símbolos) e com anti path-traversal garantido pela sanitização.

---

## 🔌 API <a id="api"></a>

Autenticação via `Authorization: Bearer <token>`.

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/auth/login` | Login (com rate limiting) |
| `GET/PUT` | `/api/auth/me` (e `/email`, `/password`) | Perfil / troca de e-mail / troca de senha |
| `GET` | `/api/auth/avatar` | Exibir avatar enviado (protegido) |
| `POST/PUT` | `/api/auth/avatar` | Enviar imagem / definir avatar pré-definido (seed DiceBear Clay) |
| `GET/POST` | `/api/projects` | Listar / criar projetos |
| `GET/PUT/DELETE` | `/api/projects/{id}` | Detalhe / editar / excluir |
| `POST/GET` | `/api/projects/{id}/cover` | Upload / exibir capa |
| `POST/GET` | `/api/projects/{id}/files` | Upload / listar arquivos |
| `GET/DELETE` | `/api/projects/{id}/files/{file_id}` | Download protegido / excluir |
| `GET/POST/PUT/DELETE` | `/api/projects/{id}/tracks` (e `/{track_id}`) | Faixas (ISRC, letra, tradução, link da letra — PUT parcial) |
| `POST` | `/api/projects/{id}/tracks/{track_id}/audio` | Upload do **MP3 da faixa** |
| `GET` | `/api/projects/{id}/tracks/{track_id}/audio` | Playback protegido (stream inline) |
| `DELETE` | `/api/projects/{id}/tracks/{track_id}/audio` | Remove o áudio da faixa |
| `GET/POST/PUT/DELETE` | `/api/projects/{id}/collaborators` (e `/{id}`) | Colaboradores |
| `GET/POST/PUT/DELETE` | `/api/artists` (e `/{id}`) | Artistas |
| `POST/GET` | `/api/artists/{id}/image` | Upload / exibir foto |
| `GET` | `/api/health` | Health check |

> Docs interativas (Swagger) em `http://localhost:8000/docs`.

---

## 🛡️ Segurança <a id="seguranca"></a>

- 🔒 **Uploads protegidos** — arquivos nunca são servidos estaticamente; todo acesso passa por autenticação + verificação de posse
- 🔐 **Senha do admin** gerada automaticamente e exibida uma única vez
- ⏱️ **Rate limiting** no login (5 tentativas / 5 min) com bloqueio temporário
- 🧰 **Validação de upload** — extensão permitida (áudio, imagem, doc), tamanho máx. 50MB, nome **legível por humanos** (`slug`: minúsculas, espaços → `_`, sem acentos — anti path-traversal pela sanitização)
- 🚧 **CORS restrito** em produção (`CORS_ORIGINS`)
- 🔑 **JWT** com expiração e `SECRET_KEY` vinda do `.env`
- 🧹 **Headers de segurança** — `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`

---

## 🔧 Variáveis de ambiente

| Variável | Default | Descrição |
|---|---|---|
| `ADMIN_EMAIL` | `admin@musicproject.com` | E-mail do admin (senha gerada na 1ª execução) |
| `ADMIN_PASSWORD` | *(vazio)* | Se definida, a senha do admin é sincronizada com este valor a cada startup (junto com `ADMIN_EMAIL`) |
| `SECRET_KEY` | *(exemplo)* | **Troque** por valor aleatório em produção |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | Expiração do JWT em minutos |
| `DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME` | `localhost/3306/root//music_project` | Conexão MySQL |
| `UPLOAD_DIR` | `../uploads` | Pasta de arquivos |
| `CORS_ORIGINS` | `*` | Origens permitidas (separadas por vírgula) |
| `LOGIN_RATE_LIMIT` | `5/minute` | Limite de tentativas de login |

---

<div align="center">

<sub>Feito com 🎧 e muito café — **Music Project Manager**</sub>

</div>