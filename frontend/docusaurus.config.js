// @ts-check
// `@type` JSDoc annotations allow IDEs and type-checking tools to autocomplete and validate
// This file is loaded by the Docusaurus CLI when running the site

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Physical AI & Humanoid Robotics Textbook',
  tagline: 'A Comprehensive Guide to Teaching Physical AI & Humanoid Robotics Course',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://muhammadammarsiddiqui.github.io',
  // Set the /<base>/ pathname under which your site is served
  baseUrl: '/AI-Driven-Development/',

  // GitHub pages deployment config.
  organizationName: 'your-username', // Usually your GitHub org/user name.
  projectName: 'AI-Book', // Usually your repo name.

  onBrokenLinks: 'ignore',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/your-username/your-project/tree/main/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  plugins: [
    // 1. Plugin to handle URL redirects
    [
      '@docusaurus/plugin-client-redirects',
      {
        /**
         * @param {string} existingPath
         */
        createRedirects: function (existingPath) {
          // Returning an empty array tells Docusaurus no redirects are needed for this path
          // This fixes the "existingPath" type error and the undefined error.
          return [];
        },
      },
    ],
    // 2. Custom plugin to inject the RAG Chatbot globally
    async function ragChatbotPlugin(context, options) {
      return {
        name: 'rag-chatbot-plugin',
        getClientModules() {
          return [require.resolve('./src/components/RAGChatbot/RAGChatbotWrapper.js')];
        },
        injectHtmlTags() {
          return {
            postBodyTags: [
              `<div id="rag-chatbot-root"></div>`,
            ],
          };
        },
      };
    },
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'Physical AI & Robotics',
        logo: {
          alt: 'My Site Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Textbook',
          },        
          {
            href: 'https://github.com/your-username/your-project',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Textbook',
                to: '/docs/intro',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/docusaurus',
              },
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/docusaurus',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/docusaurus',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/facebook/docusaurus',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Physical AI & Humanoid Robotics Textbook. Built with Docusaurus.`,
      },
      prism: {
        theme: require('prism-react-renderer').themes.github,
        darkTheme: require('prism-react-renderer').themes.dracula,
      },
    }),
};

module.exports = config;