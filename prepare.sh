set -x
FIBER_REPO=${FIBER_REPO:-"https://github.com/Officeyutong/fiber.git"}
FIBER_BRANCH=${FIBER_BRANCH:-"migrate-unit-tests-to-wasm"}
git clone $FIBER_REPO
cd fiber 
git checkout $FIBER_BRANCH
npm install
cargo install wasm-pack
npm run build -ws 
cd ../
echo "run server"
python3 server.py > server.log 2>&1 &
echo "run e2e"
cd fiber-wasm-client-rpc
npm install
npm run build 
npm run service > service.log 2>&1 &
