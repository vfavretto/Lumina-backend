/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  moduleDirectories: ['node_modules', 'src'],
  preset: 'ts-jest', // Configuração para usar o ts-jest
  testEnvironment: 'node', // Define o ambiente de teste como Node.js
  testMatch: ['**/tests/**/*.test.ts'], // Define onde os arquivos de teste estão localizados
  moduleFileExtensions: ['ts', 'js'], // Permite importar arquivos TypeScript e JavaScript
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      // Configurações do ts-jest aqui
    }],
  },
  collectCoverage: true, // Ativa a coleta de cobertura de código
  collectCoverageFrom: [
    'src/**/*.ts', // Inclui arquivos TypeScript da pasta src
    '!src/**/*.d.ts', // Exclui arquivos de definição de tipos
    '!src/**/index.ts', // Exclui arquivos index
  ],
  coverageDirectory: 'coverage', // Pasta onde será gerada a cobertura
  coverageReporters: ['text', 'lcov'], // Formatos dos relatórios de cobertura
  testTimeout: 30000, // Timeout para testes, útil para operações assíncronas
};
