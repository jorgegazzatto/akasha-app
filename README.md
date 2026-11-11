# ✨ Akasha App — Manifestação & Visualização Sonora com IA

Plataforma unificada (Mobile iOS/Android, Tablet e Web) de desenvolvimento pessoal e reprogramação mental através de narrativas imersivas em áudio geradas por Inteligência Artificial.

---

## 📚 Documentação do Projeto
- 📄 **Guia Canônico de Engenharia:** [`DOCUMENTACAO_PROJETO_AKASHA.md`](./DOCUMENTACAO_PROJETO_AKASHA.md)
- 📊 **Relatório Executivo em PDF:** [`Akasha_App_Relatorio_do_Projeto.pdf`](./Akasha_App_Relatorio_do_Projeto.pdf)

---

## 🛠️ Estrutura do Repositório

```text
/Akasha-app
  ├── backend/               # API FastAPI (Python) para orquestração de IA e áudio
  │    ├── app/              # Código fonte (Rotas, Configurações, Modelos)
  │    ├── Dockerfile        # Imagem Docker com FFmpeg para estúdio de áudio
  │    ├── requirements.txt  # Dependências Python
  │    └── .env.example      # Variáveis de ambiente
  ├── frontend/              # App Universal em Expo (React Native + Web PWA)
  │    ├── app/              # Rotas e Telas (Expo Router)
  │    ├── constants/        # Cores e Tokens de Design
  │    ├── package.json      # Dependências Node.js
  │    └── tsconfig.json     # Configuração TypeScript
  ├── docker-compose.yml     # Orquestração de produção para sua VPS
  └── .gitignore
```

---

## 🚀 Como Executar o Projeto no OpenIDE / Localmente

### 1. Backend (FastAPI)
```bash
cd backend
python -m venv venv
# No Windows:
venv\Scripts\activate
# No Linux/Mac:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- Acesse a documentação interativa da API: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/v1/health`

### 2. Frontend (Expo Universal)
```bash
cd frontend
npm install

# Para rodar no navegador (PC / Desktop):
npm run web

# Para rodar emulador ou celular:
npm start
```

### 3. Deploy na VPS (com Docker Compose)
```bash
# Na sua VPS:
docker-compose up -d --build
```
Isso iniciará o **FastAPI**, **PostgreSQL**, **Redis** e o **Worker Celery**.
