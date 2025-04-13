# Banestes Apply - Aplicação de Gerenciamento de Clientes e Contas

Este é um projeto React com TypeScript que simula um sistema de gerenciamento de clientes e suas respectivas contas bancárias e agências. Os dados são obtidos diretamente de planilhas do Google Sheets no formato CSV.

## Funcionalidades

* **Listagem de Clientes:** Exibe uma lista paginada de clientes com opção de busca por nome ou CPF/CNPJ.
* **Detalhes do Cliente:** Permite visualizar informações detalhadas de um cliente específico, incluindo seus dados pessoais, contas bancárias e informações da agência.
* **Busca:** Implementação de um campo de busca na listagem de clientes para facilitar a localização.
* **Paginação:** A listagem de clientes é paginada para melhorar o desempenho e a usabilidade ao lidar com um grande número de clientes.
* **Formatação de Moeda:** Os valores monetários (renda anual, patrimônio, saldo, limite de crédito, crédito disponível) são formatados para o padrão brasileiro (BRL).

## Tecnologias Utilizadas

* **React:** Biblioteca JavaScript para construção de interfaces de usuário.
* **TypeScript:** Superset de JavaScript que adiciona tipagem estática.
* **React Router DOM:** Biblioteca para roteamento declarativo no React.
* **PapaParse:** Biblioteca para análise eficiente de arquivos CSV no navegador.
* **Tailwind CSS:** Framework CSS utilitário para estilização rápida e responsiva.

## Pré-requisitos

* **Node.js:** Certifique-se de ter o Node.js instalado em sua máquina (versão 16 ou superior recomendada).
* **npm ou Yarn:** Gerenciador de pacotes para instalar as dependências do projeto.

## Como Executar o Projeto

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_SEU_REPOSITORIO>
    cd banestesApply
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    # ou
    yarn install
    ```

3.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm start
    # ou
    yarn start
    ```

    Isso iniciará a aplicação em modo de desenvolvimento e você poderá acessá-la no seu navegador em `http://localhost:3000`.

## Estrutura de Pastas

BANESTES-APPLY/
├── node_modules/             # Diretório que contém as dependências do projeto (bibliotecas e pacotes instalados via npm ou yarn).
├── public/                   # Diretório para arquivos estáticos que serão servidos diretamente pelo servidor web (ex: favicon).
│   └── favicon.ico           # Ícone da aba do navegador para a aplicação.
├── src/                      # Diretório principal do código-fonte da aplicação.
│   ├── assets/                 # Diretório para recursos estáticos como imagens, fontes, etc.
│   │   └── styles/             # Subdiretório para arquivos de estilo.
│   │       └── tailwind.css    # Arquivo CSS principal para as configurações do Tailwind CSS.
│   ├── components/             # Diretório para componentes React reutilizáveis.
│   │   ├── Footer.tsx          # Componente React para o rodapé da aplicação. (Extensão .tsx indica que é um componente TypeScript).
│   │   └── Header.tsx          # Componente React para o cabeçalho da aplicação.
│   ├── pages/                # Diretório para componentes React que representam as diferentes páginas da aplicação.
│   │   ├── ClienteDetalhes.tsx # Componente React para exibir os detalhes de um cliente específico.
│   │   └── Home.tsx            # Componente React para a página inicial, provavelmente listando os clientes.
│   ├── services/             # Diretório para serviços, geralmente contendo lógica para buscar dados de APIs ou outras fontes.
│   │   └── api.ts              # Arquivo TypeScript contendo as funções para interagir com a fonte de dados (neste caso, Google Sheets via PapaParse).
│   ├── types/                # Diretório para definições de tipo em TypeScript.
│   │   └── index.ts            # Arquivo TypeScript que provavelmente define as interfaces para os dados da aplicação (Cliente, Conta, Agencia).
│   ├── App.tsx                 # Componente React principal que configura a estrutura da aplicação e o roteamento.
│   ├── main.tsx                # Ponto de entrada principal para a renderização da aplicação React no DOM (geralmente usa ReactDOM.render ou similar).
│   └── vite-env.d.ts           # Arquivo de definição de tipo para variáveis de ambiente específicas do Vite.
├── .gitignore                # Arquivo que especifica os arquivos e diretórios que o Git deve ignorar.
├── .eslintrc.js              # Arquivo de configuração para o ESLint, uma ferramenta de linting para JavaScript e TypeScript.
├── index.html                # Arquivo HTML principal que serve como ponto de entrada para a aplicação web.
├── package-lock.json           # Arquivo gerado pelo npm, contendo informações detalhadas sobre as versões exatas das dependências utilizadas.
├── package.json              # Arquivo que contém metadados sobre o projeto, incluindo scripts de build, dependências, etc.
├── README.md                 # Arquivo Markdown contendo a documentação do projeto (descrição, como executar, etc.).
├── tsconfig.app.json         # Arquivo de configuração específico para a compilação do código da aplicação TypeScript.
├── tsconfig.json             # Arquivo de configuração base para o compilador TypeScript, definindo as opções de compilação.
├── tsconfig.node.json        # Arquivo de configuração específico para a compilação de código TypeScript que roda no Node.js (se houver).
└── vite.config.ts            # Arquivo de configuração para o Vite, o bundler e servidor de desenvolvimento utilizado no projeto.


## Demonstração

![Preview](https://imgur.com/a/jVfqZsL)

![Preview](https://imgur.com/a/EZxw997)