// Endereço do servidor que calcula o frete (server/server.js).
// Se você publicar o site em outro lugar, rode o servidor nesse mesmo
// endereço ou troque a URL abaixo pela do servidor publicado.
const FRETE_API_BASE = "http://localhost:3000";

// O catálogo (PRODUTOS) e o carrinho vêm do carrinho.js.

// Veio do "Comprar agora"? Então é compra direta: só aquele item, sem mexer no carrinho salvo.
iniciarCompraDireta();
if (emCompraDireta()) {
    document.getElementById("aviso-compra-direta").hidden = false;
    document.getElementById("titulo-itens").textContent = "Sua compra";
}

let enderecoValido = false;
let freteIndisponivel = false; // servidor de frete fora do ar: o frete fica "a combinar"
let distanciaKmAtual = null;
let freteAtual = 0;

const listaItens = document.getElementById("itens-carrinho");
const carrinhoVazio = document.getElementById("carrinho-vazio");

function criarElemento(tag, classe, texto) {
    const el = document.createElement(tag);
    if (classe) el.className = classe;
    if (texto !== undefined) el.textContent = texto;
    return el;
}

function criarBotaoQtd(chave, acao, rotulo, simbolo) {
    const botao = criarElemento("button", "", simbolo);
    botao.type = "button";
    botao.dataset.produto = chave;
    botao.dataset.acao = acao;
    botao.setAttribute("aria-label", rotulo + " " + PRODUTOS[chave].nome);
    return botao;
}

function renderizarCarrinho() {
    const carrinho = lerCarrinho();
    const chaves = Object.keys(carrinho);

    listaItens.textContent = "";

    chaves.forEach(function (chave) {
        const produto = PRODUTOS[chave];
        const qtd = carrinho[chave];

        const item = criarElemento("div", "item-carrinho");

        const img = criarElemento("img", "item-img");
        img.src = produto.imagem;
        img.alt = produto.nome;

        const info = criarElemento("div", "item-info");
        info.appendChild(criarElemento("h3", "", produto.nome));
        info.appendChild(criarElemento("p", "item-desc", produto.descricao));
        info.appendChild(criarElemento("span", "item-preco", formatarMoeda(produto.preco) + " cada"));

        const controles = criarElemento("div", "quantidade");
        controles.appendChild(criarBotaoQtd(chave, "diminuir", "Diminuir quantidade de", "−"));
        const qtdEl = criarElemento("span", "", String(qtd));
        qtdEl.setAttribute("aria-live", "polite");
        controles.appendChild(qtdEl);
        controles.appendChild(criarBotaoQtd(chave, "aumentar", "Aumentar quantidade de", "+"));

        const lado = criarElemento("div", "item-lado");
        lado.appendChild(criarElemento("strong", "item-subtotal", formatarMoeda(produto.preco * qtd)));
        const remover = criarElemento("button", "item-remover", "Remover");
        remover.type = "button";
        remover.dataset.produto = chave;
        remover.dataset.acao = "remover";
        remover.setAttribute("aria-label", "Remover " + produto.nome + " do carrinho");
        lado.appendChild(remover);

        const meio = criarElemento("div", "item-meio");
        meio.appendChild(info);
        meio.appendChild(controles);

        item.appendChild(img);
        item.appendChild(meio);
        item.appendChild(lado);
        listaItens.appendChild(item);
    });

    const vazio = chaves.length === 0;
    carrinhoVazio.hidden = !vazio;
    atualizarPreco();
}

listaItens.addEventListener("click", function (evento) {
    const botao = evento.target.closest("button[data-acao]");
    if (!botao) return;

    const chave = botao.dataset.produto;
    const carrinho = lerCarrinho();
    const atual = carrinho[chave] || 0;

    if (botao.dataset.acao === "aumentar") {
        carrinho[chave] = Math.min(atual + 1, QUANTIDADE_MAXIMA);
    } else if (botao.dataset.acao === "diminuir") {
        if (atual > 1) carrinho[chave] = atual - 1;
        else delete carrinho[chave]; // 1 -> 0 remove o item
    } else if (botao.dataset.acao === "remover") {
        delete carrinho[chave];
    }

    salvarCarrinho(carrinho);
    renderizarCarrinho();
});

