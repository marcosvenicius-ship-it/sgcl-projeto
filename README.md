# 🚀 SGCL — Sistema de Gerenciamento e Cadastro de Leads

Projeto desenvolvido como parte do Trabalho de Conclusão de Curso (TCC) / Atividade Curricular, com o objetivo de fornecer uma solução para captação, validação e gestão do fluxo comercial de leads e oportunidades de vendas.

---

## 📌 Objetivo do Projeto
Centralizar e estruturar o processo de entrada de novos prospects no funil de vendas, garantindo a integridade dos dados cadastrais, prevenção de duplicidades e persistência confiável em banco de dados relacional.

---

## 🛠️ Tecnologias Utilizadas

* **Back-end:** Java com Spring Boot (Spring Web, Spring Data JPA, Bean Validation)
* **Banco de Dados:** MySQL
* **Front-end:** HTML5, CSS3, JavaScript (Fetch API assíncrona)
* **Controle de Versão & Gestão:** Git, GitHub e Trello

---

## 🏗️ Arquitetura e Estrutura

O back-end segue o padrão em camadas para isolamento de responsabilidades:
* `controller`: Endpoints REST e controle de requisições HTTP.
* `service`: Regras de negócio e validações de duplicidade.
* `repository`: Interface de comunicação com o banco de dados via Spring Data JPA.
* `model`: Entidades mapeadas para a base de dados relacional.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
* Java JDK 17 ou superior
* Maven
* MySQL Server instalado e em execução

### Passo a Passo

1. **Configuração do Banco de Dados:**
   Crie o schema no MySQL:
   ```sql
   CREATE DATABASE sgcl_db;
