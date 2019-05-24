# Intialize mysql
service mysql start
mysql < /entrypoints/init.sql

# DDL (create tables / sample data)
mysql main < /entrypoints/ddl.sql

# Start express
cd /cs340-proj/app
npm run dev
