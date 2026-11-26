# NutriFlow 1.2 — consulta online

O botão **Alimentos → Buscar online** consulta a API do Open Food Facts sem baixar os arquivos do Hugging Face ou qualquer base inteira. O catálogo original e seus planos continuam funcionando.

## Como usar

1. Busque por nome/marca (pelo menos 2 caracteres) ou código de barras de 8 a 14 dígitos.
2. Por padrão, a busca por nome filtra produtos vendidos no Brasil. A busca por código é mundial, já que identifica um produto específico.
3. Veja foto, marca e calorias/macros. Use **Revisar e adicionar** para conferir o cadastro e o rótulo, editar os valores se necessário e confirmar a base por 100 g e ausência de lactose.
4. O produto salvo fica em Alimentos e pode ser selecionado em Montar Refeições. Metas e cálculos não são enviados ao Open Food Facts. Não há cadastro ou chave de API no app.

## Internet e offline

Buscas e fotos precisam de internet. Só os alimentos salvos são persistidos no `localStorage`, incluindo cópia dos nutrientes, código, URL de imagem e data de importação. Essa cópia não muda automaticamente quando o serviço altera um produto; você pode revisar manualmente seus valores.

Os planos e cálculos com alimentos salvos funcionam offline. Fotos remotas não são incluídas no cache obrigatório: se não carregarem, aparece a ilustração genérica local. A integração não faz download em massa e não envia planos, metas ou quantidades ao serviço. As consultas enviam o termo/código, filtros e identificação do app; conexões externas também expõem ao provedor o IP usual da conexão.

O service worker guarda os novos módulos locais. Versão de cache: `v3-online-1`. Após atualizar/publicar, feche todas as abas/janelas do NutriFlow e reabra para ativar a nova versão. Caminhos locais relativos continuam compatíveis com GitHub Pages em subdiretório. Não é necessário backend.

## Qualidade dos dados

- Dados colaborativos: a presença de um cadastro não confirma exatidão ou ausência de lactose.
- Qualquer calorias/P/C/G ausente ou inválido impede importação automática. Zero explicitamente informado pelo serviço continua sendo zero; não se corrige um rótulo por suposição.
- Energia em kJ, quando disponível sem kcal, é convertida dividindo por 4,184.
- Produtos detectados como volume (ml/L) ou com base de massa desconhecida ficam bloqueados: o app trabalha em gramas e não conhece a densidade.
- O sufixo `_100g` da API pode representar 100 ml. Há verificações da unidade/quantidade/porção e confirmação obrigatória do usuário, mas cadastros incorretos podem exigir revisão.
- Lactose informada acima de zero impede importação; selo “sem lactose” não sobrescreve valor contraditório.
- Produtos entram na condição **como vendidos**, sem conversão para cru. Todos os nutrientes importados são arredondados a duas casas decimais para compatibilidade com o formulário.
- Limites pessoais existentes permanecem: 300 alimentos, 100 planos e backup de até 2 MB. Backups antigos continuam válidos; os novos preservam metadados OFF.

## Conexão e limites

Busca por nome usa o endpoint legado documentado `/cgi/search.pl`; a API v2 de busca estruturada não suporta texto livre. Busca por código usa `/api/v2/product/{code}.json`. A documentação do provedor ainda lista esses caminhos; futuras mudanças podem exigir adaptação.

Busca por envio do formulário, não a cada tecla; páginas de 12 produtos. Intervalo mínimo de 6,5 segundos por instância do app. Cache de 20 consultas em memória, com validade de 5 minutos. Após HTTP 429, pausa local de 60 segundos. Tempo máximo de consulta: 15 segundos. Nenhuma repetição automática. Várias abas/usuários na mesma rede podem compartilhar o limite do provedor; falhas de rede/CORS/indisponibilidade são informadas sem apagar planos.

O navegador envia `X-User-Agent: NutriFlow/1.2 (origem do site)`; `User-Agent` não é substituído por JavaScript. A conexão CORS com esse cabeçalho funcionou no teste local. Requisições usam `credentials: omit` e não enviam login do usuário.

Referência: https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/

## Fontes, fotos e licenças

Dados: colaboradores do Open Food Facts, ODbL 1.0 e DbCL 1.0. Fotos: colaboradores do Open Food Facts, CC BY-SA 3.0. A interface mantém crédito e link para a página específica de cada produto. Dados importados e exportados continuam sujeitos às licenças de origem; a licença de dados não transforma automaticamente o código do aplicativo em ODbL. Fotos podem conter marcas e outros elementos com direitos próprios.

https://github.com/openfoodfacts/openfoodfacts-server/blob/main/docs/api/tutorials/license-be-on-the-legal-side.md
https://opendatacommons.org/licenses/odbl/1-0/
https://opendatacommons.org/licenses/dbcl/1-0/
https://creativecommons.org/licenses/by-sa/3.0/

## Validação feita

25 testes automatizados: cálculos anteriores, URLs de busca, filtros, códigos de barras, macros ausentes, conversão de energia, bloqueio de volume e lactose, validação de metadados/URLs, precisão decimal, compatibilidade de backup, cache, espaçamento, limite 429 e erros de rede/resposta.

Teste real no navegador local: busca “aveia”, filtro Brasil, retorno de 430 resultados informado pelo serviço naquele momento, fotos dos primeiros cartões carregadas, seleção de produto e preenchimento da revisão com nutrientes reais. A contagem é dinâmica. A confirmação de rótulo não foi marcada nem o produto real salvo por esse teste. O fluxo de dados salvos foi validado nos testes de roundtrip. Instalação Android e publicação GitHub Pages não foram executadas nesta atualização.

## Instalação local desta entrega

A pasta original não foi alterada nesta sessão devido à restrição de gravação. O pacote externo contém `aplicar_atualizacao.py`, que verifica a versão anterior por hash, salva backup dos arquivos substituídos em uma pasta irmã e aplica apenas os arquivos da atualização. Se os arquivos originais mudaram, ele aborta antes de escrever. `.git`, `.gitattributes`, dados do navegador e outros arquivos não são modificados. Não faz commit, push ou publicação.
