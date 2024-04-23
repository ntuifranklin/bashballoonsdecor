FROM node:20.7.0
RUN adduser franklin
RUN usermod -aG www-data,root franklin
ARG WEBDIR="/var/www/html/tools"
ARG TESTDIR="$WEBDIR/testbbd"
ARG PRODDIR="$WEBDIR/prodbbd"
RUN mkdir -p $TESTDIR
RUN mkdir -p $PRODDIR
WORKDIR $TESTDIR
RUN chown -R franklin:www-data "$WEBDIR"
COPY ./ "$TESTDIR/"
EXPOSE 5555/tcp  8819/tcp
RUN npm cache clean --force
RUN npm rm -fr node_modules
RUN npm install .
RUN npm run test
