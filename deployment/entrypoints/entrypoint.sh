# Intialize mysql
service mysql start
mysql < /entrypoints/init.sql

# Start express
cd /cs340-proj/app
npm run dev
