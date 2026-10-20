// Endereço do servidor que calcula o frete (server/server.js).
// Se você publicar o site em outro lugar, rode o servidor nesse mesmo
// endereço ou troque a URL abaixo pela do servidor publicado.
const FRETE_API_BASE = "http://localhost:3000";

// Catálogo de produtos: nome, descrição, imagem e preço em um só lugar,
// para não precisar repetir/sincronizar valores manualmente com o index.html.
const PRODUTOS = {
    coca: {
        nome: "Coca-Cola",
        descricao: "Refrigerante sabor cola",
        imagem: "./assets/cocacola.png",
        preco: 10,
    },
    pepsi: {
        nome: "Pepsi",
        descricao: "Refrigerante sabor cola",
        imagem: "./assets/pepsi.png",
        preco: 9,
    },
    fanta: {
        nome: "Fanta Laranja",
        descricao: "Refrigerante sabor laranja",
        imagem: "./assets/fanta.png",
        preco: 8,
    },
};

const parametros = new URLSearchParams(window.location.search);
const chaveProduto = PRODUTOS[parametros.get("produto")] ? parametros.get("produto") : "fanta";
const produtoAtual = PRODUTOS[chaveProduto];

const nomeProduto = document.getElementById("nome-produto");
const descricao = document.getElementById("descricao");
const imagemProduto = document.getElementById("imagem-produto");
const resumoProduto = document.getElementById("resumo-produto");

nomeProduto.textContent = produtoAtual.nome;
descricao.textContent = produtoAtual.descricao;
imagemProduto.src = produtoAtual.imagem;
imagemProduto.alt = produtoAtual.nome;
resumoProduto.textContent = produtoAtual.nome;

const precoUnitario = produtoAtual.preco;
let enderecoValido = false;
let freteAtual = 0;

const diminuir = document.getElementById("diminuir");
const aumentar = document.getElementById("aumentar");
const quantidade = document.getElementById("quantidade");

function formatarMoeda(valor) {
    return `R$ ${valor.toFixed(2).replace(".", ",")}`;
}

function atualizarPreco() {
    const quantidadeAtual = Number(quantidade.textContent);
    const subtotal = precoUnitario * quantidadeAtual;

    document.getElementById("preco-produto").textContent = formatarMoeda(subtotal);
    document.getElementById("subtotal").textContent = formatarMoeda(subtotal);
    document.getElementById("total").textContent = formatarMoeda(subtotal + freteAtual);
}

aumentar.addEventListener("click", function () {
    quantidade.textContent = Number(quantidade.textContent) + 1;
    atualizarPreco();
});

diminuir.addEventListener("click", function () {
    if (Number(quantidade.textContent) > 1) {
        quantidade.textContent = Number(quantidade.textContent) - 1;
        atualizarPreco();
    }
});

const finalizarCompra = document.getElementById("finalizar-compra");
const mensagemSucesso = document.getElementById("mensagem-sucesso");
const overlay = document.getElementById("overlay");

const nome = document.getElementById("nome");
const email = document.getElementById("email");
const endereco = document.getElementById("endereco");

async function atualizarFrete() {
    const distanciaEntrega = document.getElementById("distancia-entrega");
    const enderecoAtual = endereco.value.trim();

    if (!enderecoAtual) {
        distanciaEntrega.textContent = "";
        return;
    }

    distanciaEntrega.textContent = "🔄 Calculando distância...";

    let dados;
    try {
        const resposta = await fetch(
            `${FRETE_API_BASE}/frete?endereco=${encodeURIComponent(enderecoAtual)}`
        );
        dados = await resposta.text();
    } catch (erro) {
        console.error("Erro ao calcular frete:", erro);
        distanciaEntrega.textContent =
            "⚠️ Não foi possível calcular o frete agora (verifique se o servidor está rodando). Tente novamente.";
        enderecoValido = false;
        return;
    }

    if (dados === "ERRO") {
        distanciaEntrega.textContent = "❌ Endereço não encontrado. Verifique e tente novamente.";
        enderecoValido = false;
        return;
    }

    const [freteTexto, distanciaTexto] = dados.split("|");
    const frete = Number(freteTexto);
    const distanciaKm = Number(distanciaTexto);

    if (Number.isNaN(frete) || Number.isNaN(distanciaKm)) {
        distanciaEntrega.textContent = "❌ Não foi possível calcular o frete para esse endereço.";
        enderecoValido = false;
        return;
    }

    enderecoValido = true;
    freteAtual = frete;

    distanciaEntrega.textContent = `Distância da entrega: ${distanciaKm.toFixed(2).replace(".", ",")} km`;
    document.getElementById("frete").textContent = formatarMoeda(frete);
    atualizarPreco();
}

endereco.addEventListener("change", function () {
    enderecoValido = false;
    limparErro("endereco");
    atualizarFrete();
});

