# Green Thumb Planner

# Prompt para o Lovable — Sistema Web Responsivo de Jardinagem (THE GARDEN)

Crie um aplicativo web completo, moderno, responsivo e otimizado para celular chamado **THE GARDEN**, voltado para um profissional de jardinagem e roçada. O sistema deve ser leve, rápido e desenvolvido com **PHP puro (PHP 8+)**, HTML, CSS e JavaScript, priorizando desempenho e simplicidade.

## Objetivo do sistema

O sistema será utilizado para controlar clientes, agendamentos, calendário, serviços realizados, materiais utilizados e ferramentas utilizadas em cada serviço. O aplicativo deve funcionar muito bem em **smartphones**, podendo ser instalado como um **PWA (Progressive Web App)**.

## Identidade visual

* Nome da marca: **THE GARDEN**
* Estilo moderno
* Cores predominantes:

  * Verde escuro (#1B5E20)
  * Verde médio (#2E7D32)
  * Verde claro (#81C784)
  * Branco
* Interface elegante
* Ícones minimalistas
* Botões arredondados
* Aparência profissional
* Excelente usabilidade para uso durante o trabalho

## Login

Criar tela de login com:

* Email
* Senha
* Recuperação de senha
* Manter conectado
* Tela de cadastro de usuário

O sistema deve possuir autenticação segura.

## Armazenamento dos dados

Quero que o sistema seja preparado para funcionar com **armazenamento local no celular (PWA)**, utilizando um banco local do dispositivo (SQLite ou armazenamento local persistente).

O servidor em PHP deve apenas:

* autenticar o usuário;
* ler e sincronizar os dados do celular através de um endpoint;
* receber backup dos dados;
* restaurar dados quando necessário.

Criar uma estrutura preparada para sincronização futura.

## Dashboard (Tela inicial)

A tela inicial deve mostrar:

* Saudação ao usuário
* Data atual
* Próximos serviços
* Quantidade de serviços do dia
* Tempo total estimado
* Clientes agendados para hoje
* Atalho para criar novo agendamento
* Atalho para cadastrar cliente

Criar um painel visual com cartões.

## Agenda e calendário

Criar uma tela de calendário completo.

Funções:

* visualizar por dia;
* semana;
* mês;
* adicionar agendamento;
* editar agendamento;
* excluir agendamento;
* arrastar agendamento (drag and drop se possível);
* cores por status.

Cada agendamento deve possuir:

* cliente;
* data;
* horário;
* tipo do serviço;
* tempo estimado;
* observações;
* prioridade;
* endereço.

## Notificações

Criar sistema de notificações.

### Notificação diária obrigatória

Todos os dias às **07:00 da manhã**, o aplicativo deve gerar uma notificação com:

**Clientes agendados para hoje**

Exemplo:

* João Silva – 08:00
* Maria Souza – 10:30
* Carlos Oliveira – 14:00

As notificações devem funcionar no celular (PWA).

Também criar notificações para:

* serviço iniciando em 30 minutos;
* serviço atrasado;
* serviço concluído.

## Cadastro de clientes

Criar tela completa de clientes.

Campos:

* Nome
* Telefone
* WhatsApp
* Endereço
* Bairro
* Cidade
* Observações
* Fotos do jardim
* Tamanho aproximado do terreno (m²)
* Tempo estimado da roçada
* Frequência do serviço

  * semanal
  * quinzenal
  * mensal
  * eventual

Permitir anexar várias fotos.

Mostrar uma galeria de fotos do cliente.

## Perfil do cliente

Ao abrir um cliente, mostrar:

* dados completos;
* fotos;
* histórico de serviços;
* tempo médio de execução;
* materiais normalmente utilizados;
* ferramentas utilizadas;
* próximos agendamentos.

## Agendamento de serviços

Criar tela para criar serviço.

O serviço pode ser:

* agendado;
* ou iniciado imediatamente (sem agendamento).

Campos:

* Cliente
* Data
* Horário
* Tipo do serviço
* Tempo estimado
* Observações

Status:

* Agendado
* Em andamento
* Concluído
* Cancelado

## Tela de serviços

Criar uma tela chamada **Serviços**.

Nela devem existir filtros:

* Agendados
* Em andamento
* Concluídos
* Cancelados

Ao finalizar um serviço, abrir automaticamente uma tela de conclusão.

## Finalização do serviço

Quando um serviço for concluído, registrar:

### Tempo de serviço

* horário de início;
* horário de término;
* tempo total.

### Serviços adicionais

Permitir adicionar serviços extras, como:

* poda;
* limpeza;
* retirada de entulho;
* aplicação de produto;
* corte de árvore;
* outros.

### Materiais utilizados

Permitir selecionar:

* gasolina;
* óleo;
* fio de nylon;
* corrente;
* adubo;
* herbicida;
* outros.

Permitir informar quantidade.

## Ferramentas utilizadas

Criar ícones ilustrativos para cada ferramenta.

Ferramentas:

* Roçadeira 1
* Roçadeira 2
* Carrinho da roçadeira
* Motosserra
* Motopoda

Na tela de conclusão do serviço, permitir marcar quais ferramentas foram utilizadas.

Mostrar os ícones em verde.

## Histórico do serviço

Cada serviço deve guardar:

* cliente;
* data;
* tempo estimado;
* tempo real;
* materiais;
* ferramentas;
* fotos antes;
* fotos depois;
* observações.

## Fotos

Permitir:

* tirar foto pelo celular;
* enviar foto da galeria;
* visualizar em tela cheia.

Criar comparação:

Antes / Depois.

## Pesquisa

Criar pesquisa rápida por:

* nome do cliente;
* telefone;
* endereço;
* data do serviço.

## Relatórios

Criar tela de relatórios.

Relatórios:

* serviços por mês;
* tempo médio por cliente;
* clientes mais frequentes;
* utilização das ferramentas;
* consumo de materiais.

## Estrutura das telas

Criar as seguintes páginas:

* Login
* Dashboard
* Calendário
* Agenda
* Clientes
* Novo Cliente
* Editar Cliente
* Perfil do Cliente
* Serviços
* Novo Serviço
* Editar Serviço
* Concluir Serviço
* Relatórios
* Configurações

## Configurações

Permitir configurar:

* horário da notificação diária;
* cores do sistema;
* backup local;
* sincronização;
* exportar dados;
* importar dados.

## Responsividade

O sistema deve ser pensado primeiro para **celular (mobile first)**.

Criar interface semelhante a aplicativos modernos.

Menu inferior com:

* Início
* Calendário
* Clientes
* Serviços
* Mais

## Performance

Quero um sistema extremamente leve.

Evitar frameworks pesados.

Utilizar:

* PHP
* JavaScript puro
* CSS moderno
* Local Storage / SQLite
* PWA

## Organização do código

Separar:

* autenticação;
* clientes;
* agendamentos;
* serviços;
* notificações;
* sincronização;
* relatórios.

Criar código limpo e documentado.

## Rodapé

No final de todas as telas colocar discretamente:

**Desenvolvido por COMPANIN VTR**

Email:

**[vmuniz.dev@gmail.com](mailto:vmuniz.dev@gmail.com)**

O resultado deve parecer um aplicativo profissional de jardinagem, com excelente experiência no celular, visual verde sofisticado, calendário intuitivo, gestão completa de clientes e serviços, notificações automáticas e estrutura pronta para evolução futura.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://green-hand-log.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/761f4064-48be-4ed9-bef1-665785528a80).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
