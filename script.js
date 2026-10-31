// Menu mobile
const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');

if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', function () {
        const aberto = navMenu.classList.toggle('aberto');
        menuToggle.setAttribute('aria-expanded', aberto ? 'true' : 'false');
        menuToggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    });

    navMenu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            navMenu.classList.remove('aberto');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.setAttribute('aria-label', 'Abrir menu');
        });
    });
}

// Ano do rodapé
const anoEl = document.getElementById('ano');
if (anoEl) {
    anoEl.textContent = new Date().getFullYear();
}

// Animações de scroll (GSAP) — só rodam se a biblioteca carregou
// e se a pessoa não pediu para reduzir animações no sistema.
const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !reduzirMovimento) {
    gsap.registerPlugin(ScrollTrigger);

    var tl = gsap.timeline({
        scrollTrigger: {
            trigger: '.two',
            start: '0% 95%',
            end: 'bottom 75%',
            scrub: true,
            invalidateOnRefresh: true,
        },
    });

    // Até 900px a seção "two" vira uma coluna (blob em cima, texto embaixo).
    // Lá a Fanta não pode usar as porcentagens fixas do desktop: ela cobriria
    // o título. Então pousamos ela em cima do blob, medindo a posição real.
    const ehTelaPequena = () => window.innerWidth <= 900;
    const blobSvg = document.querySelector('.left-side svg');

    function larguraFantaMobile() {
        return Math.min(window.innerWidth * 0.8, 320); // igual ao CSS (#fanta no @media)
    }

    function alvoFantaDoisTopo() {
        if (!ehTelaPequena() || !blobSvg) return '150%';
        const r = blobSvg.getBoundingClientRect();
        const alturaLata = larguraFantaMobile() * 0.75 * 0.985;
        const centroBlobY = r.top + window.scrollY + r.height / 2;
        // a lata fica 60% acima e 40% abaixo do centro do blob: "encosta" nele
        const topoPx = centroBlobY - alturaLata * 0.6;
        return `${(topoPx / window.innerHeight) * 100}%`;
    }

    function alvoFantaDoisEsquerda() {
        if (!ehTelaPequena() || !blobSvg) return '0%';
        const r = blobSvg.getBoundingClientRect();
        const centroBlobX = r.left + window.scrollX + r.width / 2;
        const leftPx = centroBlobX - larguraFantaMobile() / 2;
        return `${(leftPx / window.innerWidth) * 100}%`;
    }

    // ease "power2.out": começa rápido (chega perto do SVG logo) e vai
    // desacelerando até parar suavemente no lugar certo.
    tl.to('#fanta', { top: alvoFantaDoisTopo, left: alvoFantaDoisEsquerda, ease: 'power2.out' }, 'orange');
    tl.to('#laranja-cortada', { top: '190%', left: '23%', ease: 'power2.out' }, 'orange');
    tl.to('#laranja', { width: '15%', top: '190%', right: '10%', ease: 'power2.out' }, 'orange');

    // #folha e #folha2 ficam paradas (decorativas) — menos elementos
    // se movendo ao mesmo tempo durante o scroll = animação mais leve.

    var tl2 = gsap.timeline({
        scrollTrigger: {
            trigger: '.three',
            start: 'top 75%',
            end: 'top -8%',
            scrub: true,
            invalidateOnRefresh: true,
        },
    });

    // Duração um pouco menor que a padrão (0.5) faz a Coca/Pepsi (e os
    // limões junto delas) chegarem um pouco antes no lugar certo.
    tl2.fromTo(
        '.lemon1',
        { rotate: '-90deg', left: '-100%', top: '110%' },
        { rotate: '0', top: '-3%', left: '50%', duration: 0.35 },
        'ca'
    );

    tl2.fromTo(
        '#cocacola',
        { rotate: '-90deg', top: '110%', left: '-100%' },
        { rotate: '0', top: '15.2%', left: '50%', duration: 0.35 },
        'ca'
    );

    tl2.fromTo(
        '.lemon2',
        { rotate: '90deg', top: '110%', left: '100%' },
        { rotate: '0', top: '-3%', left: '50%', duration: 0.35 },
        'ca'
    );

    tl2.fromTo(
        '#pepsi',
        { rotate: '90deg', top: '110%', left: '100%' },
        { rotate: '0', top: '15.5%', left: '50%', duration: 0.35 },
        'ca'
    );

    // A Fanta (e a fatia de laranja) não vivem dentro do .card da Fanta —
    // é o mesmo elemento que atravessa a página inteira desde o Hero.
    // Por isso, em vez de porcentagens fixas "no chute", medimos a
    // posição real da caixinha da Fanta na tela e calculamos o pouso
    // com a MESMA proporção (largura/altura) usada pela Coca e a Pepsi,
    // pra ficar de fato alinhada e do mesmo tamanho.
    const cardFanta = document.getElementById('card-fanta');

    function retanguloCardFanta() {
        const rect = cardFanta.getBoundingClientRect();
        return {
            topPagina: rect.top + window.scrollY,
            leftPagina: rect.left + window.scrollX,
            largura: rect.width,
            altura: rect.height,
        };
    }

    // A lata da Fanta na imagem original tem proporção 700x525 (largura ÷
    // altura = 1,333). Calculamos a largura a partir da altura desejada
    // para ela ficar do tamanho certo e não esticada.
    const PROPORCAO_FANTA = 700 / 525;
    const ALTURA_ALVO_FANTA = 0.61; // mesma altura usada pela Coca/Pepsi, para ficarem alinhadas

    function alvoFantaLargura() {
        if (!cardFanta) return '26%';
        const r = retanguloCardFanta();
        const alturaAlvoPx = r.altura * ALTURA_ALVO_FANTA;
        const larguraPx = alturaAlvoPx * PROPORCAO_FANTA;
        return `${(larguraPx / window.innerWidth) * 100}%`;
    }

    function alvoFantaTopo() {
        if (!cardFanta) return '210%';
        const r = retanguloCardFanta();
        const topoPx = r.topPagina + r.altura * 0.195;
        return `${(topoPx / window.innerHeight) * 100}%`;
    }

    function alvoFantaEsquerda() {
        if (!cardFanta) return '37%';
        const r = retanguloCardFanta();
        const alturaAlvoPx = r.altura * ALTURA_ALVO_FANTA;
        const larguraAlvoPx = alturaAlvoPx * PROPORCAO_FANTA;
        const centroPx = r.leftPagina + r.largura / 2;
        const leftPx = centroPx - larguraAlvoPx / 2;
        return `${(leftPx / window.innerWidth) * 100}%`;
    }

    // A fatia de laranja usa o MESMO tamanho e a MESMA posição dos limões:
    // mesmo diâmetro visível e mesmo centro do círculo, medidos a partir do
    // limão real (as imagens têm margens transparentes diferentes, então
    // usamos onde o círculo realmente está dentro de cada PNG).
    const LIMAO_CIRCULO = { largura: 0.705, centroX: 0.51, centroY: 0.4863 }; // lemon.png 400x400
    const LARANJA_PROPORCAO = 500 / 491; // orange2.png: altura ÷ largura (círculo ocupa a imagem toda)
    const limaoRef = document.querySelector('.lemon');

    function geometriaLaranja() {
        const r = retanguloCardFanta();
        const limaoLargura = limaoRef ? limaoRef.offsetWidth : 340;
        const diametro = limaoLargura * LIMAO_CIRCULO.largura;
        // Posição do limão dentro do card: left 50% (centralizado), top -3% da altura do card
        const limaoEsquerda = r.leftPagina + r.largura / 2 - limaoLargura / 2;
        const limaoTopo = r.topPagina - r.altura * 0.03;
        const centroX = limaoEsquerda + limaoLargura * LIMAO_CIRCULO.centroX;
        const centroY = limaoTopo + limaoLargura * LIMAO_CIRCULO.centroY;
        return {
            largura: diametro,
            esquerda: centroX - diametro / 2,
            topo: centroY - (diametro * LARANJA_PROPORCAO) / 2,
        };
    }

    function alvoLaranjaLargura() {
        if (!cardFanta) return '12%';
        return `${(geometriaLaranja().largura / window.innerWidth) * 100}%`;
    }

    function alvoLaranjaTopo() {
        if (!cardFanta) return '200%';
        return `${(geometriaLaranja().topo / window.innerHeight) * 100}%`;
    }

    function alvoLaranjaEsquerda() {
        if (!cardFanta) return '45%';
        return `${(geometriaLaranja().esquerda / window.innerWidth) * 100}%`;
    }

    // Duração menor que a padrão (0.5) faz a Fanta terminar o percurso
    // num pedaço menor do scroll, em vez de "atrasada" em relação aos
    // outros elementos, que já chegam mais rápido no lugar deles.
    tl2.to(
        '#laranja-cortada',
        { width: alvoLaranjaLargura, top: alvoLaranjaTopo, left: alvoLaranjaEsquerda, duration: 0.3 },
        'ca'
    );
    tl2.to(
        '#fanta',
        { width: alvoFantaLargura, top: alvoFantaTopo, left: alvoFantaEsquerda, duration: 0.3 },
        'ca'
    );
}

