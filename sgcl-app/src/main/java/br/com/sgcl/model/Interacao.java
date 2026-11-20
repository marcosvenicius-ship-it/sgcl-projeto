package br.com.sgcl.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "interacao")
public class Interacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String tipo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "data_registro", nullable = false)
    private LocalDateTime dataRegistro = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "prospect_id", nullable = false)
    @JsonIgnoreProperties("interacoes")
    private Prospect prospect;

    public Interacao() {}

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public LocalDateTime getDataRegistro() { return dataRegistro; }
    public void setDataRegistro(LocalDateTime dataRegistro) { this.dataRegistro = dataRegistro; }

    public Prospect getProspect() { return prospect; }
    public void setProspect(Prospect prospect) { this.prospect = prospect; }
}