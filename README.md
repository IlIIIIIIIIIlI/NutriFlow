# NutriFlow 1.3 — refeições personalizáveis

Seis refeições iniciais: Café da manhã, Almoço, Café da tarde, Pré treino, Janta e Ceia. Em **Montar Refeições**, use **+ Adicionar refeição**, o lápis para editar nome/ilustração e a lixeira para remover (com confirmação e opção Desfazer). Cada plano admite de 1 a 12 refeições e mantém sua própria configuração. Os banners usam seis imagens ilustrativas geradas por IA, locais, incluídas no cache offline.

Planos antigos de quatro refeições são migrados preservando alimentos e quantidades; Pré treino e Ceia começam vazios. As metas por refeição passam à distribuição abaixo. Adicionar/remover refeições renormaliza as frações, sem alterar pesos já informados.

## Busca online

Nova opção: **Alimentos → Buscar online**. Consulta produtos e fotos do Open Food Facts sem baixar a base inteira. A documentação da integração, limites e testes está em [ONLINE.md](ONLINE.md).

# NutriFlow

Primeira versão funcional local, em português, sem instalação de bibliotecas e com busca online opcional no Open Food Facts. Interface escura/amarela, responsiva, seis refeições iniciais personalizáveis, catálogo editável, planos locais e PWA offline.

## Executar e testar

Requer Node.js 20 ou superior apenas para o servidor de desenvolvimento e testes. Abra o terminal nesta pasta:

```powershell
npm start
```

Abra http://localhost:4173/NutriFlow/ (simula o subdiretório do GitHub Pages). Também funciona em http://localhost:4173/. Não abra `index.html` via `file://`: módulos e service worker precisam de HTTP local ou HTTPS.

```powershell
npm test
```

Não é necessário `npm install`. Para encerrar o servidor, Ctrl+C.

## Uso

1. **Meu Dia**: veja os totais planejados e edite as metas. Padrões: 2400 kcal, 130 g P, 308 g C, 72 g G. Distribuição inicial: café da manhã 20%, almoço 30%, café da tarde 15%, pré treino 10%, janta 20% e ceia 5%. As frações são normalizadas ao adicionar/remover refeições; a edição individual de percentuais não está disponível.
2. **Alimentos**: busque, filtre, adicione ou edite composição por 100 g. A matriz apresenta pesos equivalentes a 25 g P, 30 g C, 10 g G e, para frutas, 20 g C. Todos os demais macros continuam contando.
3. **Montar Refeições**: selecione vários alimentos de quaisquer categorias. Os novos começam com 0 g. Manual: informe os pesos. Automático: calcule todos os selecionados. Híbrido: marque “Fixo” nos pesos que devem ser preservados. Os limites editáveis aplicam-se apenas às quantidades ajustadas automaticamente; um fixo pode exceder o limite. O campo aceita até 2000 g por alimento/refeição.
4. Alterne entre refeição, dia inteiro e preparo conjunto de almoço/jantar. A lista conjunta soma pesos crus/secos por alimento. O cálculo de um dia resolve cada refeição segundo sua fração da meta; não redistribui nutrientes livremente entre refeições.
5. **Meus Planos**: salve com nome, reabra para editar/reutilizar e salve novamente para atualizar. Duplique para criar uma variação. Rascunho é salvo a cada alteração; biblioteca só é atualizada ao salvar. Novo plano vazio pede confirmação antes de substituir o rascunho.
6. Exporte JSON regularmente. Importar substitui todos os dados após validação e confirmação; não mescla bibliotecas. Limites: 2 MB por arquivo, 300 alimentos, 100 planos. Dados inválidos não são aplicados. Strings são escapadas na interface.

## Dados e pesagem

