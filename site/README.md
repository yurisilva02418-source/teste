# Site de Upload e Arquivos

Projeto simples para testar upload de arquivos em um ambiente local com Python.

## Como executar

Windows:

```bash
start-server.bat
```

Ou manualmente:

```bash
"%LOCALAPPDATA%\Microsoft\WindowsApps\python.exe" server.py
```

Depois acesse:

```text
http://localhost:8000
```

## Estrutura

- `index.html` - página principal
- `css/style.css` - estilos
- `js/script.js` - interações do frontend
- `server.py` - servidor HTTP local
- `uploads/` - arquivos enviados
- `sql/database.sql` - base SQL
- `backend/main.cpp` - exemplo de backend em C++
