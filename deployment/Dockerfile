FROM debian:stretch

RUN apt-get update && apt-get install -y curl

# Install Node.js
RUN curl -sL https://deb.nodesource.com/setup_11.x | bash -
RUN apt-get update && apt-get install -y nodejs npm sudo mysql-server

# Configure MySQL
#RUN pg_createcluster 11 main

# Copy entrypoints
COPY deployment/entrypoints /entrypoints
CMD ["bash", "-C", "/entrypoints/entrypoint.sh"]

# Copy node project files
COPY app /cs340-proj/app

WORKDIR /cs340-proj
