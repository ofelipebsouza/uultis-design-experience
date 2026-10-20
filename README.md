# Uultis — Expressões de vida

Proposta de experiência digital para a Uultis, com apresentação editorial, catálogo interativo, direção de branding e guia de estilo. Produtos, descrições, imagens e destinos de contato foram extraídos das fontes oficiais da marca em 20 de outubro de 2026.

**Código-fonte:** [ofelipebsouza/uultis-design-experience](https://github.com/ofelipebsouza/uultis-design-experience).

O projeto é estático, preparado para publicação na Vercel. Não exige instalação de pacotes nem etapa de build: os arquivos publicados estão em `dist/`.

## Páginas

| Caminho | Conteúdo |
| --- | --- |
| `/` | Experiência editorial, materialidade, designers, ambientes e catálogo completo. |
| `/branding/` | Direção criativa da proposta: essência, posicionamento, linguagem, aplicações e origem das referências. |
| `/guia-de-estilo/` | Sistema visual: paleta, tipografia, espaçamento, componentes, apresentação de produtos, movimento e acessibilidade. |

As páginas de branding e guia de estilo têm estrutura própria e compartilham os assets da proposta. Os links para elas estão no rodapé da página principal.

## Catálogo e experiência

- 213 produtos em 21 categorias, com descrições oficiais completas em português.
- Busca por peça, designer, categoria e termos da descrição; filtros e ordenação.
- Detalhes e galeria de cada peça, com links originais de fichas técnicas, modelos 3D e vídeos quando disponíveis.
- Favoritos armazenados no dispositivo do visitante com `localStorage`.
- Coleção Simbiose 2026 selecionada pela tag oficial exata, com 38 peças.
- Rolagem nativa, capítulos de materialidade e movimento adaptado à preferência de redução de animações do sistema.
- Projetos oficiais Casa D|A / Niva ARQ e Dafne Beauty House / Paula Ambrósio.
- Lojas, contatos, designers e conteúdo institucional conectados aos canais oficiais da Uultis.

A navegação do catálogo usa fragmentos de URL, como `/#colecao` e `/#produto/274`. As páginas de apresentação usam diretórios reais e não dependem de um redirecionamento global para a home.

## Executar localmente

Requisito: Python 3 para servir os arquivos por HTTP.

```bash
git clone https://github.com/ofelipebsouza/uultis-design-experience.git
cd uultis-design-experience
python3 -m http.server 8080 --directory dist
```

Abrir:

- [Experiência principal](http://localhost:8080/)
- [Branding](http://localhost:8080/branding/)
- [Guia de estilo](http://localhost:8080/guia-de-estilo/)

Para encerrar o servidor, pressionar `Ctrl+C` no terminal.

## Estrutura

| Arquivo ou diretório | Responsabilidade |
| --- | --- |
| `dist/index.html` | Estrutura e conteúdo da experiência principal. |
| `dist/styles.css` | Composição, responsividade e animações da página principal. |
| `dist/app.js` | Navegação, busca, catálogo, favoritos e diálogos. |
| `dist/branding/index.html` | Apresentação da direção de branding. |
| `dist/guia-de-estilo/index.html` | Guia de estilo e componentes da proposta. |
| `dist/assets/catalog.json` | Dados estruturados dos produtos. |
| `dist/assets/catalog.js` | Os mesmos dados disponibilizados ao navegador em `window.UULTIS_PRODUCTS`. |
| `dist/assets/editorial.js` | Imagens, créditos e links dos projetos apresentados. |
| `dist/assets/` | Wordmarks, fontes locais, imagens de produtos e fotografias editoriais. |
| `vercel.json` | Configuração estática de publicação. |
| `.gitignore` e `.vercelignore` | Exclusão de arquivos locais e seleção dos arquivos de hospedagem. |

## Publicação na Vercel

Importar o repositório `ofelipebsouza/uultis-design-experience`, usando a raiz do repositório como Root Directory. O arquivo `vercel.json` define:

- Framework: Other (`null`).
- Build Command e Install Command: vazios.
- Output Directory: `dist`.
- URLs de páginas com barra final (`trailingSlash: true`).

O conteúdo de `dist/` já está pronto para ser servido. Não é necessário adicionar `package.json`, instalar um framework ou gerar novamente os arquivos para publicar esta versão.

Após confirmar a origem definitiva da publicação, manter os metadados `canonical` e Open Graph coerentes com esse endereço. A proposta preserva `noindex, nofollow`.

## Manutenção

### Produtos

Ao alterar um produto, manter `catalog.json` e `catalog.js` sincronizados. Preservar os IDs como strings, os nomes e descrições oficiais e a correspondência exata entre a peça e suas fotografias.

- `thumbnail` e `image` apontam para imagens locais.
- `display_images` contém a galeria local usada na interface.
- `url`, `designer_url` e `specs` preservam os destinos oficiais.
- `availability_note`, quando presente, deve continuar visível na apresentação da peça.

### Assets e conteúdo editorial

A publicação utiliza versões WebP otimizadas das fotografias e imagens de produtos. As cópias publicadas foram preparadas sem metadados EXIF; os JPGs originais sem uso na interface foram retirados deste repositório de publicação. Os arquivos originais e seus registros de procedência permanecem no pacote de extração entregue separadamente.

Ao substituir uma imagem, gerar sua versão otimizada, preservar a identidade visual da peça e atualizar os caminhos que a utilizam. Atualizar os créditos e links em `editorial.js` ao trocar projetos.

### Identidade

Ao modificar cores, fontes, componentes ou movimento, atualizar também o guia de estilo. A página de branding registra a intenção criativa e deve acompanhar mudanças de posicionamento da proposta.

O wordmark Uultis e as fontes Athelas Regular e SuisseIntl Light/Medium são referências da identidade extraída. Os fundos quentes e neutros e a composição editorial fazem parte desta proposta digital. O material não constitui um manual oficial aprovado pela Uultis.

### Conferência antes de publicar

Conferir a home, as duas páginas de apresentação, busca, filtros, favoritos, detalhes de produto e links oficiais. Verificar a navegação em desktop e mobile, a preferência por movimento reduzido e a existência dos arquivos citados no catálogo.

## Escopo e fontes

Esta é uma proposta de apresentação e descoberta de produtos. Os links comerciais e de contato direcionam aos canais oficiais; o filme institucional abre um player externo após ação do visitante. O projeto não inclui checkout, cadastro de clientes ou processamento de pedidos.

Fontes principais: [Uultis](https://www.uultis.com/) e [Uultis USA](https://usa.uultis.com/). Marca, fotografias, desenhos, descrições e produtos pertencem aos seus respectivos titulares.
