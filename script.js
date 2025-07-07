async function converter() {
  const valor = parseFloat(document.getElementById("valor").value);
  const moeda = document.getElementById("moeda").value;
  const resultado = document.getElementById("resultado");

  const cotacoes = {
    USD: 5.2,
    EUR: 6.1
  };

  if (!valor || valor <= 0) {
    resultado.textContent = "Por favor, insira um valor válido.";
    return;
  }

  const convertido = (valor / cotacoes[moeda]).toFixed(2);
  resultado.textContent = `R$ ${valor} equivale a ${moeda} ${convertido}`;
}
