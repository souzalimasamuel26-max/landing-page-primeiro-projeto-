# Drinks — loja de refrigerantes

## Como rodar

1. **Site (index.html e checkout.html):** basta abrir `index.html` no navegador,
   ou servir a pasta com qualquer servidor estático (Live Server, `npx serve`, etc.).
2. **Cálculo de frete (opcional):** o checkout consulta um servidor Node para
   calcular a distância até o endereço digitado. Para isso funcionar:
   ```bash
   cd server
   node server.js
   ```
   Ele sobe em `http://localhost:3000`. Se você publicar o site em outro lugar
   (Netlify, Vercel, etc.), publique esse servidor também e atualize a
   constante `FRETE_API_BASE` no topo de `checkout.js` com a URL dele.
   Sem o servidor rodando, o checkout ainda funciona — só o cálculo de frete
   fica indisponível e mostra um aviso.

## O que foi corrigido e melhorado

- **Fonte quebrada:** o CSS declarava um peso "regular" (400, não itálico) da
  fonte Product Sans que não existe nos arquivos enviados — o texto do corpo
  caía silenciosamente numa fonte diferente. Corrigido para declarar só os
  pesos que realmente existem, com uma pilha de fallback (Arial) para o resto.
- **Menu mobile não abria:** no celular, o ícone de menu aparecia mas não
  tinha nenhum código para abrir o menu — os links "Produtos", "Loja" e
  "Contato" ficavam inacessíveis. Agora o botão alterna um menu suspenso.
- **Links "Loja" e "Contato" não levavam a lugar nenhum** (`href="#"`).
  Viraram âncoras reais para as seções de produtos e um rodapé com contato.
- **Sem rodapé/seção de contato:** adicionado um rodapé com WhatsApp e horário.
- **Validação do checkout com `alert()`:** cada erro interrompia o preenchimento
  com uma caixa de alerta do navegador. Agora os erros aparecem embaixo de
  cada campo, sem travar a tela.
- **Preço e nome do produto duplicados** entre `index.html` e `checkout.js`
  (fácil de ficar inconsistente ao mudar um preço). Centralizado em um único
  catálogo de produtos no `checkout.js`.
- **Título/preço não mudavam de posição de forma acessível:** adicionado
  `aria-live`, `label for=`, `autocomplete` e estados de foco visíveis nos
  campos, para leitores de tela e navegação por teclado.
- **Máscaras nos campos de cartão** (número em blocos de 4, validade `MM/AA`
  automática, CVV só números) para reduzir erro de digitação.
- **Tipografia com `vw` puro:** o título "FANTA" e os textos de destaque
  usavam unidades só de viewport, ficando enormes em telas muito largas.
  Trocado por `clamp()` para manter um tamanho confortável em qualquer tela.
- **Animações sem checagem:** se o GSAP não carregasse (bloqueio de rede,
  offline), o site quebrava. Agora o script confere se a biblioteca existe
  antes de usá-la, e respeita a preferência do sistema por "reduzir
  movimento".
- **Servidor de frete:** reorganizado em funções menores, com tratamento de
  erro mais claro e porta configurável por variável de ambiente (`PORT`).
- Meta description, `theme-color` e título mais descritivo para melhorar
  como o site aparece em buscas e ao compartilhar o link.

## Próximos passos sugeridos

- Trocar o número de WhatsApp de exemplo no rodapé pelo número real.
- Se for cobrar de verdade, integrar um gateway de pagamento real (Mercado
  Pago, Stripe, PagSeguro etc.) — hoje o botão "Finalizar compra" só simula
  a confirmação.
- Publicar o `server/server.js` em algum lugar acessível (Render, Railway,
  etc.) se o site for hospedado fora da sua máquina.