// Zoom do card da Fanta: a Fanta e a laranja ficam FORA do .card (são os
// elementos que viajam pela página), então escalamos eles em volta do centro
// do card pra acompanharem o zoom dele.
const fantaImg = document.getElementById('fanta');
const laranjaImg = document.getElementById('laranja-cortada');
const cards = document.querySelectorAll('.three .card');

// Posição na página ignorando transforms (scale/rotate), pra não errar
// o centro do card enquanto ele está em transição de zoom.
function posicaoNaPagina(el) {
    let x = 0;
    let y = 0;
    while (el) {
        x += el.offsetLeft;
        y += el.offsetTop;
        el = el.offsetParent;
    }
    return { x: x, y: y };
}

function definirOrigem(el, card) {
    const c = posicaoNaPagina(card);
    const e = posicaoNaPagina(el);
    const centroX = c.x + card.offsetWidth / 2;
    const centroY = c.y + card.offsetHeight / 2;
    el.style.transformOrigin = centroX - e.x + 'px ' + (centroY - e.y) + 'px';
}

cards.forEach(function (card) {
    const titulo = card.querySelector('h3');
    if (titulo && titulo.textContent.trim() === 'Fanta Laranja' && fantaImg) {
        card.addEventListener('mouseenter', function () {
            [fantaImg, laranjaImg].forEach(function (el) {
                if (!el) return;
                definirOrigem(el, card);
                el.classList.add('fanta-hover');
            });
        });
        card.addEventListener('mouseleave', function () {
            [fantaImg, laranjaImg].forEach(function (el) {
                if (el) el.classList.remove('fanta-hover');
            });
        });
    }
});

