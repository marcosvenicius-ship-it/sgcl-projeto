const API_URL = "http://localhost:8080/prospects";
let modalEditarBS = null;
let prospectsGerais = [];

const ESTAGIOS = [
    { chave: "NOVO", titulo: "1. Novo", cor: "border-top-primary" },
    { chave: "QUALIFICACAO", titulo: "2. Qualificação", cor: "border-top-warning" },
    { chave: "PROPOSTA", titulo: "3. Proposta", cor: "border-top-info" },
    { chave: "NEGOCIACAO", titulo: "4. Negociação", cor: "border-top-purple" },
    { chave: "FECHAMENTO", titulo: "5. Fechamento", cor: "border-top-success" }
];

document.addEventListener("DOMContentLoaded", () => {
    const modalElement = document.getElementById("modalEditar");
    if (modalElement && typeof bootstrap !== "undefined") {
        modalEditarBS = new bootstrap.Modal(modalElement);
    }

    const formCad = document.getElementById("formProspect");
    if (formCad) formCad.addEventListener("submit", cadastrarProspect);

    const formEdit = document.getElementById("formEditarProspect");
    if (formEdit) formEdit.addEventListener("submit", salvarEdicaoProspect);

    // Carregar dados iniciais
    carregarProspects();
});

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
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-3">Nenhum prospect encontrado.</td></tr>`;
        return;
    }

    lista.forEach(p => {
        const tr = document.createElement("tr");
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
            <td><span class="badge bg-light text-dark border">${formatarOrigem(p.origem)}</span></td>
            <td><span class="badge ${getBadgeClass(p.etapaFunil)}">${formatarEtapa(p.etapaFunil)}</span></td>
            <td class="text-center">
                <button class="btn btn-sm btn-outline-primary me-1" onclick="prepararEdicao(${p.id})">
                    Editar
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
            cardsHtml += `
                <div class="card kanban-item p-2 mb-2 border">
                    <div class="fw-bold fs-7 text-dark">${escapeHtml(item.nome)}</div>
                    <div class="text-muted fs-8">${escapeHtml(item.empresa || 'Sem empresa')}</div>
                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <span class="badge bg-light text-dark fs-8 border">${formatarOrigem(item.origem)}</span>
                        <button class="btn btn-xs btn-link text-primary p-0" onclick="prepararEdicao(${item.id})">Avançar →</button>
                    </div>
                </div>
            `;
        });

        colDiv.innerHTML = `
            <div class="card kanban-column border-0 ${estagio.cor}">
                <div class="card-header bg-white py-2 d-flex justify-content-between align-items-center">
                    <span class="fw-bold fs-7 text-uppercase">${estagio.titulo}</span>
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

async function cadastrarProspect(event) {
    event.preventDefault();

    const prospect = {
        nome: document.getElementById("nome").value,
        email: document.getElementById("email").value,
        telefone: document.getElementById("telefone").value,
        empresa: document.getElementById("empresa").value,
        cnpj: document.getElementById("cnpj").value,
        origem: document.getElementById("origem").value,
        etapaFunil: document.getElementById("etapaFunil").value
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(prospect)
        });

        if (response.ok) {
            alert("Prospect cadastrado com sucesso!");
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

async function salvarEdicaoProspect(event) {
    event.preventDefault();

    const id = document.getElementById("editId").value;
    const prospect = {
        nome: document.getElementById("editNome").value,
        email: document.getElementById("editEmail").value,
        telefone: document.getElementById("editTelefone").value,
        empresa: document.getElementById("editEmpresa").value,
        cnpj: document.getElementById("editCnpj").value,
        origem: document.getElementById("editOrigem").value,
        etapaFunil: document.getElementById("editEtapaFunil").value
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

    if (modalEditarBS) {
        modalEditarBS.show();
    }
}

// Funções Utilitárias
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

function getBadgeClass(etapa) {
    switch (etapa) {
        case "NOVO": return "bg-primary";
        case "QUALIFICACAO": return "bg-warning text-dark";
        case "PROPOSTA": return "bg-info text-dark";
        case "NEGOCIACAO": return "bg-purple text-white";
        case "FECHAMENTO": return "bg-success";
        default: return "bg-secondary";
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