Catálogo inicial: 13 alimentos, com ilustrações SVG locais originais (não fotografias). Fontes e IDs estão em `foods.js` e nos cartões. Referência: [TACO, 4ª edição, NEPA/Unicamp, 2011](https://nepa.unicamp.br/wp-content/uploads/sites/27/2023/10/taco_4_edicao_ampliada_e_revisada.pdf). Proteína vegetal: exemplo de rótulo, não marca real, deve ser editado antes do uso. Nenhum alimento com lactose é incluído deliberadamente; para cadastrar/editar é necessário confirmar ausência de lactose no produto.

Arroz, aveia, leguminosas: pesos crus/secos. Frango cru sem pele/osso. Frutas: parte comestível; banana sem casca, abacate sem casca/caroço. Ovos crus sem casca. Azeite pesado em gramas. Industrializados conforme vendidos, nunca confundir valores por porção com valores por 100 g. “Cru” é a base da pesagem, não uma sugestão de consumo cru. Não há conversão para peso cozido, ajuste por perdas ou rendimento de receitas. Edite rótulos para a marca usada. A composição é uma estimativa, não uma análise individual do produto.

Calorias são somadas da tabela independentemente dos macros. As metas padrão coincidem com 4P+4C+9G=2400, mas os valores dos alimentos podem diferir dessa fórmula. Alterar um alimento recalcula todos os planos que o referenciam: planos não congelam versões históricas da composição.

## Otimização

Mínimos quadrados por descida coordenada, com pesos não negativos e tetos por alimento/refeição. Minimiza a soma dos quadrados dos desvios de kcal/P/C/G normalizados por `max(meta, piso)`; pisos: 100 kcal e 10 g. Até 12000 iterações, convergência quando a maior mudança é inferior a 1e-7 g. Quantidades livres são arredondadas para 0,1 g; fixos são preservados exatamente. Exibe desvios assinados de cada nutriente. Sucesso significa desvio de até 5% (mínimo absoluto 0,5) em todos os componentes. Caso contrário, informa metas não atingidas e possível inviabilidade; isso não é uma prova matemática de inviabilidade do intervalo de tolerância. Pode zerar alimentos selecionados. Não avalia variedade, micronutrientes, preferências culinárias ou adequação clínica. Os limites iniciais são guardas de porção, não recomendações individuais.

## Offline, armazenamento e atualizações

Após o primeiro acesso completo, aguarde “NutriFlow pronto para usar offline”. O service worker guarda HTML, JS, CSS, manifest e todas as imagens. O escopo e os caminhos são relativos ao subdiretório. Os caches são separados pelo escopo; não remove caches de outros aplicativos. Dados ficam no `localStorage` deste navegador/origem, sem conta ou sincronização. A chave é `nutriflow-v2`; os dados antigos em `nutriflow-v1` são migrados e a chave original é preservada; duas instalações na mesma origem compartilham essa chave. Limpeza de dados do navegador remove planos: use backup JSON. Navegação privada, falta de espaço ou bloqueio de armazenamento podem impedir persistência; o aplicativo mostra aviso. Dados locais inválidos são preservados até a importação de backup válido.

Em uma atualização do código, altere a versão na constante `CACHE` de `sw.js`. Não usa `skipWaiting`: feche todas as abas/janelas do app e reabra para ativar a versão nova com segurança. Alterar somente os arquivos sem versionar o cache pode deixar a versão anterior ativa. O catálogo inicial não substitui automaticamente o catálogo já salvo no dispositivo.

## Publicar no GitHub Pages (somente quando desejar)

Nada foi publicado por esta implementação. Quando decidir publicar:

1. Revise os arquivos no GitHub Desktop, faça commit e envie para seu repositório NutriFlow.
2. No GitHub: **Settings → Pages → Build and deployment → Deploy from a branch**.
3. Escolha a branch que contém os arquivos (por exemplo `main`) e a pasta **/(root)**; salve.
4. Aguarde a publicação e abra o endereço exibido, normalmente `https://SEU-USUARIO.github.io/NutriFlow/`.

`index.html` está na raiz; `.nojekyll` desativa o processamento Jekyll. Não há build nem dependências remotas em tempo de execução. Código e catálogo ficam públicos se a hospedagem/repositório forem públicos; os planos pessoais não são enviados por este app. Não inclua backups pessoais no repositório. [Documentação do GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Instalar no Android

Abra o endereço HTTPS publicado no Chrome do Android. Aguarde o carregamento offline. No menu do Chrome, escolha a opção de instalar aplicativo/adicionar à tela inicial (o texto varia por versão) e confirme. Abra pelo ícone criado; teste em modo avião após a primeira carga. `localhost` do computador não é acessível como localhost do telefone; HTTP por IP da rede não oferece o mesmo suporte seguro a PWA. [Ajuda do Chrome](https://support.google.com/chrome/answer/9658361?co=GENIE.Platform%3DAndroid).

## Validação da versão 1.3

- 35 testes automatizados passaram, incluindo migração de planos, seis refeições, adição/remoção/desfazer, limites, metas proporcionais, JSON e cálculos com quantidades fixas.
- Imagens locais e arquivos do cache conferidos; sintaxe JavaScript validada.
- A verificação visual interativa desta atualização ficou bloqueada pela indisponibilidade do navegador de teste. A instalação em Android físico não foi testada.

## Validação anterior (versão inicial)

- 9 testes automatizados: soma de macros, equivalências e divisões por zero, recuperação de alvo conhecido, limites e fixos, inviabilidade/vazio, nutrientes/metas zero, metas agregadas, roundtrip JSON e rejeição de importações inválidas.
- Navegador local sob `/NutriFlow/`: seleção múltipla, cálculo automático, salvar, duplicar e persistência após recarga.
- Reabertura com servidor desligado: aplicativo, catálogo, 13 imagens e matriz continuaram funcionando pelo cache.
- Layout inspecionado em largura móvel de 390 px; sem elemento ultrapassando a largura nessa tela.
- Instalação em Android físico e publicação real no GitHub Pages não foram executadas. Importação/exportação foram validadas na lógica de dados, sem teste completo de transferência entre dispositivos. Não há alegação de auditoria completa de acessibilidade ou compatibilidade com todos os navegadores.

## Arquivos

`index.html`, `style.css`, `app.js`: interface; `core.js`: cálculos/validação; `foods.js`: catálogo; `assets/`: ilustrações e ícones; `sw.js` e `manifest.webmanifest`: PWA; `server.js`: servidor local; `tests/`: testes nativos do Node. Não há backend nem telemetria própria. A busca opcional conecta ao Open Food Facts; consulte ONLINE.md.