// Carrinho: botões "Adicionar ao carrinho" e contador no menu
const contagemEl = document.getElementById('carrinho-contagem');

function atualizarContagem() {
    if (!contagemEl) return;
    const total = totalDeItens();
    contagemEl.textContent = total;
    contagemEl.classList.toggle('vazio', total === 0);
}

document.querySelectorAll('.btn-carrinho[data-produto]').forEach(function (botao) {
    const textoOriginal = botao.textContent;
    botao.addEventListener('click', function () {
        adicionarAoCarrinho(botao.dataset.produto);
        atualizarContagem();

        botao.textContent = 'Adicionado ✓';
        clearTimeout(botao._timer);
        botao._timer = setTimeout(function () {
            botao.textContent = textoOriginal;
        }, 1200);

        if (contagemEl) {
            contagemEl.classList.remove('pulo');
            void contagemEl.offsetWidth; // reinicia a animação
            contagemEl.classList.add('pulo');
        }
    });
});

atualizarContagem();
// Se o carrinho mudar em outra aba, atualiza aqui também
window.addEventListener('storage', atualizarContagem);

// Botão de WhatsApp do rodapé usa o número configurado em carrinho.js
const linkWpp = document.getElementById('link-whatsapp');
if (linkWpp) {
    linkWpp.href = linkWhatsApp('Olá! Vim pelo site da Drinks.');
}

// Menu com fundo sólido depois que a página rola (senão o texto branco some
// quando passa por cima dos cards brancos).
const navContainer = document.getElementById('nav-container');
function atualizarMenuRolagem() {
    if (navContainer) navContainer.classList.toggle('rolou', window.scrollY > 40);
}
window.addEventListener('scroll', atualizarMenuRolagem, { passive: true });
atualizarMenuRolagem();
