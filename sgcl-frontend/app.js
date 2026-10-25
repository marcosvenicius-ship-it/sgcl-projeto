const API_URL = "http://localhost:8080/prospects";
const USUARIOS_URL = "http://localhost:8080/usuarios";

let modalEditarBS = null;
let modalHistoricoBS = null;
let modalEncerramentoBS = null;

let prospectsGerais = [];
let usuariosGerais = [];

const ESTAGIOS = [
    { chave: "NOVO", titulo: "1. Novo", cor: "border-top-primary" },
    { chave: "QUALIFICACAO", titulo: "2. Qualificação", cor: "border-top-warning" },
    { chave: "PROPOSTA", titulo: "3. Proposta", cor: "border-top-info" },
    { chave: "NEGOCIACAO", titulo: "4. Negociação", cor: "border-top-purple" },
    { chave: "FECHAMENTO", titulo: "5. Fechamento", cor: "border-top-success" }
];

document.addEventListener("DOMContentLoaded", () => {
    const elModalEdit = document.getElementById("modalEditar");
    if (elModalEdit && typeof bootstrap !== "undefined") {
        modalEditarBS = new bootstrap.Modal(elModalEdit);
    }

    const elModalHist = document.getElementById("modalHistorico");
    if (elModalHist && typeof bootstrap !== "undefined") {
        modalHistoricoBS = new bootstrap.Modal(elModalHist);
    }

    const elModalEnc = document.getElementById("modalEncerramento");
    if (elModalEnc && typeof bootstrap !== "undefined") {
        modalEncerramentoBS = new bootstrap.Modal(elModalEnc);
    }

    const formCad = document.getElementById("formProspect");
    if (formCad) formCad.addEventListener("submit", cadastrarProspect);

    const formEdit = document.getElementById("formEditarProspect");
    if (formEdit) formEdit.addEventListener("submit", salvarEdicaoProspect);

    const formInteracao = document.getElementById("formInteracao");
    if (formInteracao) formInteracao.addEventListener("submit", registrarInteracao);

    carregarUsuarios().then(() => {
        carregarProspects();
    });
});

async function carregarUsuarios() {
    try {
        const response = await fetch(USUARIOS_URL);
        if (response.ok) {
            usuariosGerais = await response.json();
            preencherSelectsUsuarios();
        }
    } catch (error) {
        console.error("Erro ao carregar lista de usuários/vendedores:", error);
    }
}

function preencherSelectsUsuarios() {
    const selectCad = document.getElementById("usuarioSelect");
    const selectEdit = document.getElementById("editUsuarioSelect");

    let options = '<option value="" disabled selected>Selecione o Responsável...</option>';
    usuariosGerais.forEach(u => {
        options += `<option value="${u.id}">${escapeHtml(u.nome)} (${escapeHtml(u.cargo)})</option>`;
    });

    if (selectCad) selectCad.innerHTML = options;
    if (selectEdit) selectEdit.innerHTML = options;
}

async function carregarProspects() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Erro ao consultar a API");

        prospectsGerais = await response.json();
        aplicarFiltros();
    } catch (error) {
        console.error("Erro ao carregar prospects:", error);
    }
}

function aplicarFiltros() {
    const elEtapa = document.getElementById("filtroEtapa");
    const elOrigem = document.getElementById("filtroOrigem");

    const etapaSel = elEtapa ? elEtapa.value : "TODAS";
    const origemSel = elOrigem ? elOrigem.value : "TODOS";

    const filtrados = prospectsGerais.filter(p => {
        const matchEtapa = (etapaSel === "TODAS" || p.etapaFunil === etapaSel);
        const matchOrigem = (origemSel === "TODOS" || p.origem === origemSel);
        return matchEtapa && matchOrigem;
    });

    renderizarTabela(filtrados);
    renderizarKanban(filtrados);
}

