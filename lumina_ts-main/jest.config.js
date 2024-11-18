/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  coverageDirectory: "coverage", // diretorio dos relatorios de coverege
  coverageReporters: ["html", "text", "lcov", "json"], //formatos de exportação dos relatorios
  collectCoverageFrom: ["src/**/*.{ts, js}", "!src/**/*.d.ts"], // regras para inclusão/exclusão de scripts no calculo de coverrage
  coverageThreshold: {
    global: {
      statements: 81.5, // quantidade de linhas de código que devem ser executadas
      branches: 80, // quantidade de branches de código que devem ser executadas
      functions: 82, // quantidade de funções que devem ser executadas
      lines: 87, // quantidade de linhas de código que devem ser executadas
    },
  },
};
