package br.com.sgcl.service;

import br.com.sgcl.model.Prospect;
import br.com.sgcl.repository.ProspectRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProspectService {

    private final ProspectRepository prospectRepository;

    public ProspectService(ProspectRepository prospectRepository) {
        this.prospectRepository = prospectRepository;
    }

    public Prospect cadastrarProspect(Prospect prospect) {
        if (prospectRepository.existsByEmail(prospect.getEmail())) {
            throw new IllegalArgumentException("Já existe um prospect cadastrado com este e-mail.");
        }
        prospect.setDataCadastro(LocalDateTime.now());
        return prospectRepository.save(prospect);
    }

    public List<Prospect> listarTodos() {
        return prospectRepository.findAll();
    }

    public Prospect atualizarProspect(Long id, Prospect prospectAtualizado) {
        Prospect prospectExistente = prospectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Lead não encontrado com o ID: " + id));

        if (!prospectExistente.getEmail().equalsIgnoreCase(prospectAtualizado.getEmail()) &&
                prospectRepository.existsByEmail(prospectAtualizado.getEmail())) {
            throw new IllegalArgumentException("O novo e-mail informado já está em uso por outro lead.");
        }

        prospectExistente.setNome(prospectAtualizado.getNome());
        prospectExistente.setEmail(prospectAtualizado.getEmail());
        prospectExistente.setTelefone(prospectAtualizado.getTelefone());
        prospectExistente.setEmpresa(prospectAtualizado.getEmpresa());
        prospectExistente.setCnpj(prospectAtualizado.getCnpj());
        prospectExistente.setOrigem(prospectAtualizado.getOrigem());
        prospectExistente.setEtapaFunil(prospectAtualizado.getEtapaFunil());

        return prospectRepository.save(prospectExistente);
    }

    public void deletarProspect(Long id) {
        if (!prospectRepository.existsById(id)) {
            throw new IllegalArgumentException("Lead não encontrado para exclusão.");
        }
        prospectRepository.deleteById(id);
    }
}