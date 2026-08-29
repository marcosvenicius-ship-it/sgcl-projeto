// URL base da API REST rodando no IntelliJ
const API_URL = 'http://localhost:8080/api/prospects';

// Carrega os dados da API assim que a página é aberta
document.addEventListener('DOMContentLoaded', () => {
    carregarProspects();
});

// Evento de submissão do formulário
document.getElementById('formProspect').addEventListener('submit', async (e) => {
    e.preventDefault();

    const btnSalvar = document.getElementById('btnSalvar');
    btnSalvar.disabled = true;
    btnSalvar.innerText = 'Salvando no banco...';

    // Monta o payload JSON exatamente no modelo da Entity Java
    const prospect = {
        nome: document.getElementById('nome').value.trim(),
        email: document.getElementById('email').value.trim(),
        telefone: document.getElementById('telefone').value.trim(),
        empresa: document.getElementById('empresa').value.trim(),
        cnpj: document.getElementById('cnpj').value.trim(),
        origem: document.getElementById('origem').value
    };

    try {
        // Dispara a requisição HTTP POST para a API Spring Boot
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(prospect)
        });

        if (response.ok) {
            alert('Prospect cadastrado com sucesso!');
            document.getElementById('formProspect').reset();
            carregarProspects(); // Atualiza a tabela imediatamente
        } else {
            const mensagemErro = await response.text();
            alert('Erro ao cadastrar: ' + mensagemErro);
        }
    } catch (error) {
        alert('Erro de comunicação com o servidor: ' + error.message);
    } finally {
        btnSalvar.disabled = false;
        btnSalvar.innerText = 'Cadastrar Prospect';
    }
});

// Função para buscar e renderizar os prospects via GET
async function carregarProspects() {
    const tbody = document.getElementById('tabelaProspects');
    
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`Status ${response.status}`);
        }

        const prospects = await response.json();
        tbody.innerHTML = '';

        if (prospects.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4 text-muted">
                        Nenhum prospect cadastrado no banco de dados.
                    </td>
                </tr>
            `;
            return;
        }

        prospects.forEach((p) => {
            tbody.innerHTML += `
                <tr>
                    <td class="fw-bold text-secondary">#${p.id}</td>
                    <td>
                        <div class="fw-semibold text-dark">${p.nome}</div>
                        <small class="text-muted">${p.email}</small>
                    </td>
                    <td>${p.telefone}</td>
                    <td>
                        <div>${p.empresa || '<span class="text-muted">-</span>'}</div>
                        <small class="text-muted">${p.cnpj || '-'}</small>
                    </td>
                    <td><span class="badge-origem">${p.origem}</span></td>
                    <td><span class="badge-etapa-novo">${p.etapaFunil}</span></td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Erro ao consultar a API REST:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4 text-danger">
                    Não foi possível carregar os dados. Verifique se a API no IntelliJ está em execução na porta 8080.
                </td>
            </tr>
        `;
    }
}