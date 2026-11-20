package br.com.sgcl.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "prospect")
public class Prospect {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String telefone;

    private String empresa;
    private String cnpj;
    private BigDecimal valor;

    @Column(nullable = false)
    private String origem;

    @Column(name = "etapa_funil", nullable = false)
    private String etapaFunil;

    @Column(name = "status_final")
    private String statusFinal = "EM_ANDAMENTO";

    @Column(name = "motivo_perda")
    private String motivoPerda;

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao = LocalDateTime.now();

    @Column(name = "data_fechamento")
    private LocalDateTime dataFechamento;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "senha"})
    private Usuario usuario;

    @OneToMany(mappedBy = "prospect", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("prospect")
    private List<Interacao> interacoes;

    public Prospect() {}

    @PrePersist
    public void prePersist() {
        if (this.dataCriacao == null) {
            this.dataCriacao = LocalDateTime.now();
        }
    }

    @PreUpdate
    public void preUpdate() {
        if (("GANHO".equals(this.statusFinal) || "PERDIDO".equals(this.statusFinal)) && this.dataFechamento == null) {
            this.dataFechamento = LocalDateTime.now();
        }
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }
    public String getEmpresa() { return empresa; }
    public void setEmpresa(String empresa) { this.empresa = empresa; }
    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }
    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }
    public String getOrigem() { return origem; }
    public void setOrigem(String origem) { this.origem = origem; }
    public String getEtapaFunil() { return etapaFunil; }
    public void setEtapaFunil(String etapaFunil) { this.etapaFunil = etapaFunil; }
    public String getStatusFinal() { return statusFinal; }
    public void setStatusFinal(String statusFinal) { this.statusFinal = statusFinal; }
    public String getMotivoPerda() { return motivoPerda; }
    public void setMotivoPerda(String motivoPerda) { this.motivoPerda = motivoPerda; }
    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }
    public LocalDateTime getDataFechamento() { return dataFechamento; }
    public void setDataFechamento(LocalDateTime dataFechamento) { this.dataFechamento = dataFechamento; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public List<Interacao> getInteracoes() { return interacoes; }
    public void setInteracoes(List<Interacao> interacoes) { this.interacoes = interacoes; }
}