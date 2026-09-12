const http = require('http');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');

const PORT = 3000;
const ROOT = __dirname;
const UPLOAD_DIR = path.join(ROOT, 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function serveStaticFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Arquivo não encontrado');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.php': 'text/html; charset=utf-8'
    };

    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'POST' && url.pathname === '/upload') {
    const form = formidable({
      uploadDir: UPLOAD_DIR,
      keepExtensions: true,
      multiples: false,
      maxFileSize: 20 * 1024 * 1024
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Erro ao processar arquivo');
        return;
      }

      const uploadedFile = files.arquivo;
      const nomeInformado = Array.isArray(fields.nome) ? fields.nome[0] : fields.nome;
      const finalName = nomeInformado || uploadedFile?.newFilename || 'arquivo';
      const targetPath = path.join(UPLOAD_DIR, path.basename(finalName));

      if (uploadedFile && uploadedFile.filepath) {
        fs.rename(uploadedFile.filepath, targetPath, (renameErr) => {
          if (renameErr) {
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Erro ao salvar arquivo');
            return;
          }

          res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end(`Arquivo enviado com sucesso: ${path.basename(finalName)}`);
        });
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Nenhum arquivo enviado');
      }
    });
    return;
  }

  let requestedPath = url.pathname === '/' ? '/index.html' : url.pathname;
  requestedPath = requestedPath.replace(/^\//, '');
  const fullPath = path.join(ROOT, requestedPath);

  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
    serveStaticFile(fullPath, res);
    return;
  }

  if (!path.extname(fullPath)) {
    const fallback = path.join(ROOT, 'index.html');
    serveStaticFile(fallback, res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Página não encontrada');
});

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