const pix = document.getElementById("pix");
const cartao = document.getElementById("cartao");

const numeroCartao = document.getElementById("numero-cartao");
const nomeCartao = document.getElementById("nome-cartao");
const validadeCartao = document.getElementById("validade-cartao");
const cvvCartao = document.getElementById("cvv-cartao");

const areaPix = document.getElementById("area-pix");
const areaCartao = document.getElementById("area-cartao");

pix.addEventListener("change", function () {
    areaPix.hidden = false;
    areaCartao.hidden = true;
    limparErro("pagamento");
});

cartao.addEventListener("change", function () {
    areaCartao.hidden = false;
    areaPix.hidden = true;
    limparErro("pagamento");
});

// Máscaras simples para os campos de cartão
numeroCartao.addEventListener("input", function () {
    const digitos = numeroCartao.value.replace(/\D/g, "").slice(0, 16);
    numeroCartao.value = digitos.replace(/(.{4})/g, "$1 ").trim();
});

validadeCartao.addEventListener("input", function () {
    let digitos = validadeCartao.value.replace(/\D/g, "").slice(0, 4);
    if (digitos.length > 2) {
        digitos = `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
    }
    validadeCartao.value = digitos;
});

cvvCartao.addEventListener("input", function () {
    cvvCartao.value = cvvCartao.value.replace(/\D/g, "").slice(0, 3);
});

atualizarPreco();

// --- Validação ---

function mostrarErro(campo, mensagem) {
    const span = document.getElementById(`erro-${campo}`);
    if (span) span.textContent = mensagem;
}

function limparErro(campo) {
    const span = document.getElementById(`erro-${campo}`);
    if (span) span.textContent = "";
}

function marcarInvalido(id, invalido) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle("invalido", invalido);
}

document.getElementById("form-checkout").addEventListener("submit", async function (evento) {
    evento.preventDefault();

    ["nome", "email", "endereco", "pagamento", "numero-cartao", "nome-cartao", "validade-cartao", "cvv-cartao"].forEach(
        limparErro
    );
    ["nome", "email", "endereco", "numero-cartao", "nome-cartao", "validade-cartao", "cvv-cartao"].forEach((id) =>
        marcarInvalido(id, false)
    );

    const valorNome = nome.value.trim();
    const valorEmail = email.value.trim();
    const valorEndereco = endereco.value.trim();

    let valido = true;

    if (valorNome === "") {
        mostrarErro("nome", "Digite seu nome completo.");
        marcarInvalido("nome", true);
        valido = false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valorEmail)) {
        mostrarErro("email", "Digite um e-mail válido.");
        marcarInvalido("email", true);
        valido = false;
    }

    if (valorEndereco === "") {
        mostrarErro("endereco", "Digite seu endereço.");
        marcarInvalido("endereco", true);
        valido = false;
    } else if (!enderecoValido) {
        // Garante que o frete foi calculado para o endereço atual antes de finalizar.
        await atualizarFrete();
        if (!enderecoValido) {
            mostrarErro("endereco", "Informe um endereço válido em Palmeirópolis, TO.");
            marcarInvalido("endereco", true);
            valido = false;
        }
    }

    if (!pix.checked && !cartao.checked) {
        mostrarErro("pagamento", "Escolha uma forma de pagamento.");
        valido = false;
    } else if (cartao.checked) {
        const numeroLimpo = numeroCartao.value.replace(/\s/g, "");

        if (!/^\d{16}$/.test(numeroLimpo)) {
            mostrarErro("numero-cartao", "O número do cartão deve ter 16 dígitos.");
            marcarInvalido("numero-cartao", true);
            valido = false;
        }
        if (nomeCartao.value.trim().length < 3) {
            mostrarErro("nome-cartao", "Digite o nome impresso no cartão.");
            marcarInvalido("nome-cartao", true);
            valido = false;
        }
        if (!/^\d{2}\/\d{2}$/.test(validadeCartao.value)) {
            mostrarErro("validade-cartao", "Use o formato MM/AA.");
            marcarInvalido("validade-cartao", true);
            valido = false;
        }
        if (!/^\d{3}$/.test(cvvCartao.value)) {
            mostrarErro("cvv-cartao", "O CVV deve ter 3 dígitos.");
            marcarInvalido("cvv-cartao", true);
            valido = false;
        }
    }

    if (!valido) {
        const primeiroErro = document.querySelector(".erro:not(:empty)");
        if (primeiroErro) primeiroErro.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
    }

    finalizarCompra.disabled = true;
    finalizarCompra.textContent = "Processando...";

    // Simula o processamento do pedido antes de mostrar a confirmação.
    setTimeout(function () {
        mensagemSucesso.style.display = "block";
        overlay.style.display = "block";
        finalizarCompra.disabled = false;
        finalizarCompra.textContent = "Finalizar compra";
    }, 600);
});
