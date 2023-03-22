#!/bin/bash

# Define variables for the server details
server_address='your-server.com'
server_user='your-username'
server_path='/path/to/your/app'

# Define variables for the local directories and files
local_build_dir='./build/'
remote_build_dir="${server_user}@${server_address}:${server_path}/build/"
local_config_dir='./config/'
remote_config_dir="${server_user}@${server_address}:${server_path}/config/"

# Build the front-end code
npm run build

# Transfer the build directory to the server
rsync -avz --delete $local_build_dir $remote_build_dir

# Transfer the config directory to the server
rsync -avz --delete $local_config_dir $remote_config_dir

# Restart the server
ssh $server_user@$server_address 'sudo systemctl restart your-app.service'


#终端输入
# $ chmod +x deploy.sh    # 赋予脚本可执行权限
# $ ./deploy.sh

#--------------------------------------------
# #!/bin/bash

# # Configuration
# # replace <your remote host> with the hostname or IP address of your Huawei cloud server
# # <your remote username> with your remote username
# # <your remote port> with the port number to use for SSH
# # <your remote directory> with the path to the directory on the remote server where you want to deploy your project
# # <your app name> with the name of your application.
# REMOTE_HOST=<your remote host>
# REMOTE_USER=<your remote username>
# REMOTE_PORT=<your remote port>
# REMOTE_DIR=<your remote directory>

# # Build the front-end project
# npm run build

# # Upload files to the remote server
# rsync -azP -e "ssh -p $REMOTE_PORT" ./dist/ $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR

# # SSH into the remote server and restart the server
# ssh -p $REMOTE_PORT $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_DIR && npm install && pm2 restart <your app name>"