function atualizarPreco() {
    const carrinho = lerCarrinho();
    const subtotal = subtotalDoCarrinho(carrinho);
    const temItens = totalDeItens(carrinho) > 0;

    document.getElementById("resumo-itens").textContent = totalDeItens(carrinho);
    document.getElementById("subtotal").textContent = formatarMoeda(subtotal);
    document.getElementById("total").textContent = formatarMoeda(subtotal + (temItens ? freteAtual : 0));

    const botaoFinalizar = document.getElementById("finalizar-compra");
    if (botaoFinalizar && !botaoFinalizar.dataset.processando) {
        botaoFinalizar.disabled = !temItens;
    }
}

const finalizarCompra = document.getElementById("finalizar-compra");
const mensagemSucesso = document.getElementById("mensagem-sucesso");
const overlay = document.getElementById("overlay");

const nome = document.getElementById("nome");
const email = document.getElementById("email");
const endereco = document.getElementById("endereco");

async function atualizarFrete() {
    const distanciaEntrega = document.getElementById("distancia-entrega");
    const enderecoAtual = endereco.value.trim();
    freteIndisponivel = false;

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
            "⚠️ Não conseguimos calcular o frete agora. Você pode continuar: o frete será combinado pelo WhatsApp.";
        enderecoValido = false;
        freteIndisponivel = true;
        freteAtual = 0;
        distanciaKmAtual = null;
        document.getElementById("frete").textContent = "a combinar";
        atualizarPreco();
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
    distanciaKmAtual = distanciaKm;

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
const cartaoEntrega = document.getElementById("cartao-entrega");
const dinheiro = document.getElementById("dinheiro");
const troco = document.getElementById("troco");

const areas = {
    pix: document.getElementById("area-pix"),
    cartao: document.getElementById("area-cartao-entrega"),
    dinheiro: document.getElementById("area-dinheiro"),
};

[pix, cartaoEntrega, dinheiro].forEach(function (radio) {
    radio.addEventListener("change", function () {
        Object.keys(areas).forEach(function (chave) {
            areas[chave].hidden = chave !== radio.value;
        });
        limparErro("pagamento");
    });
});

renderizarCarrinho();

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

    if (totalDeItens() === 0) {
        carrinhoVazio.hidden = false;
        carrinhoVazio.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
    }

    ["nome", "email", "endereco", "pagamento", "troco"].forEach(limparErro);
    ["nome", "email", "endereco", "troco"].forEach((id) => marcarInvalido(id, false));

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
        if (!enderecoValido && !freteIndisponivel) {
            mostrarErro("endereco", "Informe um endereço válido em Palmeirópolis, TO.");
            marcarInvalido("endereco", true);
            valido = false;
        }
    }

    const formaPagamento = pix.checked ? "pix" : cartaoEntrega.checked ? "cartao" : dinheiro.checked ? "dinheiro" : "";
    let valorTroco = null;

    if (!formaPagamento) {
        mostrarErro("pagamento", "Escolha uma forma de pagamento.");
        valido = false;
    } else if (formaPagamento === "dinheiro" && troco.value.trim() !== "") {
        valorTroco = lerValorEmReais(troco.value);
        const totalPedido = subtotalDoCarrinho() + (enderecoValido ? freteAtual : 0);
        if (valorTroco === null) {
            mostrarErro("troco", "Digite um valor válido, ex.: 50,00.");
            marcarInvalido("troco", true);
            valido = false;
        } else if (valorTroco < totalPedido) {
            mostrarErro("troco", "O valor do troco precisa ser maior que o total (" + formatarMoeda(totalPedido) + ").");
            marcarInvalido("troco", true);
            valido = false;
        }
    }

    if (!valido) {
        const primeiroErro = document.querySelector(".erro:not(:empty)");
        if (primeiroErro) primeiroErro.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
    }

    abrirConfirmacao({
        nome: valorNome,
        email: valorEmail,
        endereco: valorEndereco,
        formaPagamento: formaPagamento,
        troco: valorTroco,
    });
});

// ---------- Pedido por WhatsApp ----------

// "1.250,50" / "50" / "R$ 50,00" -> número (ou null se inválido)
function lerValorEmReais(texto) {
    const limpo = texto.replace(/[^\d,.]/g, "").replace(/\./g, "").replace(",", ".");
    const n = Number(limpo);
    return limpo !== "" && Number.isFinite(n) && n > 0 ? n : null;
}

