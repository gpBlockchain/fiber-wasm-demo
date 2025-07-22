git clone https://github.com/Officeyutong/fiber.git
cd fiber 
git checkout wasm-db-implementation
npm install
npm run build -ws 
cd ../
echo "run server"
python server.py > server.log 2>&1 &
echo "run e2e"
cd fiber-wasm-client-rpc
npm install
npm run build 
npm run service > service.log 2>&1 &