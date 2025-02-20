# Fastboard Server

Fastboard Server is an optional backend persistence layer for the Fastboard UI web application. It allows for saving of files and team collaboration via a centralized data store.

# Running with Docker/Podman/Kubernetes

If you want to run the latest release, expose the following environment variables.

```sh
export FASTBOARD_SERVER_USERNAME="fastboard"
export FASTBOARD_SERVER_PASSWORD="password"
```

Then run the latest Fastboard Server build with inline variables:

```sh
# Note you should volume mount your own directory where dashboard files will be saved.
mkdir -p ./data/dashboards
docker run -it --rm -p 3000:3000 -v ./data/dashboards:/app/build/data/dashboards \
    -e "FASTBOARD_SERVER_USERNAME=fastboard" \
    -e "FASTBOARD_SERVER_PASSWORD=password" \
    p3000/fastboard-server:latest
```

# Developer Quickstart

## Running From Source

```sh
npm i # to install dependencies
npm run start # to run normally, or
npm run watch # to automatically restart upon code changes
```

## Testing From Source

```sh
npm run test # to run once, or
npm run test-watch # to automatically rerun tests upon code or test changes
```

## Building

```sh
docker build -t p3000/fastboard-server:latest . # Local CPU architecture only
# ..or..
docker buildx build --platform linux/arm64/v8,linux/amd64 -t p3000/fastboard-server:latest . --push # Multi-architecture
```

## License

Apache 2.0

## Attribution

Preston Lee
