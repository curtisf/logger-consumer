FROM node:current

ARG buildno
ARG commitsha

LABEL maintainer="Curtis Fowler <caf203@gmail.com>"

# Don't run as root (safety)
RUN useradd -m -d /home/testuser -s /bin/bash testuser
RUN mkdir /opt/testuser && chown testuser /opt/testuser -R
# Copy files and install modules
COPY . /opt/testuser
WORKDIR /opt/testuser
RUN npm ci --production
CMD ["node", "index.js"]