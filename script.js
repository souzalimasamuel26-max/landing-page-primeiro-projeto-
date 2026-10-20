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
        },
    });

    // ease "power2.out": começa rápido (chega perto do SVG logo) e vai
    // desacelerando até parar suavemente no lugar certo.
    tl.to('#fanta', { top: '150%', left: '0%', ease: 'power2.out' }, 'orange');
    tl.to('#laranja-cortada', { top: '190%', left: '23%', ease: 'power2.out' }, 'orange');
    tl.to('#laranja', { width: '15%', top: '190%', right: '10%', ease: 'power2.out' }, 'orange');

    // #folha e #folha2 ficam paradas (decorativas) — menos elementos
    // se movendo ao mesmo tempo durante o scroll = animação mais leve.

    var tl2 = gsap.timeline({
        scrollTrigger: {
            trigger: '.three',
            start: 'top 75%',
            end: 'top -20%',
            scrub: true,
            invalidateOnRefresh: true,
        },
    });

    // Duração um pouco menor que a padrão (0.5) faz a Coca/Pepsi (e os
    // limões junto delas) chegarem um pouco antes no lugar certo.
    tl2.fromTo(
        '.lemon1',
        { rotate: '-90deg', left: '-100%', top: '110%' },
        { rotate: '0', top: '-12%', left: '50%', duration: 0.35 },
        'ca'
    );

    tl2.fromTo(
        '#cocacola',
        { rotate: '-90deg', top: '110%', left: '-100%' },
        { rotate: '0', top: '6%', left: '50%', duration: 0.35 },
        'ca'
    );

    tl2.fromTo(
        '.lemon2',
        { rotate: '90deg', top: '110%', left: '100%' },
        { rotate: '0', top: '-12%', left: '50%', duration: 0.35 },
        'ca'
    );

    tl2.fromTo(
        '#pepsi',
        { rotate: '90deg', top: '110%', left: '100%' },
        { rotate: '0', top: '6%', left: '50%', duration: 0.35 },
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
    const ALTURA_ALVO_FANTA = 0.72; // maior que os 58%/63% da Coca/Pepsi, de propósito

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
        const topoPx = r.topPagina + r.altura * 0.06;
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

    function alvoLaranjaLargura() {
        return `${parseFloat(alvoFantaLargura()) * 0.55}%`;
    }

    function alvoLaranjaTopo() {
        return `${parseFloat(alvoFantaTopo()) - 4}%`;
    }

    function alvoLaranjaEsquerda() {
        return `${parseFloat(alvoFantaEsquerda()) + 8}%`;
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

// Zoom leve na Fanta ao passar o mouse sobre o card dela
// (o elemento #fanta não fica dentro do .card, por isso o hover
// precisa ser ligado via JS em vez de um simples seletor CSS).
const fantaImg = document.getElementById('fanta');
const cards = document.querySelectorAll('.three .card');

cards.forEach(function (card) {
    const titulo = card.querySelector('h3');
    if (titulo && titulo.textContent.trim() === 'Fanta Laranja' && fantaImg) {
        card.addEventListener('mouseenter', function () {
            fantaImg.classList.add('fanta-hover');
        });
        card.addEventListener('mouseleave', function () {
            fantaImg.classList.remove('fanta-hover');
        });
    }
});
