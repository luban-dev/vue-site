FROM node:20

# npm
# cache npm install
VOLUME /npm-cache
RUN npm install pm2 -g
RUN npm config -g set cache /npm-cache
RUN npm config -g set registry https://registry.npm.taobao.org

# WORKDIR
WORKDIR /app/
ENV PATH="/app/node_modules/.bin:$PATH"

# ARG
ARG NODE_ENV=production
ARG VITE_API_BASE_URL

# ENV
ENV NODE_ENV=${NODE_ENV}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# copy files
COPY ./ .
COPY ./package.json package.json
COPY ./package-lock.json package-lock.json

# build
RUN npm -v
RUN npm install --production=false
RUN npm run build


# nginx
FROM nginx:1.23.2

WORKDIR /app/

COPY --from=0 /app/dist ./
COPY --from=0 /app/nginx ./nginx/

RUN cp ./nginx/nginx.conf /etc/nginx/nginx.conf
RUN cp ./nginx/server.conf /etc/nginx/conf.d/server.conf

RUN ln -sf /dev/stdout /var/log/nginx/access.log && ln -sf /dev/stderr /var/log/nginx/error.log

CMD ["nginx", "-g", "daemon off;"]