const BASE_URL = "http://localhost:8080";
const API_URL = `${BASE_URL}/prospects`;
const USUARIOS_URL = `${BASE_URL}/usuarios`;
const AUTH_URL = `${BASE_URL}/auth/login`;
const REGISTER_URL = `${BASE_URL}/auth/registrar`;
const CHANGE_PASS_URL = `${BASE_URL}/auth/alterar-senha`;
const DASHBOARD_URL = `${BASE_URL}/dashboard/metricas`;

let modalEditarBS = null;
let modalHistoricoBS = null;
let modalEncerramentoBS = null;
let modalSenhaBS = null;

let prospectsGerais = [];
let usuariosGerais = [];
let usuarioLogado = null;

let chartEtapasInstance = null;
let chartCanaisInstance = null;

const ESTAGIOS = [
    { chave: "NOVO", titulo: "1. Novo", cor: "border-top-primary" },
    { chave: "QUALIFICACAO", titulo: "2. Qualificação", cor: "border-top-warning" },
    { chave: "PROPOSTA", titulo: "3. Proposta", cor: "border-top-info" },
    { chave: "NEGOCIACAO", titulo: "4. Negociação", cor: "border-top-purple" },
    { chave: "FECHAMENTO", titulo: "5. Fechamento", cor: "border-top-success" }
];

document.addEventListener("DOMContentLoaded", () => {
    const elModalEdit = document.getElementById("modalEditar");
    if (elModalEdit && typeof bootstrap !== "undefined") modalEditarBS = new bootstrap.Modal(elModalEdit);

    const elModalHist = document.getElementById("modalHistorico");
    if (elModalHist && typeof bootstrap !== "undefined") modalHistoricoBS = new bootstrap.Modal(elModalHist);

    const elModalEnc = document.getElementById("modalEncerramento");
    if (elModalEnc && typeof bootstrap !== "undefined") modalEncerramentoBS = new bootstrap.Modal(elModalEnc);

    const elModalSenha = document.getElementById("modalAlterarSenha");
    if (elModalSenha && typeof bootstrap !== "undefined") modalSenhaBS = new bootstrap.Modal(elModalSenha);

    document.getElementById("formLogin").addEventListener("submit", autenticarUsuario);
    document.getElementById("formRegistro").addEventListener("submit", registrarNovoUsuario);
    document.getElementById("formAlterarSenha").addEventListener("submit", alterarSenhaUsuario);
    document.getElementById("formProspect").addEventListener("submit", cadastrarProspect);
    document.getElementById("formEditarProspect").addEventListener("submit", salvarEdicaoProspect);
    document.getElementById("formInteracao").addEventListener("submit", registrarInteracao);

    const sessaoSalva = sessionStorage.getItem("sgcl_usuario");
    if (sessaoSalva) {
        usuarioLogado = JSON.parse(sessaoSalva);
        iniciarSessaoSistema();
    }
});

// ==================== AUTENTICAÇÃO, REGISTRO E ALTERAÇÃO DE SENHA ====================

function alternarModoAuth(modo) {
    const fLogin = document.getElementById("formLogin");
    const fReg = document.getElementById("formRegistro");
    const blocoDemo = document.getElementById("blocoDemoAuth");
    const subtitulo = document.getElementById("subtituloAuth");

    if (modo === "registro") {
        fLogin.classList.add("d-none");
        blocoDemo.classList.add("d-none");
        fReg.classList.remove("d-none");
        subtitulo.innerText = "Criar Novo Usuário no SGCL";
    } else {
        fReg.classList.add("d-none");
        fLogin.classList.remove("d-none");
        blocoDemo.classList.remove("d-none");
        subtitulo.innerText = "Acesso ao Sistema de Gestão de Oportunidades";
    }
}

function preencherLoginDemo(email, senha) {
    document.getElementById("loginEmail").value = email;
    document.getElementById("loginSenha").value = senha;
}

