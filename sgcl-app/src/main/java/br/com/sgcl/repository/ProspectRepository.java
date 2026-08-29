package br.com.sgcl.repository;

import br.com.sgcl.model.Prospect;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProspectRepository extends JpaRepository<Prospect, Long> {
    boolean existsByEmail(String email);
}