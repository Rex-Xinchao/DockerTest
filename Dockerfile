FROM nginx:1.17.9-alpine

COPY web /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 8089

CMD ["nginx", "-g", "daemon off;"]