function renderizarTabela(lista) {
    const tbody = document.getElementById("tabelaProspects");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-3">Nenhum prospect encontrado.</td></tr>`;
        return;
    }

    lista.forEach(p => {
        const tr = document.createElement("tr");
        const nomeResp = p.usuario ? p.usuario.nome : "Não atribuído";
        const statusBadge = getStatusFinalBadge(p.statusFinal);

        tr.innerHTML = `
            <td><strong>#${p.id || ''}</strong></td>
            <td>
                <div class="fw-bold">${escapeHtml(p.nome)}</div>
                <small class="text-muted">${escapeHtml(p.email)}</small>
            </td>
            <td>
                <div>${escapeHtml(p.empresa || '-')}</div>
                <small class="text-muted">${escapeHtml(p.cnpj || '')}</small>
            </td>
            <td><small class="fw-semibold text-dark">👤 ${escapeHtml(nomeResp)}</small></td>
            <td><span class="badge bg-light text-dark border">${formatarOrigem(p.origem)}</span></td>
            <td>
                <span class="badge ${getBadgeClass(p.etapaFunil)} me-1">${formatarEtapa(p.etapaFunil)}</span>
                ${statusBadge}
            </td>
            <td class="text-center">
                <button class="btn btn-sm btn-outline-secondary me-1" title="Histórico de Anotações" onclick="abrirHistorico(${p.id}, '${escapeHtml(p.nome)}')">
                    💬
                </button>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="prepararEdicao(${p.id})">
                    Editar
                </button>
                <button class="btn btn-sm btn-outline-dark me-1" title="Encerrar Venda" onclick="abrirModalEncerramento(${p.id})">
                    🏁
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deletarProspect(${p.id})">
                    Excluir
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderizarKanban(lista) {
    const board = document.getElementById("kanbanBoard");
    if (!board) return;

    board.innerHTML = "";

    ESTAGIOS.forEach(estagio => {
        const itensColuna = lista.filter(p => p.etapaFunil === estagio.chave);

        const colDiv = document.createElement("div");
        colDiv.className = "col-md";

        let cardsHtml = "";
        itensColuna.forEach(item => {
            const nomeVendedor = item.usuario ? item.usuario.nome : "Sem dono";
            const statusBadge = item.statusFinal !== 'EM_ANDAMENTO' ? getStatusFinalBadge(item.statusFinal) : '';

            cardsHtml += `
                <div class="card kanban-item p-2 mb-2 border">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="fw-bold fs-7 text-dark">${escapeHtml(item.nome)}</div>
                        ${statusBadge}
                    </div>
                    <div class="text-muted fs-8">${escapeHtml(item.empresa || 'Sem empresa')}</div>
                    
                    <!-- Atribuição rápida do responsável comercial -->
                    <div class="d-flex align-items-center justify-content-between mt-1">
                        <small class="text-dark fs-8 fw-semibold">👤 ${escapeHtml(nomeVendedor)}</small>
                        <button class="btn btn-xs btn-outline-secondary py-0 px-1" title="Atribuir / Alterar Vendedor" onclick="atribuirVendedorRapido(${item.id})">
                            Atribuir Vendedor
                        </button>
                    </div>
                    
                    <div class="d-flex justify-content-between align-items-center mt-2 border-top pt-2">
                        <button class="btn btn-xs btn-outline-secondary p-1 py-0 fs-8" onclick="abrirHistorico(${item.id}, '${escapeHtml(item.nome)}')">💬 Anotações</button>
                        <button class="btn btn-xs btn-link text-dark p-0 fs-8 fw-bold" onclick="prepararEdicao(${item.id})">Avançar →</button>
                    </div>
                </div>
            `;
        });

        colDiv.innerHTML = `
            <div class="card kanban-column border-0 ${estagio.cor}">
                <div class="card-header bg-white py-2 d-flex justify-content-between align-items-center">
                    <span class="fw-bold fs-7 text-uppercase text-dark">${estagio.titulo}</span>
                    <span class="badge bg-secondary rounded-pill">${itensColuna.length}</span>
                </div>
                <div class="card-body p-2 kanban-cards-container">
                    ${cardsHtml}
                </div>
            </div>
        `;
        board.appendChild(colDiv);
    });
}

async function atribuirVendedorRapido(prospectId) {
    if (usuariosGerais.length === 0) {
        alert("Nenhum vendedor encontrado para atribuição.");
        return;
    }

    let mensagem = "Selecione o ID do Vendedor:\n\n";
    usuariosGerais.forEach(u => {
        mensagem += `ID [${u.id}] - ${u.nome} (${u.cargo})\n`;
    });

    const escolhaId = prompt(mensagem);
    if (!escolhaId) return;

    const vendedorEncontrado = usuariosGerais.find(u => u.id == escolhaId);
    if (!vendedorEncontrado) {
        alert("ID de vendedor inválido.");
        return;
    }

    const item = prospectsGerais.find(p => p.id === prospectId);
    if (!item) return;

    item.usuario = { id: vendedorEncontrado.id };

    try {
        const response = await fetch(`${API_URL}/${prospectId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item)
        });

        if (response.ok) {
            carregarProspects();
        } else {
            alert("Erro ao atribuir vendedor.");
        }
    } catch (error) {
        alert("Erro na conexão ao atribuir vendedor.");
    }
}

