package br.com.sgcl.controller;

import br.com.sgcl.model.Usuario;
import br.com.sgcl.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credenciais) {
        String email = credenciais.get("email");
        String senha = credenciais.get("senha");

        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);

        if (usuarioOpt.isPresent() && usuarioOpt.get().getSenha().equals(senha)) {
            Usuario u = usuarioOpt.get();
            return ResponseEntity.ok(Map.of(
                    "id", u.getId(),
                    "nome", u.getNome(),
                    "email", u.getEmail(),
                    "perfil", u.getPerfil(),
                    "cargo", u.getCargo()
            ));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("erro", "E-mail ou senha inválidos."));
    }

    @PostMapping("/registrar")
    public ResponseEntity<?> registrar(@RequestBody Usuario novoUsuario) {
        if (usuarioRepository.findByEmail(novoUsuario.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", "Este e-mail já está cadastrado no sistema."));
        }

        if (novoUsuario.getPerfil() == null || novoUsuario.getPerfil().isEmpty()) {
            novoUsuario.setPerfil("VENDEDOR");
        }
        if (novoUsuario.getCargo() == null || novoUsuario.getCargo().isEmpty()) {
            novoUsuario.setCargo(novoUsuario.getPerfil().equals("GESTOR") ? "Gestor Comercial" : "Vendedor");
        }

        Usuario salvo = usuarioRepository.save(novoUsuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", salvo.getId(),
                "nome", salvo.getNome(),
                "email", salvo.getEmail(),
                "perfil", salvo.getPerfil(),
                "cargo", salvo.getCargo()
        ));
    }

    @PutMapping("/alterar-senha")
    public ResponseEntity<?> alterarSenha(@RequestBody Map<String, String> dados) {
        String email = dados.get("email");
        String senhaAtual = dados.get("senhaAtual");
        String novaSenha = dados.get("novaSenha");

        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("erro", "Usuário não encontrado."));
        }

        Usuario usuario = usuarioOpt.get();
        if (!usuario.getSenha().equals(senhaAtual)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", "A senha atual informada está incorreta."));
        }

        usuario.setSenha(novaSenha);
        usuarioRepository.save(usuario);

        return ResponseEntity.ok(Map.of("mensagem", "Senha alterada com sucesso!"));
    }
}