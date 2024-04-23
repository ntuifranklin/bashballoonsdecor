FROM alpine:3.18
ENV NODE_VERSION 20.7.0
ARG WEBROOT="/var/www/html/tools"
ARG TESTDIR="$WEBROOT/testbbd"
ARG PRODDIR="$WEBROOT/prodbbd"
USER node
RUN mkdir -p "$TESTDIR"
RUN mkdir -p "PRODDIR"
RUN chown -R node:node $WEBROOT
COPY --chown=node:node  . "$TESTDIR"
COPY --chown=node:node  . "$PRODDIR"
WORKDIR $TESTDIR
RUN npm install .
EXPOSE 5555/tcp
EXPOSE 8819/tcp
CMD ["npm","run","test"]

