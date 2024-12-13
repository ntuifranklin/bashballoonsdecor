# Bash Balloons Decor Rentals & LLC
Bash Balloons Decor an ecommerce project for 
[Bash Balloons Decor Rentals Website](https://bashballoonsrentals.com).  
This guide provides detailed instructions for deploying the BashBalloons application on a remote Ubuntu server using NGINX as the web server and PM2 as the process manager. The documentation is divided into two main sections: installation and configuration, and testing of the deployed application.

# Deployment Guide on a Ubuntu Server with Nginx and PM2
## Requirements
Requires a linux server that has at least 8 GB of memory, and 2 cpu cores totalling at least 3.2 Giga Hertz of speed.
## Installation Instructions
Navigate to the web location in the `www` folder. A shortcut from that location to the home directory of the current logged in user with sudo privileges was set.  
For the rest we assume it is in `~/www`.   

### Update the system.  
```{sh}
sudo apt update -y
```
---  

### Make sur git is installed
```{sh}
sudo apt install git -y
```
---  

### Clone the web app into the `~/www` location
```{sh}
git clone <url_to_git_repo>
```

### Install `node, npm, docker.io, nginx, mysql-client`, then start and enable docker
```{sh}
sudo apt install node npm docker.io nginx mysql-client
```
---- 

### Start and enable docker.  
```{sh}
sudo systemctl start docker
sudo systemctl enable docker
```

### Install Redis: check [here](https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/install-redis-on-linux/) for an updated installation instructions
```{sh}
sudo apt-get install lsb-release curl gpg
curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
sudo chmod 644 /usr/share/keyrings/redis-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list
sudo apt-get update
sudo apt-get install redis
```
----  

### Redis should start automatically, and it should restart at boot time.  
If not run the following:

```{sh}
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

### Setting up the database
The database used is a mariadb server in a docker container.

#### Launch the database server 
```{sh}
sudo docker run -p 3306:3306 -d --name mariadbprod \
 -e MYSQL_DATABASE=$MARIA_DB_DATABASE_NAME \
 -e MARIADB_ROOT_PASSWORD=$MARIA_DB_ROOT_PASSWORD mariadb
```
Don't forget to replace the environment variables above with their actual values set in secrets.  
----  

Make sure mariadb server is attached to IP `172.17.0.2`.
`docker inspect <mariadb_container_name>` should return some json
```{sh}
docker inspect <mariadb_container_name>
```
returns 

```{json}
[
    {
        "Id": "68c29b06185cce3ac5276ec3afef32c02df69eff2470065c30f0c701577cb830",
        "Created": "2024-11-10T13:14:11.964944142Z",
        "Path": "docker-entrypoint.sh",
        "Args": [
            "mariadbd"
        ],
        "State": {
            "Status": "running",
            "Running": true,
            "Paused": false,
            "Restarting": false,
            "OOMKilled": false,
            "Dead": false,
            "Pid": 2771,
            "ExitCode": 0,
            "Error": "",
            "StartedAt": "2024-11-10T13:14:12.482960848Z",
            "FinishedAt": "0001-01-01T00:00:00Z"
        },
        "Image": "sha256:4b8711c6c639fa9166e6a617c421e2fc43296c8add9a846fe8237b8ac9184d51",
        "ResolvConfPath": "/var/lib/docker/containers/68c29b06185cce3ac5276ec3afef32c02df69eff2470065c30f0c701577cb830/resolv.conf",
        "HostnamePath": "/var/lib/docker/containers/68c29b06185cce3ac5276ec3afef32c02df69eff2470065c30f0c701577cb830/hostname",
        "HostsPath": "/var/lib/docker/containers/68c29b06185cce3ac5276ec3afef32c02df69eff2470065c30f0c701577cb830/hosts",
        "LogPath": "/var/lib/docker/containers/68c29b06185cce3ac5276ec3afef32c02df69eff2470065c30f0c701577cb830/68c29b06185cce3ac5276ec3afef32c02df69eff2470065c30f0c701577cb830-json.log",
        "Name": "/mariadbprod",
        "RestartCount": 0,
        "Driver": "overlay2",
        "Platform": "linux",
        "MountLabel": "",
        "ProcessLabel": "",
        "AppArmorProfile": "docker-default",
        "ExecIDs": null,
        "HostConfig": {
            "Binds": null,
            "ContainerIDFile": "",
            "LogConfig": {
                "Type": "json-file",
                "Config": {}
            },
            "NetworkMode": "default",
            "PortBindings": {
                "3306/tcp": [
                    {
                        "HostIp": "",
                        "HostPort": "3306"
                    }
                ]
            },
            "RestartPolicy": {
                "Name": "no",
                "MaximumRetryCount": 0
            },
            "AutoRemove": false,
            "VolumeDriver": "",
            "VolumesFrom": null,
            "ConsoleSize": [
                31,
                124
            ],
            "CapAdd": null,
            "CapDrop": null,
            "CgroupnsMode": "private",
            "Dns": [],
            "DnsOptions": [],
            "DnsSearch": [],
            "ExtraHosts": null,
            "GroupAdd": null,
            "IpcMode": "private",
            "Cgroup": "",
            "Links": null,
            "OomScoreAdj": 0,
            "PidMode": "",
            "Privileged": false,
            "PublishAllPorts": false,
            "ReadonlyRootfs": false,
            "SecurityOpt": null,
            "UTSMode": "",
            "UsernsMode": "",
            "ShmSize": 67108864,
            "Runtime": "runc",
            "Isolation": "",
            "CpuShares": 0,
            "Memory": 0,
            "NanoCpus": 0,
            "CgroupParent": "",
            "BlkioWeight": 0,
            "BlkioWeightDevice": [],
            "BlkioDeviceReadBps": [],
            "BlkioDeviceWriteBps": [],
            "BlkioDeviceReadIOps": [],
            "BlkioDeviceWriteIOps": [],
            "CpuPeriod": 0,
            "CpuQuota": 0,
            "CpuRealtimePeriod": 0,
            "CpuRealtimeRuntime": 0,
            "CpusetCpus": "",
            "CpusetMems": "",
            "Devices": [],
            "DeviceCgroupRules": null,
            "DeviceRequests": null,
            "MemoryReservation": 0,
            "MemorySwap": 0,
            "MemorySwappiness": null,
            "OomKillDisable": null,
            "PidsLimit": null,
            "Ulimits": null,
            "CpuCount": 0,
            "CpuPercent": 0,
            "IOMaximumIOps": 0,
            "IOMaximumBandwidth": 0,
            "MaskedPaths": [
                "/proc/asound",
                "/proc/acpi",
                "/proc/kcore",
                "/proc/keys",
                "/proc/latency_stats",
                "/proc/timer_list",
                "/proc/timer_stats",
                "/proc/sched_debug",
                "/proc/scsi",
                "/sys/firmware",
                "/sys/devices/virtual/powercap"
            ],
            "ReadonlyPaths": [
                "/proc/bus",
                "/proc/fs",
                "/proc/irq",
                "/proc/sys",
                "/proc/sysrq-trigger"
            ]
        },
        "GraphDriver": {
            "Data": {
                "LowerDir": "/var/lib/docker/overlay2/b8ef48d157614a6b201f671ac8397633e194d6415afbb971a9d7c257f302a799-init/diff:/var/lib/docker/overlay2/fec679112bfa2ae3667da9e92d5a862c77c332883b3d4708103137afa93c132a/diff:/var/lib/docker/overlay2/f9e0b1ebfcd9f963c96b83e941762fe6a525677b55a0aa69050bb2950cd06e1f/diff:/var/lib/docker/overlay2/c1de4b0dfae4e27c35c7869955e8b3fc63ddf5cd24a745a8f3cf303b6bcdf286/diff:/var/lib/docker/overlay2/a8f682d6d0621dec28d4449bb7a409d20dfe74ab048a7b0a84953d0d2bc81300/diff:/var/lib/docker/overlay2/1eb57e32f36fa611c5e81a8d6c2233e372f90043c3374108cc72e8238de274bd/diff:/var/lib/docker/overlay2/afb977a457e7909e46f5f0f1330cfd8d2cd4a2b369f12e58ebec74b8acd410e8/diff:/var/lib/docker/overlay2/e5dfe0f1f48b4f85bc883b263f581d9e82b151efdecfb31802bbc216c3d62dc7/diff:/var/lib/docker/overlay2/dd60bba101f1418bc5b5201af8a78eba1dad4b68543b10d8b852b6f0b6b8bbca/diff",
                "MergedDir": "/var/lib/docker/overlay2/b8ef48d157614a6b201f671ac8397633e194d6415afbb971a9d7c257f302a799/merged",
                "UpperDir": "/var/lib/docker/overlay2/b8ef48d157614a6b201f671ac8397633e194d6415afbb971a9d7c257f302a799/diff",
                "WorkDir": "/var/lib/docker/overlay2/b8ef48d157614a6b201f671ac8397633e194d6415afbb971a9d7c257f302a799/work"
            },
            "Name": "overlay2"
        },
        "Mounts": [
            {
                "Type": "volume",
                "Name": "c4c9b8011cf38a57ec03eefa2f3fabb2d857c301af992854ebe5c92be4899acb",
                "Source": "/var/lib/docker/volumes/c4c9b8011cf38a57ec03eefa2f3fabb2d857c301af992854ebe5c92be4899acb/_data",
                "Destination": "/var/lib/mysql",
                "Driver": "local",
                "Mode": "",
                "RW": true,
                "Propagation": ""
            }
        ],
        "Config": {
            "Hostname": "68c29b06185c",
            "Domainname": "",
            "User": "",
            "AttachStdin": false,
            "AttachStdout": false,
            "AttachStderr": false,
            "ExposedPorts": {
                "3306/tcp": {}
            },
            "Tty": false,
            "OpenStdin": false,
            "StdinOnce": false,
            "Env": [
                "MYSQL_DATABASE=bashrentaldbprodbbd",
                "MARIADB_ROOT_PASSWORD=saY7rO2xvMyB/fneW57Fv7svT6Amn0jzmNdGZCcaNUw=",
                "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
                "GOSU_VERSION=1.17",
                "LANG=C.UTF-8",
                "MARIADB_VERSION=1:11.5.2+maria~ubu2404"
            ],
            "Cmd": [
                "mariadbd"
            ],
            "Image": "mariadb",
            "Volumes": {
                "/var/lib/mysql": {}
            },
            "WorkingDir": "",
            "Entrypoint": [
                "docker-entrypoint.sh"
            ],
            "OnBuild": null,
            "Labels": {
                "org.opencontainers.image.authors": "MariaDB Community",
                "org.opencontainers.image.base.name": "docker.io/library/ubuntu:noble",
                "org.opencontainers.image.description": "MariaDB Database for relational SQL",
                "org.opencontainers.image.documentation": "https://hub.docker.com/_/mariadb/",
                "org.opencontainers.image.licenses": "GPL-2.0",
                "org.opencontainers.image.ref.name": "ubuntu",
                "org.opencontainers.image.source": "https://github.com/MariaDB/mariadb-docker",
                "org.opencontainers.image.title": "MariaDB Database",
                "org.opencontainers.image.url": "https://github.com/MariaDB/mariadb-docker",
                "org.opencontainers.image.vendor": "MariaDB Community",
                "org.opencontainers.image.version": "11.5.2"
            }
        },
        "NetworkSettings": {
            "Bridge": "",
            "SandboxID": "6b97b9281357e518a0b9125901b2f252fd98e78f94bc6bd1002df95e00f8ad92",
            "HairpinMode": false,
            "LinkLocalIPv6Address": "",
            "LinkLocalIPv6PrefixLen": 0,
            "Ports": {
                "3306/tcp": [
                    {
                        "HostIp": "0.0.0.0",
                        "HostPort": "3306"
                    },
                    {
                        "HostIp": "::",
                        "HostPort": "3306"
                    }
                ]
            },
            "SandboxKey": "/var/run/docker/netns/6b97b9281357",
            "SecondaryIPAddresses": null,
            "SecondaryIPv6Addresses": null,
            "EndpointID": "8535c868162f40901ae8ffeacf34915c25cee247cd4289d155f63e026d081aaf",
            "Gateway": "172.17.0.1",
            "GlobalIPv6Address": "",
            "GlobalIPv6PrefixLen": 0,
            "IPAddress": "172.17.0.2",
            "IPPrefixLen": 16,
            "IPv6Gateway": "",
            "MacAddress": "02:42:ac:11:00:02",
            "Networks": {
                "bridge": {
                    "IPAMConfig": null,
                    "Links": null,
                    "Aliases": null,
                    "NetworkID": "5640d8f0c071306d2d4a9911b1b6bb2d6d00d21952bcbba251c718564f46f556",
                    "EndpointID": "8535c868162f40901ae8ffeacf34915c25cee247cd4289d155f63e026d081aaf",
                    "Gateway": "172.17.0.1",
                    "IPAddress": "172.17.0.2",
                    "IPPrefixLen": 16,
                    "IPv6Gateway": "",
                    "GlobalIPv6Address": "",
                    "GlobalIPv6PrefixLen": 0,
                    "MacAddress": "02:42:ac:11:00:02",
                    "DriverOpts": null
                }
            }
        }
    }
]

```

#### Load tables and data into the database
```{sh}
mysql -h 172.17.0.2 -P 3306 -u root -p < database/sql/bashrentaldb.create.4.0.sql
mysql -h 172.17.0.2 -P 3306 -u root -p < database/sql/bashrentaldb.insert.4.0.sql
```

#### Create the `.env` file and place all variables in there
An env file containing all the secrets is necessary.

```{sh}

export WEBROOTDIR=""
export WEBROOTDIR_UPGRADE=""
export PRODUCTION_FOLDER=""
export TEST_FOLDER=""
export NODE_ENV=""
# export PROD_BBD_LOCATION=""
export PROD_LOCATION_UPGRADE="$WEBROOTDIR_UPGRADE/$PRODUCTION_FOLDER"
export TEST_LOCATION_UPGRADE="$WEBROOTDIR_UPGRADE/$TEST_FOLDER"

export PROD_BBD_LOCATION="$PROD_LOCATION_UPGRADE"
export BBD_LOCATION=$PROD_BBD_LOCATION
export STAGE_BBD_LOCATION="$TEST_LOCATION_UPGRADE"
export TEST_BBD_LOCATION="$TEST_LOCATION_UPGRADE"

# Database data
export DATABASE_NAME=''
export DATABASE_HOST=''
export DATABASE_USER=''
export DATABASE_PASSWORD=''
export PACKAGE_TABLE_NAME=''
export PACKAGE_TABLE_KEY_FIELD_NAME=''
export INDIVIDUAL_ITEM_TABLE_NAME=''
export INDIVIDUAL_ITEM_TABLE_KEY_FIELD_NAME=''
export DATABASE_ROOT_USER=''
export DATABASE_ROOT_PASSWORD=''

# Upgraded database data
export DATABASE_UPGRADED_NAME=''
export PROD_DATABASE_UPGRADED_NAME=''
export TEST_DATABASE_UPGRADED_NAME=''
export UPGRADED_DATABASE_USER=''
export UPGRADED_DATABASE_PASSWORD=""


# Site Data
export SEO_SITE_LINK=''
export SITENAME=""
export PRODUCTION_SITE_PORT_UPGRADE=
export PRODUCTION_SITE_PORT=$PRODUCTION_SITE_PORT_UPGRADE
export TEST_SITE_PORT_UPGRADE=
export SITE_PORT="$PRODUCTION_SITE_PORT"
export TEST_SITE_PORT=$TEST_SITE_PORT_UPGRADE
export MINI_SITENAME=''
export PAGETITLE=''
export COMPANY_BUSINESS_NAME=''
export COMPANY_ADDRESS=''
export CUSTOMER_SERVICE_NUMBER=''
export CUSTOMER_SERVICE_NUMBER_EXTRA=''
export CUSTOMER_SERVICE_EMAIL=''
export CUSTOMER_BUSINESS_NUMBER=''
export CUSTOMER_BUSINESS_EMAIL=''
export MEDIUM_LINK=''
export FACEBOOK_LINK=''
export INSTAGRAM_LINK=''
export TWITTER_LINK=''
export YOUTUBE_LINK=''
export GOOGLE_MAPS_LINK=''
export GOOGLE_MAPS_FRAME_LINK=''

# Session data
export SESSION_DATABASE_PORT=''
export SESSION_DATABASE_USER=''
export SESSION_DATABASE_HOST=''
export SESSION_DATABASE_PASSWORD=''
export SESSION_DATABASE_NAME=''
export SESSION_DATABASE_TABLE_NAME=''
export SESSION_MAXIMUM_TIME_IN_MILLI_SECONDS=
export SESSION_NAME=''


# Package and Items Data
export ENV_HOME_DIR=""
export PACKAGE_AND_ITEMS_3000_FILE=""
export PACKAGE_AND_ITEMS_3800_FILE=""
export PACKAGE_AND_ITEMS_4900_FILE=""
export PACKAGES_ONLY_FILE=""
export INDIVIDUAL_ITEMS_ONLY_FILE=""
export CUSTOMERS_FEEDBACK_FILE=""
# export CUSTOMERS_FEEDBACK_UPGRADED_FILE=""
export BOOTSTRAP_CSS_FILE=""
# export BOOTSTRAP_CSS_UPGRADED_FILE=""
export BOOTSTRAP_JS_FILE=""
# export BOOTSTRAP_JS_UPGRADED_FILE=""

# google client id and client secret for sending emails
export GOOGLE_OATH_CLIENT_ID=''
export GOOGLE_OATH_CLIENT_SECRET=''
export GOOGLE_GMAIL_MAIL=''
export GOOGLE_GMAIL_PASSWORD=''
export GOOGLE_GMAIL_ACCESS_CODE=""
export GOOGLE_GMAIL_REFRESH_TOKEN=""
export GOOGLE_GMAIL_ACCESS_TOKEN=""
export GOOGLE_GMAIL_API_KEY=''
export GOOGLE_APP_SPECIFIC_PASSWORD=""


# Google reCaptcha credentials  
export GOOGLE_RECAPTCHA_SITE_KEY=""
export GOOGLE_RECAPTCHA_SECRET_KEY=""


# forward email net details
# 
export FORWARD_EMAIL_NET_EMAIL=''
export FORWARD_EMAIL_NET_PASSWORD=''
export FORWARD_EMAIL_NET_SMTP_SERVER=''
export FORWARD_EMAIL_NET_SMTP_PORT=
export FORWARD_EMAIL_NET_SMTP_SECURE_OLD_PORT=
export ADMIN_DEVELOPER_EMAIL=''
export ADMIN_USER_EMAIL=''
export ADMIN_USER_PASSWORD=''

# box.bashballoonsrentals.com email parameters
export IMAP_MAIL_SERVER=''
export IMAP_PORT=
export SMTP_MAIL_SERVER=''
export SMTP_SECURITY='TLS'
export SMTP_PORT=465
export IMAP_SECURITY='TLS'
export IMAP_USERNAME_EMAIL=''
export IMAP_PASSWORD=''
export SMTP_USERNAME_EMAIL=''
export SMTP_PASSWORD=''
export BCC_ORDER_EMAIL=''
export BCC_ORDER_EMAIL_PASSWORD=''

# email.bashballoonsrentals.com email parameters
export ASONG_BCC_ORDER_EMAIL=''
export FRANKLIN_BCC_ORDER_EMAIL=''


: << COMMENT
/* create user statement*/
CREATE USER 'user'@'dbserver' IDENTIFIED BY '';
GRANT ALL PRIVILEGES ON bashballoonsdecor_session.* TO 'user'@'dbserver';

/* create user statement  for root user on all databases */
CREATE USER 'theuser'@'theserver' IDENTIFIED BY '';
GRANT ALL PRIVILEGES ON *.* TO 'theuser'@'theserver' WITH GRANT OPTION;

/* upgraded user */
 create user 'theupgradeduser'@'theserver' IDENTIFIED BY "" ;
COMMENT



########################## Imported Vars ##################################################3

# /etc/mysql/ssl/ca-cert.pem  /etc/mysql/ssl/client-cert.pem  /etc/mysql/ssl/client-key.pem
# export CERT_LOCATION="/etc/mysql/ssl"
# export DB_SERVER_CERTFILE="${CERT_LOCATION}/ca-cert.pem"
# export DB_CLIENT_KEY="${CERT_LOCATION}/client-key.pem"
# export DB_CLIENT_CERT_FILE="${CERT_LOCATION}/client-cert.pem"
# export NODE_EXTRA_CA_CERTS="${DB_SERVER_CERTFILE}"
# export DB_SERVER_CERTFILE_CONTENT="$(cat /etc/mysql/ssl/ca-cert.pem)"
# export DB_CLIENT_KEY_CONTENT="$(cat /etc/mysql/ssl/client-key.pem)"



export PRODUCTION_ENV="PROD"
export THIS_ENV=""
export TEST_DB_NAME=""
export TEST_DB_USER=""
export TEST_DB_PASSWORD=
export TEST_EXPECTED_HOST="" # or localhost or 

export PROD_DB_NAME=""
export PROD_DB_USER=""
export PROD_DB_PASSWORD=""
export PROD_EXPECTED_HOST="" # or localhost server 
# STRIPE PAYMENTS
export BASH_BALLOONS_STRIPE_PUBLIC_KEY=
export BASH_BALLOONS_STRIPE_SECRET_KEY=

# REDIS PARAMETERS

REDIS_URI=
```

#### Install required dependencies
```{sh}
npm install .
```

#### Install pm2 globally
```{sh}
npm install pm2 -g
```

#### Start the clusters
```{sh}
pm2 start appclustering.js --name purple_cluster --watch
pm2 startup
```

Running `pm2 startup` as the last command above should return something similar to the below:  
```{sh}
# [PM2] Init System found: systemd
# [PM2] To setup the Startup Script, copy/paste the following command:
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u <current_logged_in_user> --hp /home/<current_logged_in_user>
```

Then run the specified command by just copying what your terminal has anc paste to the terminal:  
```{sh}
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u <current_logged_in_user> --hp /home/<current_logged_in_user>
```

#### Configure nginx

```{sh}
server {
    listen 80;
    server_name bashballoonsrentals.com;

    location / {
        proxy_pass http://localhost:<port_number_node_is_running on>;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Place the above at `/etc/nginx/sites-available/<whatevernameyouchoose>.<whateverextension>`.   

#### Enable SSL/TLS with `letsencrypt.org`.
Check the following for an updated installation of a fresh certificate :  
- [Instructions to Install Snap on ubuntu](https://snapcraft.io/docs/installing-snap-on-ubuntu) ( 18.04 and pwards comes with it by default).  
- [Install Certbot and voila](https://certbot.eff.org/instructions?ws=nginx&os=snap)
```{sh}
sudo apt update 
sudo apt install snapd
sudo snap install hello-world
# hello-world 6.4 from Canonical✓ installed
hello-world
# Hello World!
```

- Install certbot
```{sh}
sudo snap install --classic certbot
```

- Prepare the Certbot command
```{sh}
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```
- Either 
Get your certificates and install them
```{sh}
sudo certbot --nginx
```

- Or Just get your certificates
```{sh}
sudo certbot certonly --nginx
```

- Test automatic renewal
```{sh}
sudo certbot renew --dry-run
```

#### Confirm that the website has https
Head to https://bashballoonsrentals.com/ and make sure you see https instead of http.

#### Update nignx config file
Most often certbot has already updated the file `/etc/nginx/sites-available/bashballoons.conf` by adding something similar to:  
```{sh}

server {
    listen 443 ssl;
    server_name bashballoonsrentals.com,www.bashballoonsrentals.com;

        ssl_certificate /etc/letsencrypt/live/bashballoonsrentals.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/bashballoonsrentals.com/privkey.pem;

    location / {
        proxy_pass http://localhost:<port_node_is_running_on>;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

}

```

#### Test Nginx
```{sh}
sudo nginx -t 
```

#### Reload Nginx
```{sh}
sudo systemctl reload nginx
```


