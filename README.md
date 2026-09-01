# SGCL — Sistema de Gerenciamento e Cadastro de Leads

Projeto desenvolvido como parte do Trabalho de Conclusão de Curso (TCC) com o objetivo de fornecer uma solução para captação, validação e gestão do fluxo comercial de leads e oportunidades de vendas.

---

## Sobre o Projeto

O **SGCL (Sistema de Gerenciamento e Cadastro de Leads)** foi projetado para resolver o problema de dispersão de contatos e perda de dados comerciais em processos de vendas. 

O sistema implementa uma **fatia vertical completa** (Front-end responsivo, API REST desacoplada e Banco de Dados Relacional), permitindo a captação estruturada de prospects corporativos com regras de integridade e prevenção de duplicidade.

---
## Tecnologias e Ferramentas

### Back-end
* **Linguagem:** Java 17+
* **Framework:** Spring Boot 3 (Spring Web, Spring Data JPA, Bean Validation)
* **ORM:** Hibernate
* **Gerenciador de Dependências:** Maven

### Front-end
* **Interface:** HTML5 Semântico, CSS3 (Design moderno e responsivo)
* **Comunicação Assíncrona:** JavaScript Moderno (Fetch API / JSON)

### Banco de Dados & Infraestrutura
* **SGBD:** MySQL 8.0
* **Modelagem:** Entidades relacionais com restrições de unicidade (`UNIQUE`) e carimbos de auditoria (`created_at`)

### Gestão & Versionamento
* **Metodologia:** Planejamento ágil no Trello estruturado em Histórias de Usuário / Requisitos Funcionais.
* **Controle de Versão:** Git & GitHub.

---

## Arquitetura do Sistema

O back-end adota uma arquitetura em camadas bem delimitada para garantir desacoplamento, testabilidade e manutenibilidade:

```text
src/main/java/com/.../sgcl/
│
├── controller/     # Camada de Apresentação / Endpoints REST (HTTP Request/Response)
├── service/        # Camada de Negócio (Regras de validação e duplicidade)
├── repository/     # Camada de Acesso a Dados (Spring Data JPA / Queries)
└── model/          # Entidades de Domínio mapeadas para tabelas do MySQL

---

## Diagramas UML (avaliação final)

Documentação arquitetural em [docs/](docs/):

* [Diagrama de casos de uso](docs/diagrama-casos-de-uso.png)
* [Diagrama de classes](docs/diagrama-classes.png)

Mais detalhes em [docs/README.md](docs/README.md).
