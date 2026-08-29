package br.com.sgcl.controller;

import br.com.sgcl.model.Prospect;
import br.com.sgcl.service.ProspectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prospects")
@CrossOrigin(origins = "*")
public class ProspectController {

    private final ProspectService prospectService;

    public ProspectController(ProspectService prospectService) {
        this.prospectService = prospectService;
    }

    @PostMapping
    public ResponseEntity<?> cadastrar(@Valid @RequestBody Prospect prospect) {
        try {
            Prospect prospectSalvo = prospectService.cadastrarProspect(prospect);
            return ResponseEntity.status(HttpStatus.CREATED).body(prospectSalvo);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Prospect>> listar() {
        List<Prospect> prospects = prospectService.listarTodos();
        return ResponseEntity.ok(prospects);
    }
}