async function autenticarUsuario(event) {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const senha = document.getElementById("loginSenha").value;
    const divErro = document.getElementById("loginErro");
    divErro.classList.add("d-none");

    try {
        const response = await fetch(AUTH_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha })
        });

        if (response.ok) {
            usuarioLogado = await response.json();
            sessionStorage.setItem("sgcl_usuario", JSON.stringify(usuarioLogado));
            iniciarSessaoSistema();
        } else {
            divErro.innerText = "Credenciais inválidas. Verifique e-mail e senha.";
            divErro.classList.remove("d-none");
        }
    } catch (error) {
        divErro.innerText = "Erro de conexão com o servidor Spring Boot (porta 8080).";
        divErro.classList.remove("d-none");
    }
}

async function registrarNovoUsuario(event) {
    event.preventDefault();
    const divErro = document.getElementById("regErro");
    divErro.classList.add("d-none");

    const novoUsuario = {
        nome: document.getElementById("regNome").value,
        email: document.getElementById("regEmail").value,
        senha: document.getElementById("regSenha").value,
        perfil: document.getElementById("regPerfil").value,
        cargo: document.getElementById("regCargo").value
    };

    try {
        const response = await fetch(REGISTER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(novoUsuario)
        });

        const dados = await response.json();
        if (response.ok) {
            usuarioLogado = dados;
            sessionStorage.setItem("sgcl_usuario", JSON.stringify(usuarioLogado));
            document.getElementById("formRegistro").reset();
            alternarModoAuth("login");
            iniciarSessaoSistema();
        } else {
            divErro.innerText = dados.erro || "Erro ao criar conta.";
            divErro.classList.remove("d-none");
        }
    } catch (error) {
        divErro.innerText = "Erro de conexão com o servidor.";
        divErro.classList.remove("d-none");
    }
}

function abrirModalSenha() {
    document.getElementById("formAlterarSenha").reset();
    document.getElementById("msgSenha").classList.add("d-none");
    modalSenhaBS.show();
}

async function alterarSenhaUsuario(event) {
    event.preventDefault();
    const senhaAtual = document.getElementById("senhaAtual").value;
    const novaSenha = document.getElementById("novaSenha").value;
    const msgBox = document.getElementById("msgSenha");

    try {
        const response = await fetch(CHANGE_PASS_URL, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: usuarioLogado.email,
                senhaAtual: senhaAtual,
                novaSenha: novaSenha
            })
        });

        const dados = await response.json();
        msgBox.classList.remove("d-none", "alert-danger", "alert-success");

        if (response.ok) {
            msgBox.classList.add("alert-success");
            msgBox.innerText = dados.mensagem;
            setTimeout(() => modalSenhaBS.hide(), 1200);
        } else {
            msgBox.classList.add("alert-danger");
            msgBox.innerText = dados.erro || "Erro ao alterar senha.";
        }
    } catch (error) {
        msgBox.classList.remove("d-none");
        msgBox.classList.add("alert-danger");
        msgBox.innerText = "Erro na conexão com o servidor.";
    }
}

// ==================== CONTROLE DE PERMISSÕES E RESTRIÇÃO DE VISUALIZAÇÃO ====================

function iniciarSessaoSistema() {
    document.getElementById("telaLogin").classList.add("d-none");
    document.getElementById("telaSistema").classList.remove("d-none");

    document.getElementById("nomeUsuarioLogado").innerText = usuarioLogado.nome;
    document.getElementById("cargoUsuarioLogado").innerText = usuarioLogado.cargo;
    document.getElementById("badgePerfilUsuario").innerText = `PERFIL: ${usuarioLogado.perfil}`;

    aplicarPermissoesPerfil();
    atualizarTudo();
}

