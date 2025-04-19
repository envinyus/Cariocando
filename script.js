<script>
    // Array para armazenar seleções
    const selecoes = [];

    // 1. Controle dos checkboxes
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('checkbox')) {
            const card = e.target.closest('.card');
            const nome = card.querySelector('.card-titulo').textContent;
            
            if (e.target.checked) {
                selecoes.push(nome);
            } else {
                const index = selecoes.indexOf(nome);
                if (index !== -1) selecoes.splice(index, 1);
            }
        }
    });

// 2. Controle da seta e expansão
document.addEventListener('click', function(e) {
    // Se clicou na seta
    if (e.target.classList.contains('card-seta')) {
        const card = e.target.closest('.card');
        card.classList.toggle('ativo');
        e.target.style.transform = card.classList.contains('ativo') ? 'rotate(180deg)' : 'rotate(0)';
    }
    
    // Se clicou no cabeçalho (mas não no checkbox)
    if (e.target.classList.contains('card-header') && 
        !e.target.closest('label') && 
        !e.target.closest('.checkbox')) {
        const card = e.target.closest('.card');
        const seta = card.querySelector('.card-seta');
        card.classList.toggle('ativo');
        seta.style.transform = card.classList.contains('ativo') ? 'rotate(180deg)' : 'rotate(0)';
    }
});

function proximaSecao() {
    const secaoAtual = document.querySelector('.secao.active');
    const proximaSecao = document.querySelector(`[data-secao="${parseInt(secaoAtual.dataset.secao) + 1}"]`);
    
    if (proximaSecao) {
        secaoAtual.classList.remove('active');
        proximaSecao.classList.add('active');
        
        // Desativa a seta direita se for a última seção
        const btnDireita = document.querySelector('.secao-navegacao button:last-child');
        btnDireita.disabled = proximaSecao.id === 'final';
    }
}
    function voltarSecao() {
        const secaoAtual = document.querySelector('.secao.active');
        const secaoAnterior = document.querySelector(`[data-secao="${parseInt(secaoAtual.dataset.secao) - 1}"]`);
        
        if (secaoAnterior) {
            secaoAtual.classList.remove('active');
            secaoAnterior.classList.add('active');
        }
    }

    // 4. Atualiza lista final
    function atualizarListaFinal() {
        const lista = document.getElementById('lista-final');
        lista.innerHTML = selecoes.map(item => `<li>${item}</li>`).join('');
    }

    // 5. Botão do Maps (CORRIGIDO)
    async function criarRoteiroMaps() {
        if (selecoes.length < 2) {
            alert("Selecione pelo menos 2 locais!");
            return;
        }
    
        // 1. Obter coordenadas dos locais (usando Geocoding API)
        const locaisComCoordenadas = await Promise.all(
            selecoes.map(async nome => {
                const resposta = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(nome)}&key=AIzaSyCTNMJ4K7MZewZ8uFRTxnwDsHzxFjIFXhI`);
                const dados = await resposta.json();
                return {
                    nome,
                    location: dados.results[0].geometry.location // { lat, lng }
                };
            })
        );
    
        // 2. Calcular distâncias entre todos os pares (Distance Matrix API)
        const origens = locaisComCoordenadas.map(l => `${l.location.lat},${l.location.lng}`).join('|');
        const resposta = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origens}&destinations=${origens}&key=SUA_CHAVE_API`);
        const dados = await resposta.json();
    
        // 3. Ordenar por proximidade (algoritmo simplificado)
        const roteiroOrdenado = [locaisComCoordenadas[0].nome]; // Começa com o primeiro item
        let atual = 0;
    
        while (roteiroOrdenado.length < locaisComCoordenadas.length) {
            let maisProximo = null;
            let menorDistancia = Infinity;
    
            for (let i = 0; i < dados.rows[atual].elements.length; i++) {
                if (i !== atual && !roteiroOrdenado.includes(locaisComCoordenadas[i].nome)) {
                    const distancia = dados.rows[atual].elements[i].distance.value;
                    if (distancia < menorDistancia) {
                        menorDistancia = distancia;
                        maisProximo = i;
                    }
                }
            }
    
            if (maisProximo !== null) {
                roteiroOrdenado.push(locaisComCoordenadas[maisProximo].nome);
                atual = maisProximo;
            }
        }
    
        // 4. Abrir Maps com a rota ordenada
        const waypoints = roteiroOrdenado.map(encodeURIComponent).join('/');
        window.open(`https://www.google.com/maps/dir/${waypoints}`, '_blank');