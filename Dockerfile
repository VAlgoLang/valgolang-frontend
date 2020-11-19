FROM node

COPY . /web/
WORKDIR /web

RUN npm install -g serve
RUN npm install

RUN npm run build

ENTRYPOINT ["serve","-s", "build", "-l", "3000"]