function aplicarPermissoesPerfil() {
    const isGestor = usuarioLogado && usuarioLogado.perfil === "GESTOR";
    const btnExportar = document.getElementById("btnExportarCSV");
    const avisoPermissao = document.getElementById("avisoPermissao");
    const divFiltroVendedor = document.getElementById("divFiltroVendedorGestor");
    const tituloTabela = document.getElementById("tituloTabelaProspects");
    const tituloEscopoDash = document.getElementById("tituloEscopoDashboard");
    const badgeEscopoDash = document.getElementById("badgeEscopoDashboard");

    if (isGestor) {
        btnExportar.classList.remove("d-none");
        divFiltroVendedor.classList.remove("d-none");
        avisoPermissao.innerText = "👑 Visão Gestor: Acesso total à equipe, exclusão e relatórios";
        tituloTabela.innerText = "Base Geral de Oportunidades (Toda a Equipe)";
        tituloEscopoDash.innerText = "📊 Indicadores Consolidados da Equipe Comercial";
        badgeEscopoDash.innerText = "VISÃO GLOBAL (GESTOR)";
        alternarAba("dashboard");
    } else {
        btnExportar.classList.add("d-none");
        divFiltroVendedor.classList.add("d-none");
        avisoPermissao.innerText = "👤 Visão Vendedor: Exibindo apenas suas oportunidades atribuídas";
        tituloTabela.innerText = `Minhas Oportunidades (${usuarioLogado.nome})`;
        tituloEscopoDash.innerText = `📊 Meus Indicadores Individuais (${usuarioLogado.nome})`;
        badgeEscopoDash.innerText = "VISÃO RESTRITA (VENDEDOR)";
        alternarAba("operacao");
    }
}

function fazerLogout() {
    sessionStorage.removeItem("sgcl_usuario");
    usuarioLogado = null;
    document.getElementById("telaSistema").classList.add("d-none");
    document.getElementById("telaLogin").classList.remove("d-none");
}

function alternarAba(aba) {
    const secDash = document.getElementById("secaoDashboard");
    const secOp = document.getElementById("secaoOperacao");
    const btnDash = document.getElementById("btnAbaDashboard");
    const btnOp = document.getElementById("btnAbaOperacao");

    if (aba === "dashboard") {
        secDash.classList.remove("d-none");
        secOp.classList.add("d-none");
        btnDash.classList.add("active");
        btnOp.classList.remove("active");
        carregarMetricasDashboard();
    } else {
        secDash.classList.add("d-none");
        secOp.classList.remove("d-none");
        btnDash.classList.remove("active");
        btnOp.classList.add("active");
    }
}

async function atualizarTudo() {
    await carregarUsuarios();
    await carregarProspects();
    await carregarMetricasDashboard();
}

// ==================== DASHBOARD & MÉTRICAS ====================

async function carregarMetricasDashboard() {
    if (!usuarioLogado) return;
    try {
        const url = `${DASHBOARD_URL}?usuarioId=${usuarioLogado.id}&perfil=${usuarioLogado.perfil}`;
        const response = await fetch(url);
        if (!response.ok) return;
        const dados = await response.json();

        document.getElementById("kpiTotalLeads").innerText = dados.totalLeads;
        document.getElementById("kpiTaxaConversao").innerText = `${dados.taxaConversaoGeral}%`;
        document.getElementById("kpiSubConversao").innerText = `${dados.totalGanhos} vendas ganhas / ${dados.totalPerdidos} perdidas`;
        document.getElementById("kpiTempoMedio").innerText = `${dados.tempoMedioDias} dias`;
        document.getElementById("kpiReceitaGanha").innerText = formatarMoeda(dados.receitaGanha);

        renderizarGraficoEtapas(dados.porEtapa, dados.conversaoPorEtapa);
        renderizarGraficoCanais(dados.porCanal);
        renderizarTabelaCanais(dados.porCanal);
    } catch (error) {
        console.error("Erro ao carregar métricas:", error);
    }
}

