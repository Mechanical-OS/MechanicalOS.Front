# --- STAGE 1: BUILD (Compilação) ---
# Usa uma imagem base que contém o Node.js e o NPM para compilar o código
FROM node:20.10-alpine AS builder

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de definição de dependências e instala
COPY package.json package-lock.json ./
RUN npm install

# Copia todo o código-fonte
COPY . .

# Altera a base HREF (opcional, dependendo de como você configura suas rotas)
# RUN npm run build -- --base-href /

# Executa o build de produção do Angular
# O output (HTML, CSS, JS) vai para a pasta 'dist/nome-do-seu-projeto'
RUN npm run build

# --- STAGE 2: RUNTIME (Serviço/Produção) ---
# Usa uma imagem leve do Nginx para servir o conteúdo estático
FROM nginx:alpine

# Remove o arquivo de configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia a nossa configuração customizada do Nginx
COPY ./nginx-custom.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos estáticos compilados da Stage 1 (builder) para o diretório do Nginx
# OBS: O caminho de origem (dist/nome-do-seu-projeto) deve ser ajustado para o nome real da pasta gerada pelo seu 'npm run build'
COPY --from=builder /app/dist/MechanicalOs-Angular /usr/share/nginx/html

# A porta padrão do Nginx é 80, que é a que mapeamos no Nginx do Host
EXPOSE 80

# O comando padrão do Nginx já inicia o servidor
CMD ["nginx", "-g", "daemon off;"]