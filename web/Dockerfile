FROM node:18-alpine AS build
WORKDIR /app

ARG REACT_APP_API_URL=
ARG REACT_APP_VEILSTREAM_AUTH_ROUTER_URL=
ARG REACT_APP_OAUTH_CALLBACK_PATH=/auth/callback

ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_VEILSTREAM_AUTH_ROUTER_URL=$REACT_APP_VEILSTREAM_AUTH_ROUTER_URL
ENV REACT_APP_OAUTH_CALLBACK_PATH=$REACT_APP_OAUTH_CALLBACK_PATH

COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