function renderizarGraficoEtapas(porEtapa, conversaoPorEtapa) {
    const ctx = document.getElementById("graficoEtapas");
    if (!ctx) return;

    const labels = ["1. Novo", "2. Qualificação", "3. Proposta", "4. Negociação", "5. Fechamento"];
    const chaves = ["NOVO", "QUALIFICACAO", "PROPOSTA", "NEGOCIACAO", "FECHAMENTO"];
    const valores = chaves.map(k => porEtapa[k] || 0);
    const percentuais = chaves.map(k => conversaoPorEtapa[k] || 0);

    if (chartEtapasInstance) chartEtapasInstance.destroy();

    chartEtapasInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                { label: "Quantidade de Leads", data: valores, backgroundColor: "#323232", borderRadius: 6 },
                { label: "% do Funil", data: percentuais, backgroundColor: "#d4a373", borderRadius: 6 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }
    });
}

function renderizarGraficoCanais(porCanal) {
    const ctx = document.getElementById("graficoCanais");
    if (!ctx) return;

    const chaves = Object.keys(porCanal);
    const labels = chaves.map(k => formatarOrigem(k));
    const totais = chaves.map(k => porCanal[k].total);

    if (chartCanaisInstance) chartCanaisInstance.destroy();

    chartCanaisInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{ data: totais, backgroundColor: ["#323232", "#00ABE4", "#d4a373", "#81c784", "#8c827a"] }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }
    });
}

function renderizarTabelaCanais(porCanal) {
    const tbody = document.getElementById("tabelaMetricasCanais");
    if (!tbody) return;
    tbody.innerHTML = "";

    Object.entries(porCanal).forEach(([canal, info]) => {
        tbody.innerHTML += `
            <tr>
                <td class="fw-bold">${formatarOrigem(canal)}</td>
                <td>${info.total} leads</td>
                <td><span class="badge bg-success-subtle text-success">${info.ganhos} ganhos</span></td>
                <td class="fw-bold">${info.taxaConversao}%</td>
            </tr>
        `;
    });
}

function exportarRelatorioCSV() {
    let csv = "ID;Nome;Empresa;Valor;Canal;Etapa;Status;Responsavel\n";
    prospectsGerais.forEach(p => {
        const resp = p.usuario ? p.usuario.nome : "Sem dono";
        csv += `${p.id};"${p.nome}";"${p.empresa || ''}";${p.valor || 0};${p.origem};${p.etapaFunil};${p.statusFinal};"${resp}"\n`;
    });

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "relatorio_conversao_sgcl.csv";
    link.click();
}

// ==================== OPERAÇÃO (KANBAN, BASE, HISTÓRICO E ENCERRAMENTO) ====================

async function carregarUsuarios() {
    try {
        const response = await fetch(USUARIOS_URL);
        if (response.ok) {
            usuariosGerais = await response.json();
            const isGestor = usuarioLogado && usuarioLogado.perfil === "GESTOR";

            const selectCad = document.getElementById("usuarioSelect");
            const selectEdit = document.getElementById("editUsuarioSelect");
            const selectFiltroVendedor = document.getElementById("filtroVendedor");

            if (isGestor) {
                let options = '<option value="" disabled selected>Selecione o Responsável...</option>';
                let filtroOpts = '<option value="TODOS">Toda a Equipe Comercial</option>';
                usuariosGerais.forEach(u => {
                    options += `<option value="${u.id}">${escapeHtml(u.nome)} (${escapeHtml(u.cargo)})</option>`;
                    filtroOpts += `<option value="${u.id}">${escapeHtml(u.nome)}</option>`;
                });
                selectCad.innerHTML = options;
                selectCad.disabled = false;
                selectEdit.innerHTML = options;
                selectEdit.disabled = false;
                selectFiltroVendedor.innerHTML = filtroOpts;
            } else {
                const selfOption = `<option value="${usuarioLogado.id}" selected>${escapeHtml(usuarioLogado.nome)} (${escapeHtml(usuarioLogado.cargo)})</option>`;
                selectCad.innerHTML = selfOption;
                selectCad.disabled = true;
                selectEdit.innerHTML = selfOption;
                selectEdit.disabled = true;
            }
        }
    } catch (e) { console.error(e); }
}