// Tira caracteres que o WhatsApp interpretaria como formatação e limita o tamanho.
function textoSeguro(texto, limite) {
    return String(texto).replace(/[*_~`]/g, "").replace(/\s+/g, " ").trim().slice(0, limite);
}

function gerarCodigoPedido() {
    return "DRK-" + Date.now().toString(36).slice(-5).toUpperCase();
}

function descricaoPagamento(dados) {
    if (dados.formaPagamento === "pix") return "PIX (enviar a chave por aqui)";
    if (dados.formaPagamento === "cartao") return "Cartão na entrega (maquininha)";
    return dados.troco
        ? "Dinheiro, troco para " + formatarMoeda(dados.troco)
        : "Dinheiro, não precisa de troco";
}

function montarMensagemPedido(dados, codigo) {
    const carrinho = lerCarrinho();
    const subtotal = subtotalDoCarrinho(carrinho);
    const freteCalculado = enderecoValido && !freteIndisponivel;
    const linhas = [];

    linhas.push("🥤 *NOVO PEDIDO — DRINKS*");
    linhas.push("Pedido " + codigo);
    linhas.push("");
    linhas.push("*Cliente:* " + textoSeguro(dados.nome, 80));
    linhas.push("*E-mail:* " + textoSeguro(dados.email, 80));
    linhas.push("*Endereço:* " + textoSeguro(dados.endereco, 160) + ", Palmeirópolis - TO");
    if (freteCalculado && distanciaKmAtual !== null) {
        linhas.push("*Distância:* " + distanciaKmAtual.toFixed(1).replace(".", ",") + " km");
    }
    linhas.push("");
    linhas.push("*Itens:*");
    Object.keys(carrinho).forEach(function (chave) {
        const p = PRODUTOS[chave];
        linhas.push("• " + carrinho[chave] + "x " + p.nome + " — " + formatarMoeda(p.preco * carrinho[chave]));
    });
    linhas.push("");
    linhas.push("Subtotal: " + formatarMoeda(subtotal));
    linhas.push("Frete: " + (freteCalculado ? (freteAtual === 0 ? "grátis" : formatarMoeda(freteAtual)) : "a combinar"));
    linhas.push("*Total: " + formatarMoeda(subtotal + (freteCalculado ? freteAtual : 0)) + (freteCalculado ? "" : " + frete") + "*");
    linhas.push("");
    linhas.push("*Pagamento:* " + descricaoPagamento(dados));

    return linhas.join("\n");
}

const botaoWhatsapp = document.getElementById("botao-whatsapp");
const botaoCopiar = document.getElementById("copiar-pedido");
const botaoFechar = document.getElementById("fechar-modal");
const codigoPedidoEl = document.getElementById("codigo-pedido");
const avisoWhatsapp = document.getElementById("aviso-whatsapp");
let mensagemAtual = "";

function fecharConfirmacao() {
    mensagemSucesso.style.display = "none";
    overlay.style.display = "none";
}

function abrirConfirmacao(dados) {
    const codigo = gerarCodigoPedido();
    mensagemAtual = montarMensagemPedido(dados, codigo);

    codigoPedidoEl.textContent = codigo;
    botaoWhatsapp.href = linkWhatsApp(mensagemAtual);
    botaoWhatsapp.textContent = "Enviar pedido pelo WhatsApp";
    botaoCopiar.textContent = "Copiar texto do pedido";
    avisoWhatsapp.hidden = WHATSAPP_NUMERO !== "5500000000000";

    mensagemSucesso.style.display = "block";
    overlay.style.display = "block";
    botaoWhatsapp.focus();
}

// Ao enviar pelo WhatsApp, o pedido está feito: esvazia o carrinho (ou a compra direta).
botaoWhatsapp.addEventListener("click", function () {
    setTimeout(function () {
        salvarCarrinho({});
        botaoWhatsapp.textContent = "Pedido enviado ✓ (confirme no WhatsApp)";
    }, 300);
});

botaoCopiar.addEventListener("click", function () {
    function marcarCopiado() {
        botaoCopiar.textContent = "Copiado ✓";
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(mensagemAtual).then(marcarCopiado, function () {
            window.prompt("Copie o texto do pedido:", mensagemAtual);
        });
    } else {
        window.prompt("Copie o texto do pedido:", mensagemAtual);
    }
});

botaoFechar.addEventListener("click", fecharConfirmacao);
overlay.addEventListener("click", fecharConfirmacao);
document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape") fecharConfirmacao();
});
