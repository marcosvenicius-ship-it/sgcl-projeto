package br.com.sgcl.controller;

import br.com.sgcl.model.Interacao;
import br.com.sgcl.model.Prospect;
import br.com.sgcl.repository.InteracaoRepository;
import br.com.sgcl.repository.ProspectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/prospects")
@CrossOrigin(origins = "*")
public class InteracaoController {

    @Autowired
    private InteracaoRepository interacaoRepository;

    @Autowired
    private ProspectRepository prospectRepository;

    @GetMapping("/{id}/interacoes")
    public ResponseEntity<List<Interacao>> listarInteracoes(@PathVariable Long id) {
        return ResponseEntity.ok(interacaoRepository.findByProspectIdOrderByDataRegistroDesc(id));
    }

    @PostMapping("/{id}/interacoes")
    public ResponseEntity<Interacao> adicionarInteracao(@PathVariable Long id, @RequestBody Interacao interacao) {
        Prospect prospect = prospectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prospect não encontrado"));
        interacao.setProspect(prospect);
        Interacao salva = interacaoRepository.save(interacao);
        return ResponseEntity.status(201).body(salva);
    }
}