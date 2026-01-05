# DOCX Viewer — Layout e Paginação

Este documento descreve as alterações realizadas para corrigir posicionamento, remover margens externas, disponibilizar modos de ajuste (fill/center) e melhorar a confiabilidade das quebras de páginas no visualizador de arquivos `.docx`.

## Objetivos
- Área branca principal ocupando todo o espaço disponível, sem margens externas.
- Conteúdo encostando nas laterais e superior (modo fill) com opção de centralização (modo center).
- Paginação mais confiável, evitando cortes inadequados em elementos comuns.
- Layout responsivo, adaptando-se a diferentes tamanhos de tela.

## Arquivos Alterados
- `web/docx-viewer.html`: CSS reforçado, modos `fit=fill|center` via query param, normalização de wrappers/páginas e posicionamento com `translate + scale`.
- `src/screens/9.Agenda/29.Modal-DocxReader.tsx`: `srcDoc` atualizado para refletir o mesmo CSS e lógica de posicionamento/normalização.

## Principais Mudanças
- Remoção de margens/sombras externas: `.docx > *`, `.docx .docx-page`, `.docx .page`, `section`, `article` recebem `margin:0`, `box-shadow:none`, `left:0`, `padding:0`.
- Posicionamento confiável: `transform-origin: top left` e `transform: translate(tx, ty) scale(s)`; em `fill` encosta topo/esquerda; em `center`, centraliza quando couber na altura do viewport.
- Regras anti-corte: `break-inside: avoid` e `page-break-inside: avoid` em `table`, `img`, `figure` e `.table`; `orphans/widows` em parágrafos.
- Observação de redimensionamento: `ResizeObserver` e `document.fonts.ready` para recalcular escala/altura.

## Como usar
- Viewer estático (Web): `http://localhost:8081/web/docx-viewer.html?file=<URL>&fit=fill` ou `&fit=center`.
- Modal (srcDoc): usa modo `fill` por padrão; centralização vertical é aplicada apenas quando a altura escalada cabe no viewport.

## Validação
- Verificar se a área branca ocupa toda a largura e encosta nas laterais/superior (modo fill).
- Testar documentos com tabelas, imagens e parágrafos longos para garantir ausência de cortes inadequados.
- Testar em diferentes navegadores (Chrome, Edge, Firefox) e tamanhos de tela.

## Observações de Manutenção
- Evitar alterar `docx-preview` diretamente; preferir normalização via CSS/JS pós-render.
- Parametrização futura: permitir `pageSpacing`, `pagePadding` e `fitMode` no modal para cenários específicos.