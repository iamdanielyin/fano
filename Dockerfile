FROM nginx:stable-alpine

WORKDIR /usr/share/nginx/html
COPY ./docs /usr/share/nginx/html/

EXPOSE 80
CMD [ "nginx", "-g", "daemon off;" ]