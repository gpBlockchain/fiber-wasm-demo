
# Fiber WASM Demo

This is a WASM demonstration project based on the Fiber network, providing a lightweight client and RPC service for interacting with the Fiber network.

## Project Structure

- `demo.html`: Frontend interface for user interaction
- `server.py`: Simple HTTP server for serving static files
- `fiber-wasm-client-rpc/`: RPC server providing JSON-RPC interface
- `prepare.sh`: Project preparation script for cloning the Fiber repository and starting services
- `config.yml`: Fiber network configuration file
- `rpc.json`: RPC interface definition file

## Quick Start

### Requirements

- Node.js 18+
- Python 3.x
- Git

### Installation and Startup

1. Clone this repository

```bash
git clone <repository-url>
cd fiber-wasm-demo
```

2. Run the preparation script

```bash
chmod +x prepare.sh
./prepare.sh
```

Or manually execute the following steps:

```bash
# Start the HTTP server http://localhost:8000/demo.html
python server.py

# In a new terminal, start the RPC service http://localhost:9000
cd fiber-wasm-client-rpc
npm install
npm run build 
npm run service
```

3. Access the demo page

Open your browser and visit [http://localhost:8000/demo.html](http://localhost:8000/demo.html)

## Configuration

### Development Configuration

The project uses the following configuration files:

- `config.yml`: Main configuration file containing Fiber network settings
- `dev-config.yml`: Development environment configuration
- `dev-config-watch-tower.yml`: Watchtower configuration

### Script Hash Values

```
xudt_code_hash: 0x102583443ba6cfe5a3ac268bbb4475fb63eb497dce077f126ad3b148d4f4f8f8
xudt_tx_hash: 0x03c4475655a46dc4984c49fce03316f80bf666236bd95118112731082758d686
auth_code_hash: 0x97959f53d36b73e86acb5e8b925d9f58ef255fce05b78625a308349f2df01c8a
auth_tx_hash: 0xecb1c1e3df6cd1e1ca16ca9bd392a3c030ece59cb5123bf156c51034e311a3ec
commitment_lock_code_hash: 0x2d7d93e3347ddf9f10f6690af75f1e24debaa6c4363f3b2c068f61c757253d38
commitment_lock_tx_hash: 0x79c3e55d7010755918f3d9b464425692eee8aa2e9ce89e4355cac0caa51d95bf
funding_lock_code_hash: 0xd7302abe337c459b84c9da6d739d7736d6e8dbfd2326a509981c35943cfe0f56
funding_lock_tx_hash: 0xa4b5c0c402797226ba4dadce21117811549de8b62f8acb3065dc49c23965f2a8
```

## RPC Service

### Service Description

The RPC service runs on `http://localhost:9000` and provides a JSON-RPC 2.0 interface.

### Main APIs

#### Reset Client
clean fiber env
```bash
curl --location 'http://127.0.0.1:9000' \
  --header 'Content-Type: application/json' \
  --data '{ "id": 42,"jsonrpc": "2.0","method": "reset","params": []}'
```

#### Create New Client
Initialize a new Fiber client instance with the following configuration options:

Available configuration files:
- `testnet-config.yml`: Configuration for testnet environment
- `dev-config.yml`: Configuration for local development
- `dev-config-watch-tower.yml`: Development configuration with watchtower support
```bash
curl --location 'http://127.0.0.1:9000' \
  --header 'Content-Type: application/json' \
  --data '{ "id": 42,"jsonrpc": "2.0","method": "new_client","params": [{"privateKey":"0000000000000000000000000000000000000000000000000000000000000028","peerId":"0201010101010101010101010101010101010101010101010101010101010101","devConfig":"config.yml","databasePrefix":"default"}]}'
```

#### Get Node Information
use header 'databaseprefix: default' control which client
```bash
curl --location 'http://127.0.0.1:9000' \
  --header 'Content-Type: application/json' \
  --header 'databaseprefix: default' \
  --data '{ "id": 42,"jsonrpc": "2.0","method": "node_info","params": []}'
```

For more APIs, please refer to the `rpc.json` file.

## Data Files

- [data.fiber.tar.gz](data.fiber.tar.gz): Ckb dev data for Fiber network 
- [dev.toml](dev.toml): Ckb Development configuration file

## Troubleshooting

If you encounter issues, you can check the following log files:

- `server.log`: HTTP server log
- `fiber-wasm-client-rpc/service.log`: RPC service log

## Contributing

Contributions via Pull Requests or Issues are welcome to improve this project.

## License

Please refer to the project license file.
