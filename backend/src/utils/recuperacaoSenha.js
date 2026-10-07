export function gerarCodigoRecuperacao() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function validarCodigoRecuperacao(registro, codigoInformado) {
  if (!registro || !codigoInformado) {
    return false;
  }

  const codigoNormalizado = String(codigoInformado).trim();

  if (!/^\d{6}$/.test(codigoNormalizado)) {
    return false;
  }

  if (registro.codigo !== codigoNormalizado) {
    return false;
  }

  if (!registro.expiraEm) {
    return false;
  }

  return new Date() <= new Date(registro.expiraEm);
}
