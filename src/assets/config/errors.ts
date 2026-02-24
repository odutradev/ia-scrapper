interface ResponseError {
  statusCode: 100 | 101 | 102 | 200 | 201 | 202 | 204 | 301 | 302 | 304 | 400 | 401 | 403 | 404 | 409 | 429 | 500 | 501 | 502 | 503;
  message: string;
};

export type ResponseErrorsParams = 
  | "no_execution_permission"
  | "control_access_denied"
  | "no_credentials_sent" 
  | "invalid_credentials" 
  | "token_is_not_valid" 
  | "object_not_found"
  | "internal_error" 
  | "invalid_params" 
  | "access_denied"
  | "invalid_data"
  | "no_data_sent" 
  | "no_token";
  
export const ResponseErrors: Record<ResponseErrorsParams, ResponseError> = {
  no_execution_permission: {
    message: "Permissão negada para execução",
    statusCode: 403,
  },
  internal_error: {
    message: "Erro no servidor",
    statusCode: 500,
  },
  no_credentials_sent: {
    message: "Nenhuma credencial enviada",
    statusCode: 401,
  },
  no_data_sent: {
    message: "Nenhum dado enviado",
    statusCode: 400,
  },
  invalid_credentials: {
    message: "Credenciais inválidas",
    statusCode: 401,
  },
  no_token: {
    message: "Token ausente, autorização negada",
    statusCode: 400,
  },
  token_is_not_valid: {
    message: "Token inválido",
    statusCode: 401,
  },
  access_denied: {
    message: "Acesso negado",
    statusCode: 401,
  },
  object_not_found: {
    message: "Objeto não encontrado",
    statusCode: 404,
  },
  control_access_denied: {
    message: "Acesso negado, sem token de segurança",
    statusCode: 401,
  },
  invalid_params: {
    message: "Parâmetros inválidos enviados",
    statusCode: 400,
  },
  invalid_data: {
    message: "Dados inválidos enviados",
    statusCode: 400,
  }
};