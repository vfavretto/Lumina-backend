import mongoose from 'mongoose';
import { Empresa } from '../../src/models/enterpriseModel'; // ajuste o caminho conforme necessário

describe('Empresa Model Test', () => {
  beforeEach(async () => {
    await Empresa.deleteMany({}); // Limpa o banco antes de cada teste
  });

  // Teste de criação básica de empresa
  it('deve criar e salvar uma empresa com sucesso', async () => {
    const validEmpresa = {
      auth: {
        nomeEmpresa: 'Empresa Teste',
        email: 'teste@empresa.com',
        password: 'senha123'
      },
      tipoEmpresa: ['Tecnologia'],
      servicos: []
    };

    const empresa = new Empresa(validEmpresa);
    const savedEmpresa = await empresa.save();

    expect(savedEmpresa._id).toBeDefined();
    expect(savedEmpresa.auth.nomeEmpresa).toBe(validEmpresa.auth.nomeEmpresa);
    expect(savedEmpresa.auth.email).toBe(validEmpresa.auth.email);
  });

  // Teste de validação de campos obrigatórios
  it('deve falhar ao criar empresa sem campos obrigatórios', async () => {
    const empresaSemCamposObrigatorios = new Empresa({
      tipoEmpresa: ['Tecnologia']
    });

    await expect(empresaSemCamposObrigatorios.save()).rejects.toThrow(
      mongoose.Error.ValidationError
    );
  });

  // Teste de unicidade de email
  it('deve falhar ao criar empresa com email duplicado', async () => {
    const empresaData = {
      auth: {
        nomeEmpresa: 'Empresa Teste',
        email: 'teste@empresa.com',
        password: 'senha123'
      },
      tipoEmpresa: ['Tecnologia'],
      servicos: []
    };

    await new Empresa(empresaData).save();
    
    const empresaDuplicada = new Empresa(empresaData);
    await expect(empresaDuplicada.save()).rejects.toHaveProperty('code', 11000);
  });

  // Teste de atualização de empresa
  it('deve atualizar dados da empresa corretamente', async () => {
    const empresa = await new Empresa({
      auth: {
        nomeEmpresa: 'Empresa Teste',
        email: 'teste@empresa.com',
        password: 'senha123'
      },
      tipoEmpresa: ['Tecnologia'],
      servicos: []
    }).save();

    const novoTelefone = '11999999999';
    empresa.telefoneEmpresa = novoTelefone;
    const empresaAtualizada = await empresa.save();

    expect(empresaAtualizada.telefoneEmpresa).toBe(novoTelefone);
  });

  // Teste de endereço completo
  it('deve salvar empresa com endereço completo', async () => {
    const empresaComEndereco = {
      auth: {
        nomeEmpresa: 'Empresa Teste',
        email: 'teste@empresa.com',
        password: 'senha123'
      },
      tipoEmpresa: ['Tecnologia'],
      servicos: [],
      endereco: {
        cidade: 'São Paulo',
        UF: 'SP',
        CEP: '01234-567',
        logradouro: 'Rua Teste',
        numero: '123',
        bairro: 'Centro',
        complemento: 'Sala 1'
      }
    };

    const empresa = new Empresa(empresaComEndereco);
    const savedEmpresa = await empresa.save();

    expect(savedEmpresa.endereco).toBeDefined();
    expect(savedEmpresa.endereco?.cidade).toBe(empresaComEndereco.endereco.cidade);
    expect(savedEmpresa.endereco?.CEP).toBe(empresaComEndereco.endereco.CEP);
  });

  // Teste de coordenadas geográficas
  it('deve salvar empresa com localização geográfica', async () => {
    const empresaComLocal = {
      auth: {
        nomeEmpresa: 'Empresa Teste',
        email: 'teste@empresa.com',
        password: 'senha123'
      },
      tipoEmpresa: ['Tecnologia'],
      servicos: [],
      local: {
        type: 'Point',
        coordinates: [-23.550520, -46.633308]
      }
    };

    const empresa = new Empresa(empresaComLocal);
    const savedEmpresa = await empresa.save();

    expect(savedEmpresa.local).toBeDefined();
    expect(savedEmpresa.local?.type).toBe('Point');
    expect(savedEmpresa.local?.coordinates).toHaveLength(2);
    expect(savedEmpresa.local?.coordinates).toEqual(empresaComLocal.local.coordinates);
  });

  // Teste de campos opcionais indefinidos
  it('deve lidar corretamente com campos opcionais indefinidos', async () => {
    const empresaBasica = {
      auth: {
        nomeEmpresa: 'Empresa Teste',
        email: 'teste@empresa.com',
        password: 'senha123'
      },
      tipoEmpresa: ['Tecnologia'],
      servicos: []
    };

    const empresa = new Empresa(empresaBasica);
    const savedEmpresa = await empresa.save();

    expect(savedEmpresa.endereco).toBeUndefined();
    expect(savedEmpresa.local).toBeUndefined();
    expect(savedEmpresa.telefoneEmpresa).toBeUndefined();
    expect(savedEmpresa.emailEmpresa).toBeUndefined();
    expect(savedEmpresa.siteEmpresa).toBeUndefined();
  });
});