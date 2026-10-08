package br.com.sgcl.controller;

import br.com.sgcl.model.Prospect;
import br.com.sgcl.service.ProspectService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/prospects")
@CrossOrigin(origins = "*")
public class ProspectController {

    private final ProspectService prospectService;

    public ProspectController(ProspectService prospectService) {
        this.prospectService = prospectService;
    }

    @GetMapping
    public ResponseEntity<List<Prospect>> listarTodos() {
        return ResponseEntity.ok(prospectService.listarTodos());
    }

    @PostMapping
    public ResponseEntity<?> cadastrarProspect(@RequestBody Prospect prospect) {
        try {
            Prospect novoProspect = prospectService.cadastrarProspect(prospect);
            return ResponseEntity.status(HttpStatus.CREATED).body(novoProspect);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizarProspect(@PathVariable Long id, @RequestBody Prospect prospect) {
        try {
            Prospect prospectAtualizado = prospectService.atualizarProspect(id, prospect);
            return ResponseEntity.ok(prospectAtualizado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletarProspect(@PathVariable Long id) {
        try {
            prospectService.deletarProspect(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}