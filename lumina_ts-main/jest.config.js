/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  moduleDirectories: ['node_modules', 'src'],
  preset: 'ts-jest', // Configuração para usar o ts-jest
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'], // Define onde os arquivos de teste estão localizados
  moduleFileExtensions: ['ts', 'js', "json", "node"], // Permite importar arquivos TypeScript e JavaScript
  setupFilesAfterEnv: ['./jest.setup.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      // json.config???
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
