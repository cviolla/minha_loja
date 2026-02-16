# Implementação: Sistema de Carrinho e Checkout Premium CATALYST

Este documento detalha o plano para implementar as funcionalidades de Carrinho Lateral, Detalhes de Produto com customização e Checkout via WhatsApp.

## 1. Estrutura HTML

- **Modal de Detalhes**: Exibição ampliada do produto, seletor de quantidade (+/-) e campo de texto para observações.
- **Sidebar de Carrinho**: Gaveta lateral direita contendo a lista de itens, subtotal e botão para checkout.
- **Modal de Checkout**: Formulário para coleta de Nome e Endereço.

## 2. Design System (CSS)

- **Modais/Sidebars**: Estética "Glassmorphism" com bordas em `var(--primary)` e desfoque de fundo.
- **Micro-animações**: Transições suaves de entrada/saída (slide e fade).
- **Formulários**: Inputs com design brutalista, bordas acentuadas e feedback visual em foco.

## 3. Lógica (JS)

- **Gestão de Estado**: Atualização dinâmica do objeto `cart` suportando múltiplas unidades do mesmo produto com observações diferentes.
- **Interação**:
  - `showProductDetails(id)`: Abre o modal com os dados do produto.
  - `handleQuantityChange(delta)`: Controla o contador no modal.
  - `processCheckout()`: Valida os dados e gera o link formatado para WhatsApp.

## 4. Próximos Passos

1. Atualizar `index.html` com os novos containers.
2. Inserir estilos em `index.css`.
3. Refatorar e expandir `script.js`.
