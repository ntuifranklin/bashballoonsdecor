 sudo docker run -p 3306:3306 -d --name mariadbprod \
 -e MYSQL_DATABASE=bashrentaldbprodbbd \
 -e MARIADB_ROOT_PASSWORD=saY7rO2xvMyB/fneW57Fv7svT6Amn0jzmNdGZCcaNUw= mariadb
mysql -h 172.17.0.2 -P 3306 -u root -p < database/sql/bashrentaldb.create.4.0.sql
mysql -h 172.17.0.2 -P 3306 -u root -p < database/sql/bashrentaldb.insert.4.0.sql