const http = require("http");

const PORTA = process.env.PORT || 3000;
const CIDADE_ENTREGA = "Palmeirópolis, TO";

// Ponto de partida das entregas (Centro de Palmeirópolis, TO)
const ORIGEM_LATITUDE = -13.0422679;
const ORIGEM_LONGITUDE = -48.4067856;

function calcularFrete(km) {
    if (km <= 2) return 0;
    if (km <= 5) return 3;
    if (km <= 8) return 5;
    if (km <= 12) return 8;
    if (km <= 15) return 12;
    return 15;
}

async function buscarCoordenadas(endereco) {
    const resposta = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
            `${endereco}, ${CIDADE_ENTREGA}`
        )}`,
        { headers: { "User-Agent": "DrinksCheckout/1.0" } }
    );
    const dados = await resposta.json();
    return Array.isArray(dados) && dados.length > 0 ? dados[0] : null;
}

async function buscarDistanciaKm(latitude, longitude) {
    const resposta = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${ORIGEM_LONGITUDE},${ORIGEM_LATITUDE};${longitude},${latitude}?overview=false`
    );
    const dados = await resposta.json();
    const rota = dados.routes && dados.routes[0];
    if (!rota) return null;
    return rota.distance / 1000;
}

async function tratarFrete(req, res) {
    const url = new URL(req.url, `http://localhost:${PORTA}`);
    const endereco = url.searchParams.get("endereco");

    if (!endereco || !endereco.trim()) {
        res.end("ERRO");
        return;
    }

    try {
        const localizacao = await buscarCoordenadas(endereco);
        if (!localizacao) {
            res.end("ERRO");
            return;
        }

        const distanciaKm = await buscarDistanciaKm(localizacao.lat, localizacao.lon);
        if (distanciaKm === null) {
            res.end("ERRO");
            return;
        }

        const frete = calcularFrete(distanciaKm);
        console.log(
            `Endereço: ${localizacao.display_name} | Distância: ${distanciaKm.toFixed(2)} km | Frete: R$ ${frete}`
        );

        res.end(`${frete}|${distanciaKm}`);
    } catch (erro) {
        console.error("Erro ao calcular frete:", erro);
        res.end("ERRO");
    }
}

const servidor = http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");

    if (req.url.startsWith("/frete")) {
        await tratarFrete(req, res);
        return;
    }

    res.statusCode = 404;
    res.end("Rota não encontrada. Use /frete?endereco=...");
});

servidor.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
