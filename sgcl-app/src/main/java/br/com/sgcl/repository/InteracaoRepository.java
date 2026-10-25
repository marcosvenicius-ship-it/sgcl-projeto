package br.com.sgcl.repository;

import br.com.sgcl.model.Interacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InteracaoRepository extends JpaRepository<Interacao, Long> {
    List<Interacao> findByProspectIdOrderByDataRegistroDesc(Long prospectId);
}