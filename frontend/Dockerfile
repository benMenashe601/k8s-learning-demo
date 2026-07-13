FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html styles.css app.js env.template.js /usr/share/nginx/html/
COPY 40-create-env.sh /docker-entrypoint.d/40-create-env.sh

RUN chmod +x /docker-entrypoint.d/40-create-env.sh

EXPOSE 80
