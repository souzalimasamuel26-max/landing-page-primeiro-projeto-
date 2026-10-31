// ⚠️ NÚMERO DO WHATSAPP DA LOJA — troque pelo número real antes de publicar.
// Formato: 55 + DDD + número, só dígitos (ex.: 5563999999999).
// É usado no botão do rodapé e para receber os pedidos do checkout.
const WHATSAPP_NUMERO = "5500000000000";

function linkWhatsApp(texto) {
    return "https://wa.me/" + WHATSAPP_NUMERO + "?text=" + encodeURIComponent(texto);
}

// Catálogo de produtos e carrinho, compartilhados entre a loja (index.html)
// e o checkout (checkout.html). O carrinho fica salvo no navegador
// (localStorage), então não se perde ao trocar de página ou recarregar.
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

const CHAVE_CARRINHO = "drinks-carrinho";
const CHAVE_COMPRA_DIRETA = "drinks-compra-direta";
const QUANTIDADE_MAXIMA = 99;

// "Comprar agora" abre o checkout em modo de compra direta (?modo=direta):
// só aquele item entra no pedido, guardado à parte (sessionStorage), e o
// carrinho salvo (localStorage) continua intacto.
function emCompraDireta() {
    return new URLSearchParams(window.location.search).get("modo") === "direta";
}

// Chamada pelo checkout: se veio de um link "Comprar agora"
// (?comprar=coca, ou o link antigo ?produto=coca), começa a compra direta.
function iniciarCompraDireta() {
    const params = new URLSearchParams(window.location.search);
    const chave = params.get("comprar") || params.get("produto");
    if (!chave || !PRODUTOS[chave]) return;
    const inicial = {};
    inicial[chave] = 1;
    memoriaDireta = inicial;
    try {
        sessionStorage.setItem(CHAVE_COMPRA_DIRETA, JSON.stringify(inicial));
    } catch (erro) {
        // sem sessionStorage: usamos só a memória da página
    }
    window.history.replaceState(null, "", window.location.pathname + "?modo=direta");
}

let memoriaDireta = {};
let memoriaCarrinho = {};

function limparCarrinhoBruto(bruto) {
    const limpo = {};
    Object.keys(PRODUTOS).forEach(function (chave) {
        const qtd = Math.floor(Number(bruto && bruto[chave]));
        if (qtd > 0) limpo[chave] = Math.min(qtd, QUANTIDADE_MAXIMA);
    });
    return limpo;
}

function lerCarrinho() {
    const direta = emCompraDireta();
    try {
        const armazenamento = direta ? sessionStorage : localStorage;
        const chave = direta ? CHAVE_COMPRA_DIRETA : CHAVE_CARRINHO;
        return limparCarrinhoBruto(JSON.parse(armazenamento.getItem(chave) || "{}"));
    } catch (erro) {
        return limparCarrinhoBruto(direta ? memoriaDireta : memoriaCarrinho);
    }
}

function salvarCarrinho(carrinho) {
    const direta = emCompraDireta();
    if (direta) memoriaDireta = carrinho;
    else memoriaCarrinho = carrinho;
    try {
        const armazenamento = direta ? sessionStorage : localStorage;
        const chave = direta ? CHAVE_COMPRA_DIRETA : CHAVE_CARRINHO;
        armazenamento.setItem(chave, JSON.stringify(carrinho));
    } catch (erro) {
        // Sem armazenamento (modo privado, etc.): vale só nesta página.
    }
    document.dispatchEvent(new CustomEvent("carrinho:mudou"));
}

function adicionarAoCarrinho(chave) {
    if (!PRODUTOS[chave]) return;
    const carrinho = lerCarrinho();
    carrinho[chave] = Math.min((carrinho[chave] || 0) + 1, QUANTIDADE_MAXIMA);
    salvarCarrinho(carrinho);
}

function totalDeItens(carrinho) {
    carrinho = carrinho || lerCarrinho();
    return Object.keys(carrinho).reduce(function (soma, chave) {
        return soma + carrinho[chave];
    }, 0);
}

function subtotalDoCarrinho(carrinho) {
    carrinho = carrinho || lerCarrinho();
    return Object.keys(carrinho).reduce(function (soma, chave) {
        return soma + PRODUTOS[chave].preco * carrinho[chave];
    }, 0);
}

function formatarMoeda(valor) {
    return "R$ " + valor.toFixed(2).replace(".", ",");
}
