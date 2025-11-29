document.addEventListener('DOMContentLoaded', () => {
  const main = document.getElementById('main');
  const formulario = document.getElementById('formulario');
  const recarregarBtn = document.getElementById('recarregar');


  const modalConfirm = document.getElementById('modal-confirm');
  const cancelarDeleteBtn = document.getElementById('cancelar-delete');
  const confirmarDeleteBtn = document.getElementById('confirmar-delete');

  const modalEdit = document.getElementById('modal-edit');
  const cancelarEditBtn = document.getElementById('cancelar-edit');
  const salvarEditBtn = document.getElementById('salvar-edit');

  const editTitulo = document.getElementById('edit-titulo');
  const editAutor = document.getElementById('edit-autor');
  const editAno = document.getElementById('edit-ano');
  const editGenero = document.getElementById('edit-genero');
  const editImagem = document.getElementById('edit-imagem');

  let idParaDeletar = null;
  let idParaEditar = null;
  const API_BASE = '/api/biblioteca';


  function openModal(modal) {
    modal.classList.remove('hidden');
  }
  function closeModal(modal) {
    modal.classList.add('hidden');
  }


  function notify(msg, tipo = 'info') {

    console.log(`[${tipo}] ${msg}`);

  }


  function criarCard(manga) {
    const card = document.createElement('div');
    card.className = 'manga-card';
    card.dataset.id = manga.id;

    const img = document.createElement('img');
    img.src = manga.imagem || '';
    img.alt = manga.titulo || 'Capa';
    img.onerror = () => {
      img.src = 'https://via.placeholder.com/200x280?text=Sem+Imagem';
    };

    const info = document.createElement('div');
    info.className = 'manga-info';

    const titulo = document.createElement('h3');
    titulo.textContent = manga.titulo || 'Sem título';

    const autor = document.createElement('p');
    autor.innerHTML = `<strong>Autor:</strong> ${manga.autor || '-'}`;

    const ano = document.createElement('p');
    ano.innerHTML = `<strong>Ano:</strong> ${manga.ano || '-'}`;

    const genero = document.createElement('p');
    genero.innerHTML = `<strong>Gênero:</strong> ${manga.genero || '-'}`;

    const btns = document.createElement('div');
    btns.className = 'card-buttons';

    const editarBtn = document.createElement('button');
    editarBtn.className = 'btn-edit';
    editarBtn.textContent = 'Editar';
    editarBtn.addEventListener('click', () => abrirModalEditar(manga.id));

    const deletarBtn = document.createElement('button');
    deletarBtn.className = 'btn-delete';
    deletarBtn.textContent = 'Apagar';
    deletarBtn.addEventListener('click', () => abrirModalDeletar(manga.id));

    btns.appendChild(editarBtn);
    btns.appendChild(deletarBtn);

    info.appendChild(titulo);
    info.appendChild(autor);
    info.appendChild(ano);
    info.appendChild(genero);
    info.appendChild(btns);

    card.appendChild(img);
    card.appendChild(info);

    return card;
  }

  
  async function carregarMangases() {
    main.innerHTML = '<p>Carregando ainda bixin acalme-se</p>';
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(`Erro ao carregar: ${res.status}`);
      const data = await res.json();
      const rows = data.data || [];
      main.innerHTML = '';

      if (rows.length === 0) {
        main.innerHTML = '<p>Nenhum mangá cadastrad</p>';
        return;
      }

      const grid = document.createElement('div');
      grid.className = 'manga-grid';

      rows.forEach(manga => {
        const card = criarCard(manga);
        grid.appendChild(card);
      });

      main.appendChild(grid);
    } catch (err) {
      console.error(err);
      main.innerHTML = `<p>Erro ao carregar dados: ${err.message}</p>`;
    }
  }


  formulario.addEventListener('submit', async (e) => {
    e.preventDefault();
    const titulo = document.getElementById('input-titulo').value.trim();
    const autor = document.getElementById('input-autor').value.trim();
    const ano = document.getElementById('input-ano').value.trim();
    const genero = document.getElementById('input-genero').value.trim();
    const imagem = document.getElementById('input-img').value.trim();

    if (!titulo) {
      notify('Título é obrigatório', 'error');
      return;
    }

    const payload = { titulo, autor, ano: ano ? Number(ano) : null, genero, imagem };

    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || JSON.stringify(json));
      }
      notify('Mangá adicionado com sucesso', 'success');
      formulario.reset();
      carregarMangases();
    } catch (err) {
      console.error(err);
      notify(`Erro ao adicionar: ${err.message}`, 'error');
    }
  });

  
  function abrirModalDeletar(id) {
    idParaDeletar = id;
    openModal(modalConfirm);
  }

  confirmarDeleteBtn.addEventListener('click', async () => {
    if (!idParaDeletar) return;
    try {
      const res = await fetch(`${API_BASE}/${idParaDeletar}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || JSON.stringify(json));
      notify('Mangá excluído', 'success');
      idParaDeletar = null;
      closeModal(modalConfirm);
      carregarMangases();
    } catch (err) {
      console.error(err);
      notify(`Erro ao excluir: ${err.message}`, 'error');
    }
  });

  cancelarDeleteBtn.addEventListener('click', () => {
    idParaDeletar = null;
    closeModal(modalConfirm);
  });

  
  async function abrirModalEditar(id) {
    idParaEditar = id;
    try {
      const res = await fetch(`${API_BASE}/${id}`);
      if (!res.ok) throw new Error('Não foi possível buscar o mangá');
      const json = await res.json();
      const m = json.data;
      editTitulo.value = m.titulo || '';
      editAutor.value = m.autor || '';
      editAno.value = m.ano || '';
      editGenero.value = m.genero || '';
      editImagem.value = m.imagem || '';
      openModal(modalEdit);
    } catch (err) {
      console.error(err);
      notify(`Erro ao abrir edição: ${err.message}`, 'error');
    }
  }

  cancelarEditBtn.addEventListener('click', () => {
    idParaEditar = null;
    closeModal(modalEdit);
  });

  
  salvarEditBtn.addEventListener('click', async () => {
    if (!idParaEditar) return;
    const titulo = editTitulo.value.trim();
    const autor = editAutor.value.trim();
    const ano = editAno.value.trim();
    const genero = editGenero.value.trim();
    const imagem = editImagem.value.trim();

    if (!titulo) {
      notify('Título é obrigatório', 'error');
      return;
    }

    const payload = { titulo, autor, ano: ano ? Number(ano) : null, genero, imagem };

    try {
      const res = await fetch(`${API_BASE}/${idParaEditar}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || JSON.stringify(json));
      notify('Mangá atualizado', 'success');
      idParaEditar = null;
      closeModal(modalEdit);
      carregarMangases();
    } catch (err) {
      console.error(err);
      notify(`Erro ao atualizar: ${err.message}`, 'error');
    }
  });

  
  recarregarBtn.addEventListener('click', () => {
    carregarMangases();
  });


  carregarMangases();
});