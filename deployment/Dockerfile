FROM debian:stretch

# Install Node.js and MySQL
RUN apt-get update && apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_11.x | bash -
RUN apt-get update && apt-get install -y nodejs npm sudo mysql-server

# Copy entrypoints
COPY deployment/entrypoints /entrypoints
COPY ddl/ddl.sql /entrypoints
CMD ["bash", "-C", "/entrypoints/entrypoint.sh"]

# Copy node project files
COPY app /cs340-proj/app
WORKDIR /cs340-proj/app
RUN npm install


EXPOSE 80
