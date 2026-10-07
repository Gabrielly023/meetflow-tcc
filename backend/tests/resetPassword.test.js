import test from 'node:test';
import assert from 'node:assert/strict';
import { gerarCodigoRecuperacao, validarCodigoRecuperacao } from '../src/utils/recuperacaoSenha.js';

test('gera código de 6 dígitos válido', () => {
  const codigo = gerarCodigoRecuperacao();
  assert.match(codigo, /^\d{6}$/);
});

test('valida código dentro do prazo e com o valor esperado', () => {
  const agora = Date.now();
  const codigo = '123456';
  const registro = {
    codigo,
    expiraEm: agora + 10 * 60 * 1000,
  };

  assert.equal(validarCodigoRecuperacao(registro, codigo), true);
  assert.equal(validarCodigoRecuperacao(registro, '654321'), false);
});