async function cadastrarProspect(event) {
    event.preventDefault();

    const usuarioId = document.getElementById("usuarioSelect").value;
    if (!usuarioId) {
        alert("Por favor, selecione o responsável comercial.");
        return;
    }

    const prospect = {
        nome: document.getElementById("nome").value,
        email: document.getElementById("email").value,
        telefone: document.getElementById("telefone").value,
        empresa: document.getElementById("empresa").value,
        cnpj: document.getElementById("cnpj").value,
        origem: document.getElementById("origem").value,
        etapaFunil: document.getElementById("etapaFunil").value,
        usuario: { id: parseInt(usuarioId) }
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(prospect)
        });

        if (response.ok) {
            alert("Prospect cadastrado e atribuído com sucesso!");
            document.getElementById("formProspect").reset();
            carregarProspects();
        } else {
            const erroMsg = await response.text();
            alert("Erro ao cadastrar: " + erroMsg);
        }
    } catch (error) {
        alert("Erro na conexão com o servidor.");
    }
}

function prepararEdicao(id) {
    const item = prospectsGerais.find(p => p.id === id);
    if (!item) return;

    document.getElementById("editId").value = item.id;
    document.getElementById("editNome").value = item.nome || "";
    document.getElementById("editEmail").value = item.email || "";
    document.getElementById("editTelefone").value = item.telefone || "";
    document.getElementById("editEmpresa").value = item.empresa || "";
    document.getElementById("editCnpj").value = item.cnpj || "";
    document.getElementById("editOrigem").value = item.origem || "SITE";
    document.getElementById("editEtapaFunil").value = item.etapaFunil || "NOVO";

    if (item.usuario && item.usuario.id) {
        document.getElementById("editUsuarioSelect").value = item.usuario.id;
    }

    if (modalEditarBS) {
        modalEditarBS.show();
    }
}

async function salvarEdicaoProspect(event) {
    event.preventDefault();

    const id = document.getElementById("editId").value;
    const usuarioId = document.getElementById("editUsuarioSelect").value;

    const prospect = {
        nome: document.getElementById("editNome").value,
        email: document.getElementById("editEmail").value,
        telefone: document.getElementById("editTelefone").value,
        empresa: document.getElementById("editEmpresa").value,
        cnpj: document.getElementById("editCnpj").value,
        origem: document.getElementById("editOrigem").value,
        etapaFunil: document.getElementById("editEtapaFunil").value,
        usuario: usuarioId ? { id: parseInt(usuarioId) } : null
    };

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(prospect)
        });

        if (response.ok) {
            alert("Prospect atualizado com sucesso!");
            if (modalEditarBS) modalEditarBS.hide();
            carregarProspects();
        } else {
            const erroMsg = await response.text();
            alert("Erro ao atualizar: " + erroMsg);
        }
    } catch (error) {
        alert("Erro ao conectar com o servidor.");
    }
}

async function deletarProspect(id) {
    if (confirm("Tem certeza que deseja excluir este prospect do sistema?")) {
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            if (response.ok) {
                alert("Prospect removido com sucesso!");
                carregarProspects();
            } else {
                alert("Erro ao excluir o prospect.");
            }
        } catch (error) {
            alert("Erro na conexão com o servidor.");
        }
    }
}

async function abrirHistorico(prospectId, nome) {
    document.getElementById("interacaoProspectId").value = prospectId;
    document.getElementById("historicoNomeProspect").innerText = nome;
    document.getElementById("interacaoDescricao").value = "";

    await carregarInteracoes(prospectId);

    if (modalHistoricoBS) {
        modalHistoricoBS.show();
    }
}

