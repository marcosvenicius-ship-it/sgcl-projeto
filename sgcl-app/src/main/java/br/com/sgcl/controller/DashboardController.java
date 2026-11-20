package br.com.sgcl.controller;

import br.com.sgcl.model.Prospect;
import br.com.sgcl.repository.ProspectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private ProspectRepository prospectRepository;

    @GetMapping("/metricas")
    public Map<String, Object> obterMetricas(
            @RequestParam(required = false) Long usuarioId,
            @RequestParam(required = false) String perfil) {

        List<Prospect> todos = prospectRepository.findAll();

        // Restrição de visualização: Vendedor vê apenas os próprios leads
        if ("VENDEDOR".equalsIgnoreCase(perfil) && usuarioId != null) {
            todos = todos.stream()
                    .filter(p -> p.getUsuario() != null && usuarioId.equals(p.getUsuario().getId()))
                    .collect(Collectors.toList());
        }

        long totalLeads = todos.size();
        long ganhos = todos.stream().filter(p -> "GANHO".equals(p.getStatusFinal())).count();
        long perdidos = todos.stream().filter(p -> "PERDIDO".equals(p.getStatusFinal())).count();

        double taxaConversaoGeral = totalLeads > 0 ? ((double) ganhos / totalLeads) * 100.0 : 0.0;

        BigDecimal receitaGanha = todos.stream()
                .filter(p -> "GANHO".equals(p.getStatusFinal()) && p.getValor() != null)
                .map(Prospect::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        double tempoMedioDias = todos.stream()
                .mapToLong(p -> {
                    LocalDateTime inicio = p.getDataCriacao() != null ? p.getDataCriacao() : LocalDateTime.now();
                    LocalDateTime fim = p.getDataFechamento() != null ? p.getDataFechamento() : LocalDateTime.now();
                    return Math.max(1, Duration.between(inicio, fim).toDays());
                })
                .average()
                .orElse(0.0);

        List<String> etapas = List.of("NOVO", "QUALIFICACAO", "PROPOSTA", "NEGOCIACAO", "FECHAMENTO");
        Map<String, Long> porEtapa = new LinkedHashMap<>();
        Map<String, Double> conversaoPorEtapa = new LinkedHashMap<>();

        for (String etapa : etapas) {
            long qtd = todos.stream().filter(p -> etapa.equals(p.getEtapaFunil())).count();
            porEtapa.put(etapa, qtd);
            double pct = totalLeads > 0 ? ((double) qtd / totalLeads) * 100.0 : 0.0;
            conversaoPorEtapa.put(etapa, Math.round(pct * 10.0) / 10.0);
        }

        Map<String, Map<String, Object>> porCanal = new LinkedHashMap<>();
        Map<String, List<Prospect>> agrupadoCanal = todos.stream()
                .collect(Collectors.groupingBy(p -> p.getOrigem() != null ? p.getOrigem() : "OUTRO"));

        for (Map.Entry<String, List<Prospect>> entry : agrupadoCanal.entrySet()) {
            String canal = entry.getKey();
            List<Prospect> listaCanal = entry.getValue();
            long totalCanal = listaCanal.size();
            long ganhosCanal = listaCanal.stream().filter(p -> "GANHO".equals(p.getStatusFinal())).count();
            double convCanal = totalCanal > 0 ? ((double) ganhosCanal / totalCanal) * 100.0 : 0.0;

            Map<String, Object> dadosCanal = new HashMap<>();
            dadosCanal.put("total", totalCanal);
            dadosCanal.put("ganhos", ganhosCanal);
            dadosCanal.put("taxaConversao", Math.round(convCanal * 10.0) / 10.0);
            porCanal.put(canal, dadosCanal);
        }

        Map<String, Object> resposta = new LinkedHashMap<>();
        resposta.put("totalLeads", totalLeads);
        resposta.put("totalGanhos", ganhos);
        resposta.put("totalPerdidos", perdidos);
        resposta.put("taxaConversaoGeral", Math.round(taxaConversaoGeral * 10.0) / 10.0);
        resposta.put("receitaGanha", receitaGanha);
        resposta.put("tempoMedioDias", Math.round(tempoMedioDias * 10.0) / 10.0);
        resposta.put("porEtapa", porEtapa);
        resposta.put("conversaoPorEtapa", conversaoPorEtapa);
        resposta.put("porCanal", porCanal);

        return resposta;
    }
}