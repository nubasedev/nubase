#!/bin/bash

# Check if Docker daemon is running before executing database commands

if ! docker info > /dev/null 2>&1; then
  echo "Error: Cannot connect to Docker daemon."
  echo ""
  echo "Please ensure Docker is running and try again."
  exit 1
fi

# Execute the command passed as arguments
exec "$@"
