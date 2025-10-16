// Modelo para dados retornados pela API de consulta de placas
export interface PlateConsultationResponse {
  MARCA: string;
  MODELO: string;
  SUBMODELO: string;
  VERSAO: string;
  ano: string;
  anoModelo: string;
  chassi: string;
  codigoSituacao: string;
  cor: string;
  data: string;
  extra: PlateExtraInfo;
  fipe: PlateFipeInfo;
  listamodelo: string[];
  logo: string;
  marca: string;
  marcaModelo: string;
  mensagemRetorno: string;
  modelo: string;
  municipio: string;
  origem: string;
  placa: string;
  placa_alternativa: string;
  segmento: string;
  situacao: string;
  sub_segmento: string;
  submodelo: string;
  uf: string;
  versao: string;
}

export interface PlateExtraInfo {
  ano_fabricacao: string;
  ano_modelo: string;
  caixa_cambio: string;
  cap_maxima_tracao: string;
  carroceria: string;
  chassi: string;
  cilindradas: string;
  combustivel: string;
  di: string;
  eixo_traseiro_dif: string;
  eixos: string;
  especie: string;
  faturado: string;
  grupo: string;
  limite_restricao_trib: string;
  linha: string;
  media_preco: string;
  modelo: string;
  motor: string;
  municipio: string;
  nacionalidade: string;
  peso_bruto_total: string;
  placa: string;
  placa_modelo_antigo: string;
  placa_modelo_novo: string;
  quantidade_passageiro: string;
  registro_di: string;
  renavam: string;
  restricao_1: string;
  restricao_2: string;
  restricao_3: string;
  restricao_4: string;
  s_especie: string;
  segmento: string;
  situacao_chassi: string;
  situacao_veiculo: string;
  sub_segmento: string;
  terceiro_eixo: string;
  tipo_carroceria: string;
  tipo_doc_faturado: string;
  tipo_doc_importadora: string;
  tipo_doc_prop: string;
  tipo_montagem: string;
  tipo_veiculo: string;
  uf: string;
  uf_faturado: string;
  uf_placa: string;
  unidade_local_srf: string;
}

export interface PlateFipeInfo {
  dados: PlateFipeData[];
}

export interface PlateFipeData {
  ano_modelo: string;
  codigo_fipe: string;
  codigo_marca: number;
  codigo_modelo: string;
  combustivel: string;
  id_valor: number;
  mes_referencia: string;
  referencia_fipe: number;
  score: number;
  sigla_combustivel: string;
  texto_marca: string;
  texto_modelo: string;
  texto_valor: string;
  tipo_modelo: number;
}
