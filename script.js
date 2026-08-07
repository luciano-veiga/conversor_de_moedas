// Conversor de Moedas — cotação em tempo real via AwesomeAPI (economia.awesomeapi.com.br)
// API pública, gratuita, sem necessidade de chave de acesso.

const form = document.getElementById("converter-form");
const valorInput = document.getElementById("valor");
const moedaSelect = document.getElementById("moeda-destino");
const resultadoDiv = document.getElementById("resultado");
const statusDiv = document.getElementById("status");

// Cache simples para evitar chamadas repetidas à API no mesmo par de moedas
const cache = {};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

async function buscarCotacao(moedaDestino) {
  const par = `BRL-${moedaDestino}`;
  const agora = Date.now();

  if (cache[par] && agora - cache[par].timestamp < CACHE_TTL_MS) {
    return cache[par].valor;
  }

  const url = `https://economia.awesomeapi.com.br/json/last/${par}`;
  const resposta = await fetch(url);

  if (!resposta.ok) {
    throw new Error(`Erro ao consultar cotação (HTTP ${resposta.status})`);
  }

  const dados = await resposta.json();
  const chave = `${par.replace("-", "")}`;

  if (!dados[chave]) {
    throw new Error("Cotação não encontrada para o par selecionado.");
  }

  // A AwesomeAPI retorna a cotação de 1 unidade da moeda de destino em BRL (ex: 1 USD = X BRL).
  // Para converter de BRL para a moeda de destino, invertemos o valor.
  const cotacaoMoedaEmBRL = parseFloat(dados[chave].bid);
  const valorBRLparaMoeda = 1 / cotacaoMoedaEmBRL;

  cache[par] = { valor: { taxa: valorBRLparaMoeda, cotacaoBase: cotacaoMoedaEmBRL }, timestamp: agora };
  return cache[par].valor;
}

function formatarMoeda(valor, moeda) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: moeda,
  }).format(valor);
}

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const valorBRL = parseFloat(valorInput.value);
  const moedaDestino = moedaSelect.value;

  if (isNaN(valorBRL) || valorBRL <= 0) {
    statusDiv.textContent = "Informe um valor válido maior que zero.";
    statusDiv.className = "status erro";
    resultadoDiv.textContent = "";
    return;
  }

  statusDiv.textContent = "Consultando cotação...";
  statusDiv.className = "status carregando";
  resultadoDiv.textContent = "";

  try {
    const { taxa, cotacaoBase } = await buscarCotacao(moedaDestino);
    const valorConvertido = valorBRL * taxa;

    resultadoDiv.textContent = `${formatarMoeda(valorBRL, "BRL")} = ${formatarMoeda(valorConvertido, moedaDestino)}`;
    statusDiv.textContent = `Cotação atual: 1 ${moedaDestino} = ${formatarMoeda(cotacaoBase, "BRL")}`;
    statusDiv.className = "status sucesso";
  } catch (erro) {
    statusDiv.textContent = `Não foi possível obter a cotação agora. (${erro.message})`;
    statusDiv.className = "status erro";
  }
});
