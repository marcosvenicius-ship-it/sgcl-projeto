package br.com.sgcl.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "prospect")
public class Prospect {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O nome é obrigatório")
    @Column(nullable = false, length = 100)
    private String nome;

    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "Informe um e-mail válido")
    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @NotBlank(message = "O telefone é obrigatório")
    @Column(nullable = false, length = 20)
    private String telefone;

    @Column(length = 100)
    private String empresa;

    @Column(length = 18)
    private String cnpj;

    @NotBlank(message = "A origem é obrigatória")
    @Column(nullable = false, length = 30)
    private String origem;

    @Column(name = "etapa_funil", nullable = false, length = 30)
    private String etapaFunil;

    @Column(name = "data_cadastro", nullable = false, updatable = false)
    private LocalDateTime dataCadastro;

    // --- NOVOS CAMPOS AC3 ---

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_final", nullable = false, length = 20)
    private StatusFinalEnum statusFinal = StatusFinalEnum.EM_ANDAMENTO;

    @Enumerated(EnumType.STRING)
    @Column(name = "motivo_perda", length = 50)
    private MotivoPerdaEnum motivoPerda;

    // ------------------------

    public Prospect() {}

    @PrePersist
    public void prePersist() {
        if (this.etapaFunil == null || this.etapaFunil.isBlank()) {
            this.etapaFunil = "NOVO";
        }
        if (this.statusFinal == null) {
            this.statusFinal = StatusFinalEnum.EM_ANDAMENTO;
        }
        this.dataCadastro = LocalDateTime.now();
    }

    // Getters e Setters Atuais
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

    public String getOrigem() { return origem; }
    public void setOrigem(String origem) { this.origem = origem; }

    public String getEtapaFunil() { return etapaFunil; }
    public void setEtapaFunil(String etapaFunil) { this.etapaFunil = etapaFunil; }

    public LocalDateTime getDataCadastro() { return dataCadastro; }
    public void setDataCadastro(LocalDateTime dataCadastro) { this.dataCadastro = dataCadastro; }

    // Novos Getters e Setters AC3
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public StatusFinalEnum getStatusFinal() { return statusFinal; }
    public void setStatusFinal(StatusFinalEnum statusFinal) { this.statusFinal = statusFinal; }

    public MotivoPerdaEnum getMotivoPerda() { return motivoPerda; }
    public void setMotivoPerda(MotivoPerdaEnum motivoPerda) { this.motivoPerda = motivoPerda; }
}