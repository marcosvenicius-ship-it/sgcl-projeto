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

    public Prospect cadastrarProspect(Prospect prospect) {
        if (prospectRepository.existsByEmail(prospect.getEmail())) {
            throw new IllegalArgumentException("Já existe um prospect cadastrado com este e-mail.");
        }
        return prospectRepository.save(prospect);
    }

    public List<Prospect> listarTodos() {
        return prospectRepository.findAll();
    }
}