async function carregarProspects() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Erro ao consultar API");
        const todos = await response.json();

        if (usuarioLogado && usuarioLogado.perfil === "VENDEDOR") {
            prospectsGerais = todos.filter(p => p.usuario && p.usuario.id === usuarioLogado.id);
        } else {
            prospectsGerais = todos;
        }

        aplicarFiltros();
    } catch (e) { console.error(e); }
}

function aplicarFiltros() {
    const etapaSel = document.getElementById("filtroEtapa").value;
    const origemSel = document.getElementById("filtroOrigem").value;
    const vendedorSel = document.getElementById("filtroVendedor").value;

    const filtrados = prospectsGerais.filter(p => {
        const matchEtapa = (etapaSel === "TODAS" || p.etapaFunil === etapaSel);
        const matchOrigem = (origemSel === "TODOS" || p.origem === origemSel);
        const matchVendedor = (vendedorSel === "TODOS" || (p.usuario && p.usuario.id == vendedorSel));
        return matchEtapa && matchOrigem && matchVendedor;
    });

    renderizarTabela(filtrados);
    renderizarKanban(filtrados);
}

function renderizarTabela(lista) {
    const tbody = document.getElementById("tabelaProspects");
    tbody.innerHTML = "";
    const isGestor = usuarioLogado && usuarioLogado.perfil === "GESTOR";

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-3">Nenhuma oportunidade encontrada para este perfil/filtro.</td></tr>`;
        return;
    }

    lista.forEach(p => {
        const nomeResp = p.usuario ? p.usuario.nome : "Não atribuído";
        const statusBadge = getStatusFinalBadge(p.statusFinal);
        const btnExcluir = isGestor
            ? `<button class="btn btn-sm btn-outline-danger" onclick="deletarProspect(${p.id})">Excluir</button>`
            : `<button class="btn btn-sm btn-outline-secondary" disabled title="Apenas Gestores podem excluir">🔒</button>`;

        tbody.innerHTML += `
            <tr>
                <td><strong>#${p.id}</strong></td>
                <td>
                    <div class="fw-bold">${escapeHtml(p.nome)}</div>
                    <small class="text-muted">${escapeHtml(p.email)}</small>
                </td>
                <td>
                    <div>${escapeHtml(p.empresa || '-')}</div>
                    <small class="fw-semibold text-success">${formatarMoeda(p.valor)}</small>
                </td>
                <td><small class="fw-semibold text-dark">👤 ${escapeHtml(nomeResp)}</small></td>
                <td><span class="badge bg-light text-dark border">${formatarOrigem(p.origem)}</span></td>
                <td>
                    <span class="badge bg-secondary text-white me-1">${formatarEtapa(p.etapaFunil)}</span>
                    ${statusBadge}
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-secondary me-1" title="Histórico" onclick="abrirHistorico(${p.id}, '${escapeHtml(p.nome)}')">💬</button>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="prepararEdicao(${p.id})">Editar</button>
                    <button class="btn btn-sm btn-outline-dark me-1" title="Encerrar" onclick="abrirModalEncerramento(${p.id})">🏁</button>
                    ${btnExcluir}
                </td>
            </tr>
        `;
    });
}

