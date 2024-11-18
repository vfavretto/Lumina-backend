// scripts/copy-swagger.js
const ncp = require('ncp').ncp;
const path = require('path');

// Copia o arquivo swagger-output.json para o diretório dist/
ncp(path.join(__dirname, '../src/config/swagger-output.json'), path.join(__dirname, '../dist/config/swagger-output.json'), (err) => {
  if (err) {
    console.error('Erro ao copiar o swagger-output.json', err);
  } else {
    console.log('swagger-output.json copiado com sucesso para o diretório dist/');
  }
});
