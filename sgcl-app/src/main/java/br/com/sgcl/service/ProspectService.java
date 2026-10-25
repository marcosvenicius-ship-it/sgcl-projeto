package br.com.sgcl.service;

import br.com.sgcl.model.Prospect;
import br.com.sgcl.repository.ProspectRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProspectService {

    private final ProspectRepository prospectRepository;

    public ProspectService(ProspectRepository prospectRepository) {
        this.prospectRepository = prospectRepository;
    }

    public List<Prospect> listarTodos() {
        return prospectRepository.findAll();
    }

    public Prospect cadastrarProspect(Prospect prospect) {
        if (prospectRepository.existsByEmail(prospect.getEmail())) {
            throw new IllegalArgumentException("E-mail já cadastrado na base.");
        }
        return prospectRepository.save(prospect);
    }

    public Prospect atualizarProspect(Long id, Prospect prospect) {
        Prospect existente = prospectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Prospect não encontrado com o ID: " + id));

        if (!existente.getEmail().equals(prospect.getEmail()) && prospectRepository.existsByEmail(prospect.getEmail())) {
            throw new IllegalArgumentException("E-mail já pertence a outro prospect.");
        }

        existente.setNome(prospect.getNome());
        existente.setEmail(prospect.getEmail());
        existente.setTelefone(prospect.getTelefone());
        existente.setEmpresa(prospect.getEmpresa());
        existente.setCnpj(prospect.getCnpj());
        existente.setOrigem(prospect.getOrigem());
        existente.setEtapaFunil(prospect.getEtapaFunil());

        // Atualizações vitais da AC3:
        existente.setUsuario(prospect.getUsuario());
        existente.setStatusFinal(prospect.getStatusFinal());
        existente.setMotivoPerda(prospect.getMotivoPerda());

        return prospectRepository.save(existente);
    }

    public void deletarProspect(Long id) {
        if (!prospectRepository.existsById(id)) {
            throw new IllegalArgumentException("Prospect não encontrado para exclusão.");
        }
        prospectRepository.deleteById(id);
    }
}