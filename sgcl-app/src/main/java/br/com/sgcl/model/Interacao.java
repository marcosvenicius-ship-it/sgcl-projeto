package br.com.sgcl.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "interacao")
public class Interacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoInteracaoEnum tipo;

    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "data_registro", nullable = false, updatable = false)
    private LocalDateTime dataRegistro = LocalDateTime.now();

    @JsonIgnore // <-- VITAL PARA EVITAR ERRO DE LOOP CIRCULAR NO JSON
    @ManyToOne
    @JoinColumn(name = "prospect_id", nullable = false)
    private Prospect prospect;

    public Interacao() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public TipoInteracaoEnum getTipo() { return tipo; }
    public void setTipo(TipoInteracaoEnum tipo) { this.tipo = tipo; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public LocalDateTime getDataRegistro() { return dataRegistro; }
    public void setDataRegistro(LocalDateTime dataRegistro) { this.dataRegistro = dataRegistro; }

    public Prospect getProspect() { return prospect; }
    public void setProspect(Prospect prospect) { this.prospect = prospect; }
}