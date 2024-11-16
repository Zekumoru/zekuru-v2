#!/bin/bash

# NOTE: This deploy script assumes that the repo
#       is already cloned and lives in APP_DIR
#       and this script is given permissions to run
#       i.e. chmod +x deploy.sh

# Variables
BRANCH=$1
APP_DIR=""      # Will be set later
PM2_APP_NAME="" # Will be set later

# Function to handle errors
error_exit() {
  echo "Error: $1" >&2
  exit 1
}

# Ensure a branch name is provided
if [ -z "$BRANCH" ]; then
  error_exit "No branch specified. Usage: ./deploy.sh <branch-name>"
fi


# Set APP_DIR and PM2_APP_NAME based on the branch
if [ "$BRANCH" == "main" ]; then
  APP_DIR="$HOME/repos/zekuru-v2"
  PM2_APP_NAME="Zekuru-v2"
elif [ "$BRANCH" == "develop" ]; then
  APP_DIR="$HOME/repos/zekuru-v2-dev"
  PM2_APP_NAME="Zekuru-v2-Dev"
else
  error_exit "Unsupported branch '$BRANCH'. Only 'main' and 'develop' are allowed."
fi

# Navigate to the application directory
cd "$APP_DIR" || error_exit "App directory '$APP_DIR' not found."

# Check out the specified branch and pull the latest changes
git checkout "$BRANCH" || error_exit "Failed to checkout branch '$BRANCH'."
git pull origin "$BRANCH" || error_exit "Failed to pull latest changes for '$BRANCH'."

# Install dependencies
yarn install || error_exit "Dependencies install failed."

# Build application
yarn nx build zekuru-v2 || error_exit "Build process failed."

# Copy .env to build
cp .env ./dist/apps/zekuru-v2/ || error_exit "Could not copy .env to build directory."

# Move to build directory
mv ./dist/apps/zekuru-v2/


# Function to check if PM2 process exists
pm2_exists() {
  pm2 list | grep -w "$PM2_APP_NAME" > /dev/null 2>&1
}

# Restart or Start the application using PM2
if pm2_exists; then
  pm2 restart "$PM2_APP_NAME" --update-env --silent || error_exit "Failed to restart PM2 application '$PM2_APP_NAME'."
  echo "PM2 application '$PM2_APP_NAME' restarted successfully."
else
  # Start the application (modify the start command as needed)
  pm2 start app.js --name "$PM2_APP_NAME" --silent || error_exit "Failed to start PM2 application '$PM2_APP_NAME'."
  echo "PM2 application '$PM2_APP_NAME' started successfully."
fi

# Save the PM2 process list and resurrect on server reboot
pm2 save || error_exit "Failed to save PM2 process list."
