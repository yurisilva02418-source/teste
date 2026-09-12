console.log("Site Base Carregado!");

function mostrarAlerta() {
  alert("Sistema funcionando corretamente! 🚀");
}

function atualizarPreviewArquivo() {
  const input = document.getElementById('arquivoInput');
  const preview = document.getElementById('filePreview');

  if (!input || !preview) return;

  const file = input.files && input.files[0];
  if (!file) {
    preview.textContent = 'Nenhum arquivo selecionado.';
    return;
  }

  const sizeMb = (file.size / 1024 / 1024).toFixed(2);
  preview.textContent = `Arquivo selecionado: ${file.name} (${sizeMb} MB)`;
}

function renderFileList(files) {
  const listContainer = document.getElementById('fileList');
  const fileCount = document.getElementById('fileCount');

  if (!listContainer) return;

  if (!files || files.length === 0) {
    listContainer.innerHTML = '<p class="empty-state">Nenhum arquivo enviado ainda.</p>';
    if (fileCount) fileCount.textContent = '0';
    return;
  }

  if (fileCount) fileCount.textContent = String(files.length);

  listContainer.innerHTML = files.map((file) => `
    <div class="file-item">
      <div class="file-meta">
        <span class="file-name">${file.name}</span>
        <span class="file-size">${file.size_label} • ${file.modified}</span>
      </div>
      <div class="file-actions">
        <a class="file-link" href="${file.download_url}" target="_blank" rel="noopener noreferrer">Baixar</a>
      </div>
    </div>
  `).join('');
}

async function carregarArquivos() {
  try {
    const response = await fetch('/api/files');
    if (!response.ok) {
      throw new Error('Falha ao listar arquivos');
    }

    const files = await response.json();
    renderFileList(files);
  } catch (error) {
    console.error(error);
    const listContainer = document.getElementById('fileList');
    if (listContainer) {
      listContainer.innerHTML = '<p class="empty-state">Não foi possível carregar os arquivos.</p>';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('arquivoInput');
  if (fileInput) {
    fileInput.addEventListener('change', atualizarPreviewArquivo);
  }

  carregarArquivos();

  const form = document.getElementById('uploadForm');
  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const fileInputValue = document.getElementById('arquivoInput');
      const nome = form.querySelector('input[name="nome"]').value.trim();
      const arquivo = fileInputValue && fileInputValue.files[0];

      if (!arquivo) {
        alert('Selecione um arquivo antes de enviar.');
        return;
      }

      const formData = new FormData(form);
      if (!nome) {
        formData.set('nome', arquivo.name);
      }

      try {
        const response = await fetch('/upload', {
          method: 'POST',
          body: formData,
        });

        const text = await response.text();
        const mensagem = text.includes('sucesso') || text.includes('Arquivo')
          ? text
          : 'Upload enviado com sucesso.';

        alert(mensagem);

        if (response.ok) {
          form.reset();
          atualizarPreviewArquivo();
          await carregarArquivos();
        }
      } catch (error) {
        console.error('Erro no upload:', error);
        alert('Não foi possível enviar o arquivo no momento.');
      }
    });
  }
});
