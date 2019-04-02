service mysql start
#mysql -u root -p
mysql < /entrypoints/init.sql

cd /cs340-proj/app
npm run dev
