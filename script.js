// Array para armazenar seleções
const selecoes = [];

// Controle dos checkboxes
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

// Controle da seta e expansão
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('card-seta') || 
        e.target.closest('.card-header')) {
        const card = e.target.closest('.card');
        card.classList.toggle('ativo');
        const seta = card.querySelector('.card-seta');
        seta.style.transform = card.classList.contains('ativo') ? 'rotate(180deg)' : 'rotate(0)';
    }
});

// Função de delay para evitar bloqueio
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Função principal (SEMPRE SEM API KEY)
async function criarRoteiroMaps() {
    if (selecoes.length < 2) {
        alert("Selecione pelo menos 2 locais!");
        return;
    }

    // 1. Obter coordenadas via OpenStreetMap (gratuito)
    const locaisComCoordenadas = [];
    for (const nome of selecoes) {
        try {
            const resposta = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(nome)}+Rio+de+Janeiro&limit=1`);
            const dados = await resposta.json();
            
            if (dados.length > 0) {
                locaisComCoordenadas.push({
                    nome,
                    location: {
                        lat: parseFloat(dados[0].lat),
                        lng: parseFloat(dados[0].lon)
                    }
                });
            }
            await delay(1000); // Respeita o limite de requisições
        } catch (erro) {
            console.error("Erro ao buscar:", nome, erro);
        }
    }

    // 2. Gerar rota no Maps
    if (locaisComCoordenadas.length >= 2) {
        const waypoints = locaisComCoordenadas.map(l => `${l.location.lat},${l.location.lng}`).join('/');
        window.open(`https://www.google.com/maps/dir/${waypoints}`, '_blank');
    } else {
        alert("Não foi possível traçar a rota. Adicione 'Rio de Janeiro' aos nomes dos locais para melhor precisão.");
    }
}

// Navegação entre seções
function proximaSecao() {
    const secaoAtual = document.querySelector('.secao.active');
    const proximaSecao = document.querySelector(`[data-secao="${parseInt(secaoAtual.dataset.secao) + 1}"]`);
    
    if (proximaSecao) {
        secaoAtual.classList.remove('active');
        proximaSecao.classList.add('active');
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

// Mostrar seção inicial
function mostrarSecao(containerId, secaoId) {
    document.getElementById(containerId).classList.add('active');
    document.getElementById(secaoId).classList.add('active');
}
