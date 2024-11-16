sudo docker stop mariadbprod && sudo docker rm mariadbprod && sudo docker run -p 3306:3306 -d --name mariadbprod \
 -e MYSQL_DATABASE=bashrentaldbprodbbd \
 -e MARIADB_ROOT_PASSWORD=smDaWnYvnssJqmn2L1OY7KZlRJfgdWu7lsp8P6af0hM= mariadb
mysql -h 172.17.0.2 -P 3306 -u root -p < database/sql/bashrentaldb.create.4.0.sql && \
mysql -h 172.17.0.2 -P 3306 -u root -p < database/sql/bashrentaldb.insert.4.0.sql