function renderizarKanban(lista) {
    const board = document.getElementById("kanbanBoard");
    board.innerHTML = "";
    const isGestor = usuarioLogado && usuarioLogado.perfil === "GESTOR";

    ESTAGIOS.forEach(estagio => {
        const itensColuna = lista.filter(p => p.etapaFunil === estagio.chave);
        const colDiv = document.createElement("div");
        colDiv.className = "col-md";

        let cardsHtml = "";
        itensColuna.forEach(item => {
            const nomeVendedor = item.usuario ? item.usuario.nome : "Sem dono";
            const statusBadge = item.statusFinal !== 'EM_ANDAMENTO' ? getStatusFinalBadge(item.statusFinal) : '';
            const btnAtribuir = isGestor
                ? `<button class="btn btn-xs btn-outline-secondary py-0 px-1" onclick="atribuirVendedorRapido(${item.id})">✏️ Atribuir</button>`
                : '';

            cardsHtml += `
                <div class="card kanban-item p-2 mb-2 border">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="fw-bold fs-7 text-dark">${escapeHtml(item.nome)}</div>
                        ${statusBadge}
                    </div>
                    <div class="text-muted fs-8">${escapeHtml(item.empresa || 'Sem empresa')} • <strong class="text-success">${formatarMoeda(item.valor)}</strong></div>
                    <div class="d-flex align-items-center justify-content-between mt-1">
                        <small class="text-dark fs-8 fw-semibold">👤 ${escapeHtml(nomeVendedor)}</small>
                        ${btnAtribuir}
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
                <div class="card-body p-2 kanban-cards-container">${cardsHtml}</div>
            </div>
        `;
        board.appendChild(colDiv);
    });
}

async function atribuirVendedorRapido(prospectId) {
    if (usuarioLogado.perfil !== "GESTOR") return;
    let mensagem = "Selecione o ID do Vendedor:\n\n";
    usuariosGerais.forEach(u => { mensagem += `ID [${u.id}] - ${u.nome} (${u.cargo})\n`; });
    const escolhaId = prompt(mensagem);
    if (!escolhaId) return;

    const vendedor = usuariosGerais.find(u => u.id == escolhaId);
    if (!vendedor) return alert("ID inválido.");

    const item = prospectsGerais.find(p => p.id === prospectId);
    item.usuario = { id: vendedor.id };

    const response = await fetch(`${API_URL}/${prospectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
    });
    if (response.ok) atualizarTudo();
}

async function cadastrarProspect(event) {
    event.preventDefault();
    const usuarioId = usuarioLogado.perfil === "GESTOR"
        ? parseInt(document.getElementById("usuarioSelect").value)
        : usuarioLogado.id;

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
        valor: parseFloat(document.getElementById("valor").value) || 0,
        cnpj: document.getElementById("cnpj").value,
        origem: document.getElementById("origem").value,
        etapaFunil: document.getElementById("etapaFunil").value,
        usuario: { id: usuarioId }
    };

    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prospect)
    });

    if (response.ok) {
        alert("Oportunidade cadastrada com sucesso!");
        document.getElementById("formProspect").reset();
        atualizarTudo();
    } else {
        alert("Erro ao cadastrar (verifique se o e-mail já existe).");
    }
}

async function abrirHistorico(prospectId, nome) {
    document.getElementById("interacaoProspectId").value = prospectId;
    document.getElementById("historicoNomeProspect").innerText = nome;
    document.getElementById("interacaoDescricao").value = "";

    document.getElementById("editId").value = item.id;
    document.getElementById("editNome").value = item.nome || "";
    document.getElementById("editEmail").value = item.email || "";
    document.getElementById("editTelefone").value = item.telefone || "";
    document.getElementById("editEmpresa").value = item.empresa || "";
    document.getElementById("editValor").value = item.valor || 0;
    document.getElementById("editCnpj").value = item.cnpj || "";
    document.getElementById("editOrigem").value = item.origem || "SITE";
    document.getElementById("editEtapaFunil").value = item.etapaFunil || "NOVO";
    if (item.usuario) document.getElementById("editUsuarioSelect").value = item.usuario.id;

    modalEditarBS.show();
}

async function salvarEdicaoProspect(event) {
    event.preventDefault();
    const id = document.getElementById("editId").value;
    const itemOriginal = prospectsGerais.find(p => p.id == id);

    const usuarioId = usuarioLogado.perfil === "GESTOR"
        ? parseInt(document.getElementById("editUsuarioSelect").value)
        : usuarioLogado.id;

    const prospect = {
        ...itemOriginal,
        nome: document.getElementById("editNome").value,
        email: document.getElementById("editEmail").value,
        telefone: document.getElementById("editTelefone").value,
        empresa: document.getElementById("editEmpresa").value,
        valor: parseFloat(document.getElementById("editValor").value) || 0,
        cnpj: document.getElementById("editCnpj").value,
        origem: document.getElementById("editOrigem").value,
        etapaFunil: document.getElementById("editEtapaFunil").value,
        usuario: { id: usuarioId }
    };

    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prospect)
    });

    if (response.ok) {
        modalEditarBS.hide();
        atualizarTudo();
    }
}

async function deletarProspect(id) {
    if (usuarioLogado.perfil !== "GESTOR") {
        return alert("Acesso negado: Apenas usuários com perfil GESTOR podem excluir registros.");
    }
    if (confirm("Deseja realmente excluir este prospect?")) {
        const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (response.ok) atualizarTudo();
    }
}

async function abrirHistorico(prospectId, nome) {
    document.getElementById("interacaoProspectId").value = prospectId;
    document.getElementById("historicoNomeProspect").innerText = nome;
    await carregarInteracoes(prospectId);
    modalHistoricoBS.show();
}

async function carregarInteracoes(prospectId) {
    const response = await fetch(`${API_URL}/${prospectId}/interacoes`);
    const interacoes = await response.json();
    const container = document.getElementById("listaInteracoes");
    container.innerHTML = interacoes.length === 0 ? '<p class="text-muted text-center py-3">Nenhuma anotação registrada.</p>' : '';

    interacoes.forEach(i => {
        const dataFmt = new Date(i.dataRegistro).toLocaleString('pt-BR');
        container.innerHTML += `
            <div class="list-group-item">
                <div class="d-flex justify-content-between">
                    <strong class="fs-7">${i.tipo}</strong>
                    <small class="text-muted fs-8">${dataFmt}</small>
                </div>
                <p class="mb-0 fs-7">${escapeHtml(i.descricao)}</p>
            </div>
        `;
    });
}

async function registrarInteracao(event) {
    event.preventDefault();
    const prospectId = document.getElementById("interacaoProspectId").value;
    const interacao = {
        tipo: document.getElementById("interacaoTipo").value,
        descricao: document.getElementById("interacaoDescricao").value
    };
    const response = await fetch(`${API_URL}/${prospectId}/interacoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(interacao)
    });
    if (response.ok) {
        document.getElementById("interacaoDescricao").value = "";
        carregarInteracoes(prospectId);
    }
}

function abrirModalEncerramento(id) {
    document.getElementById("encerraProspectId").value = id;
    document.getElementById("divMotivoPerda").classList.add("d-none");
    modalEncerramentoBS.show();
}

function exibirMotivoPerda() {
    document.getElementById("divMotivoPerda").classList.remove("d-none");
}

async function definirStatusFinal(status) {
    const id = document.getElementById("encerraProspectId").value;
    const item = prospectsGerais.find(p => p.id == id);
    item.statusFinal = status;
    item.dataFechamento = new Date().toISOString();

    if (status === 'PERDIDO') {
        item.motivoPerda = document.getElementById("motivoPerdaSelect").value;
    } else {
        item.motivoPerda = null;
        item.etapaFunil = "FECHAMENTO";
    }

    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
    });

    if (response.ok) {
        modalEncerramentoBS.hide();
        atualizarTudo();
    }
}

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarOrigem(origem) {
    const mapa = { "SITE": "Site", "RD_STATION": "RD Station", "INDICACAO": "Indicação", "EVENTO": "Evento", "OUTRO": "Outro" };
    return mapa[origem] || origem || "-";
}

function formatarEtapa(etapa) {
    const mapa = { "NOVO": "Novo", "QUALIFICACAO": "Qualificação", "PROPOSTA": "Proposta", "NEGOCIACAO": "Negociação", "FECHAMENTO": "Fechamento" };
    return mapa[etapa] || etapa;
}

function getStatusFinalBadge(status) {
    if (status === "GANHO") return '<span class="badge bg-success fs-8">✓ Ganho</span>';
    if (status === "PERDIDO") return '<span class="badge bg-danger fs-8">✕ Perdido</span>';
    return '';
}

function escapeHtml(texto) {
    if (!texto) return "";
    return String(texto).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}