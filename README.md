# Uultis — Expressões de vida

Proposta de experiência digital para a Uultis, com apresentação editorial, catálogo interativo, direção de branding e guia de estilo. Produtos, descrições, imagens e destinos de contato foram extraídos das fontes oficiais da marca em 20 de outubro de 2026.

**Código-fonte:** [ofelipebsouza/uultis-design-experience](https://github.com/ofelipebsouza/uultis-design-experience).

**Endereços do projeto na Vercel:**

- [Experiência principal](https://uultis-design-experience.vercel.app/)
- [Branding](https://uultis-design-experience.vercel.app/branding/)
- [Guia de estilo](https://uultis-design-experience.vercel.app/guia-de-estilo/)

A configuração de produção usa o domínio `uultis-design-experience.vercel.app` e a branch `main` do repositório GitHub.

O projeto usa HTML, CSS e JavaScript estáticos e tem a Vercel como destino de publicação. Os arquivos-fonte estão em `dist/`. A preparação com Node.js 22 ou superior executa `npm run build` e copia esse conteúdo para `public/`, diretório servido pela Vercel. O script não depende de pacotes externos.

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
- Detalhes e galeria de cada peça, com vídeos oficiais quando disponíveis.
- 356 fichas técnicas oficiais: 214 documentos em português, 141 em inglês e 1 em espanhol. Todos os 213 produtos têm ao menos uma ficha em português.
- 203 produtos com acesso a recursos 3D e de modelagem nas fontes oficiais: 195 links diretos para modelos no SketchUp 3D Warehouse, 7 links de busca na organização da Uultis e 92 links para Casoca. Há produtos presentes em mais de uma fonte.
- Favoritos armazenados no dispositivo do visitante com `localStorage`.
- Coleção Simbiose 2026 selecionada pela tag oficial exata, com 38 peças.
- Rolagem nativa, capítulos de materialidade e movimento adaptado à preferência de redução de animações do sistema.
- Projetos oficiais Casa D|A / Niva ARQ e Dafne Beauty House / Paula Ambrósio.
- Lojas, contatos, designers e conteúdo institucional conectados aos canais oficiais da Uultis.

O acesso aos modelos 3D usa os destinos oficiais do SketchUp 3D Warehouse e da Casoca. A visualização e os downloads são oferecidos por esses serviços, conforme os recursos disponíveis em cada destino.

A navegação do catálogo usa fragmentos de URL, como `/#colecao` e `/#produto/274`. As páginas de apresentação usam diretórios reais e não dependem de um redirecionamento global para a home.

## Executar localmente

Requisitos: Node.js 22 ou superior, com npm, para preparar o pacote; Python 3 para servir os arquivos localmente por HTTP.

```bash
git clone https://github.com/ofelipebsouza/uultis-design-experience.git
cd uultis-design-experience
npm run build
python3 -m http.server 8080 --directory public
```

Abrir:

- [Experiência principal](http://localhost:8080/)
- [Branding](http://localhost:8080/branding/)
- [Guia de estilo](http://localhost:8080/guia-de-estilo/)

Após alterar arquivos em `dist/`, executar novamente `npm run build` para atualizar `public/`. Não é necessário instalar dependências. Para encerrar o servidor, pressionar `Ctrl+C` no terminal.

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
| `dist/assets/` | Wordmarks, fontes de licença aberta e suas licenças, imagens de produtos e fotografias editoriais. |
| `package.json` | Comando de preparação e requisito de Node.js. |
| `scripts/build.mjs` | Copia o conteúdo de `dist/` para `public/`. |
| `public/` | Saída gerada para publicação; manter alterações nas fontes em `dist/`. |
| `vercel.json` | Configuração de preparação e publicação na Vercel. |
| `.gitignore` e `.vercelignore` | Exclusão de arquivos locais e seleção dos arquivos de hospedagem. |

## Publicação na Vercel

O projeto `uultis-design-experience` na Vercel está conectado ao repositório GitHub `ofelipebsouza/uultis-design-experience`. A branch de produção é `main`, e a raiz do repositório é o Root Directory. Pela integração Git, os commits enviados a `main` acionam novos deploys de produção. Consultar o resultado de cada deploy na Vercel para confirmar a publicação de uma alteração.

O arquivo `vercel.json` define:

- Framework: Other (`null`).
- Build Command: `npm run build`.
- Install Command: vazio; não há dependências externas.
- Output Directory: `public`.
- URLs de páginas com barra final (`trailingSlash: true`).

A Vercel executa o script `scripts/build.mjs` por meio de `npm run build`, usando Node.js 22 ou superior. Essa etapa prepara a saída de publicação ao copiar os arquivos estáticos de `dist/` para `public/`; não exige compilação de framework nem instalação de dependências. As rotas `/`, `/branding/` e `/guia-de-estilo/` são servidas a partir da estrutura de diretórios copiada.

A origem definida é `https://uultis-design-experience.vercel.app`. Os metadados `canonical`, `og:url` e `og:image` das três páginas usam esse domínio, com canonical próprio para cada rota. A proposta preserva `noindex, nofollow`.

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

O wordmark Uultis é preservado como referência da marca. Athelas Regular e SuisseIntl Light/Medium são referências tipográficas observadas no site original; os arquivos dessas famílias não são redistribuídos neste repositório. A versão pública utiliza Inter na interface e Libre Baskerville nos destaques editoriais. Os fundos quentes e neutros, a composição e a escolha tipográfica pública fazem parte desta proposta digital. O material não constitui um manual oficial aprovado pela Uultis.

### Tipografia pública e licenças

Inter e Libre Baskerville são distribuídas sob a SIL Open Font License (OFL). A versão pública inclui os arquivos tipográficos e os respectivos textos de licença:

| Arquivo | Uso |
| --- | --- |
| `dist/assets/Inter-Variable.ttf` | Interface, navegação, textos e hierarquia sem serifa. |
| `dist/assets/LibreBaskerville-Variable.ttf` | Destaques editoriais com serifa. |
| `dist/assets/LibreBaskerville-Italic.ttf` | Ênfases editoriais em itálico. |
| `dist/assets/OFL-Inter.txt` | Licença da família Inter. |
| `dist/assets/OFL-LibreBaskerville.txt` | Licença da família Libre Baskerville. |

Manter os textos de licença junto aos arquivos ao redistribuir esta versão. As referências Athelas e SuisseIntl documentam a pesquisa da identidade original; a implementação pública usa somente as famílias de licença aberta listadas acima.

### Conferência antes de publicar

Conferir a home, as duas páginas de apresentação, busca, filtros, favoritos, detalhes de produto e links oficiais. Verificar a navegação em desktop e mobile, a preferência por movimento reduzido e a existência dos arquivos citados no catálogo.

## Escopo e fontes

Esta é uma proposta de apresentação e descoberta de produtos. Os links comerciais e de contato direcionam aos canais oficiais; o filme institucional abre um player externo após ação do visitante. O projeto não inclui checkout, cadastro de clientes ou processamento de pedidos.

Fontes principais: [Uultis](https://www.uultis.com/) e [Uultis USA](https://usa.uultis.com/). Marca, fotografias, desenhos, descrições e produtos pertencem aos seus respectivos titulares.