async function carregarInteracoes(prospectId) {
    try {
        const response = await fetch(`${API_URL}/${prospectId}/interacoes`);
        const interacoes = await response.json();
        const container = document.getElementById("listaInteracoes");

        container.innerHTML = interacoes.length === 0
            ? '<p class="text-muted text-center py-3">Nenhuma anotação registrada até o momento.</p>'
            : '';

        interacoes.forEach(i => {
            const dataFmt = new Date(i.dataRegistro).toLocaleString('pt-BR');
            container.innerHTML += `
                <div class="list-group-item list-group-item-action">
                    <div class="d-flex w-100 justify-content-between align-items-center">
                        <h6 class="mb-1 text-dark fw-bold">${formatarTipoInteracao(i.tipo)}</h6>
                        <small class="text-muted fs-8">${dataFmt}</small>
                    </div>
                    <p class="mb-1 fs-7 text-dark">${escapeHtml(i.descricao)}</p>
                </div>
            `;
        });
    } catch (error) {
        console.error("Erro ao carregar histórico:", error);
    }
}

async function registrarInteracao(event) {
    event.preventDefault();

    const prospectId = document.getElementById("interacaoProspectId").value;
    const interacao = {
        tipo: document.getElementById("interacaoTipo").value,
        descricao: document.getElementById("interacaoDescricao").value
    };

    try {
        const response = await fetch(`${API_URL}/${prospectId}/interacoes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(interacao)
        });

        if (response.ok) {
            document.getElementById("interacaoDescricao").value = "";
            carregarInteracoes(prospectId);
        } else {
            alert("Erro ao registrar anotação.");
        }
    } catch (error) {
        alert("Erro na conexão ao registrar interacao.");
    }
}

function abrirModalEncerramento(id) {
    document.getElementById("encerraProspectId").value = id;
    document.getElementById("divMotivoPerda").classList.add("d-none");

    if (modalEncerramentoBS) {
        modalEncerramentoBS.show();
    }
}

function exibirMotivoPerda() {
    document.getElementById("divMotivoPerda").classList.remove("d-none");
}

async function definirStatusFinal(status) {
    const id = document.getElementById("encerraProspectId").value;
    const item = prospectsGerais.find(p => p.id == id);
    if (!item) return;

    item.statusFinal = status;
    if (status === 'PERDIDO') {
        item.motivoPerda = document.getElementById("motivoPerdaSelect").value;
    } else {
        item.motivoPerda = null;
        item.etapaFunil = "FECHAMENTO";
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item)
        });

        if (response.ok) {
            alert(`Oportunidade definida como ${status === 'GANHO' ? 'GANHA (Venda Realizada)' : 'PERDIDA'}`);
            if (modalEncerramentoBS) modalEncerramentoBS.hide();
            carregarProspects();
        } else {
            alert("Erro ao encerrar oportunidade.");
        }
    } catch (error) {
        alert("Erro ao conectar com o servidor.");
    }
}

function formatarOrigem(origem) {
    const mapa = {
        "SITE": "Site",
        "RD_STATION": "Marketing",
        "INDICACAO": "Indicação",
        "EVENTO": "Evento",
        "OUTRO": "Outro"
    };
    return mapa[origem] || origem || "-";
}

function formatarEtapa(etapa) {
    const mapa = {
        "NOVO": "Novo",
        "QUALIFICACAO": "Qualificação",
        "PROPOSTA": "Proposta",
        "NEGOCIACAO": "Negociação",
        "FECHAMENTO": "Fechamento"
    };
    return mapa[etapa] || etapa || "Novo";
}

function formatarTipoInteracao(tipo) {
    const mapa = {
        "LIGACAO": "📞 Ligação",
        "REUNIAO": "🤝 Reunião",
        "EMAIL": "✉️ E-mail",
        "WHATSAPP": "💬 WhatsApp"
    };
    return mapa[tipo] || tipo;
}

function getBadgeClass(etapa) {
    return "bg-secondary text-white";
}

function getStatusFinalBadge(status) {
    switch (status) {
        case "GANHO": return '<span class="badge bg-success fs-8">✓ Ganho</span>';
        case "PERDIDO": return '<span class="badge bg-danger fs-8">✕ Perdido</span>';
        default: return '';
    }
}

function escapeHtml(texto) {
    if (!texto) return "";
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
