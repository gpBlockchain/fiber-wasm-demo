import express from 'express';
import bodyParser from 'body-parser';
import { JSONRPCServer } from 'json-rpc-2.0';
import { IncomingHttpHeaders } from 'http';
import { Browser, chromium, Page } from "playwright";
import { BrowserContext } from "playwright-core";
import * as fs from 'fs';
import * as path from 'path';

const app = express();
const port = 9000;
const lightClientUrl = 'http://localhost:8000/demo.html'
const buttonName = '启动节点'

let browser: Browser, context: BrowserContext, page: Page;

// @ts-ignore
BigInt.prototype.toJSON = function () {
    return `0x${this.toString(16)}`
}


// 定义服务器参数类型，包含请求头信息
interface ServerParams {
    headers: IncomingHttpHeaders;
}

// 创建JSONRPCServer实例，指定ServerParams类型
const server = new JSONRPCServer<ServerParams>();
app.use(express.json({ limit: '50000mb' }));
app.use(express.urlencoded({ limit: '50000mb' }));

// 自动注册RPC方法
function registerRPCMethods() {
    try {
        // 读取rpc.json文件
        const rpcConfigPath = path.join(__dirname, '../../rpc.json');
        const rpcConfig = JSON.parse(fs.readFileSync(rpcConfigPath, 'utf8'));

        // 为每个命令注册方法
        rpcConfig.commands.forEach((command: any) => {
            const methodName = command.name;
            
            server.addMethod(methodName, async (args?: any[], context?: any) => {
                let options = {}
                options["methodName"] = methodName;
                options["args"] = args;
                console.log('context?.headers:', context?.headers);
                // 读取header中的databasePrefix
                const headers = context?.headers || {};
                const databasePrefix = headers['databaseprefix'] || headers['database-prefix'] || 'wasm';
                options["databasePrefix"] = databasePrefix;
                
                console.log(`执行RPC方法: ${methodName}, 使用数据库前缀: ${databasePrefix}`);
                
                return await page.evaluate((options) => {
                    // @ts-ignore
                    return window.fibers[options['databasePrefix']].invokeCommand(options["methodName"], options["args"]);
                },  options);
            });
            console.log(`已注册RPC方法: ${methodName}`);
        });
        
        console.log(`总共注册了 ${rpcConfig.commands.length} 个RPC方法`);
    } catch (error) {
        console.error('注册RPC方法失败:', error);
    }
}


server.addMethod("stop", async (args?: any[], context?: any) => {
    // todo 
    // 获取请求头信息
    // const headers = context?.headers || {};
    // console.log('stop方法收到的请求头:', headers);
    
    // await page.locator('#stop-button').click();
    // await new Promise((resolve) => setTimeout(resolve, 1000));
});

server.addMethod("refresh", async (args?: new_client_params[], context?: any) => {
    // 获取请求头信息
    const headers = context?.headers || {};
    console.log('refresh方法收到的请求头:', headers);
    
    // 从请求头获取数据库前缀
    
    await page.reload()
    // 添加参数 私钥，填入private-key-input
    console.log('args?.devConfig:', args);
    console.log('args?.privateKey:', args?.[0]?.privateKey);
    await page.getByRole("textbox", {
        name: "私钥"
    }).fill(args?.[0]?.privateKey || '')
    // 添加peerid ,填入peer-id-input

    await page.getByRole("textbox", {
        name: "Peer ID"
    }).fill(args?.[0]?.peerId || '')

    await page.selectOption('#config-file-select', args?.[0]?.devConfig || 'config.yml');


    await page.getByRole("textbox", {
        name: "fiber database prefix"
    }).fill(args?.[0]?.databasePrefix || 'wasm');

    await page.getByRole("textbox", {
        name: "节点前缀"
    }).fill(args?.[0]?.databasePrefix || 'wasm');

    await page.getByRole("button", {
        name: buttonName
    }).click()
    
    // 如果请求头中有数据库前缀，则使用它
    
    await new Promise((resolve) => setTimeout(resolve, 5000));
});

server.addMethod("start", async (args?: any[], context?: any) => {
    // 获取请求头信息
    const headers = context?.headers || {};
    await page.getByRole("textbox", {
        name: "fiber database prefix"
    }).fill(headers?.databasePrefix || 'wasm');
    await page.getByRole("textbox", {
        name: "节点前缀"
    }).fill(args?.[0]?.databasePrefix || 'wasm');
    await page.getByRole("button", {
        name: buttonName
    }).click()
    await new Promise((resolve) => setTimeout(resolve, 1000));
});

type new_client_params = {
    privateKey?: string,
    peerId?: string,
    devConfig?: string,
    databasePrefix?: string
}

server.addMethod("reset",async (args?: any[], context?: any) => {
    await page.close()
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto(lightClientUrl); // Adjust URL if needed
})

server.addMethod("new_client", async (args?: new_client_params[], context?: any) => {
    // 获取请求头信息
    const headers = context?.headers || {};
    console.log('new_client方法收到的请求头:', headers);
    
    // 从请求头获取数据库前缀
    
    // await page.close()
    // context = await browser.newContext();
    // page = await context.newPage();
    // await page.goto(lightClientUrl); // Adjust URL if needed
    // 添加参数 私钥，填入private-key-input
    console.log('args?.devConfig:', args);
    console.log('args?.privateKey:', args?.[0]?.privateKey);
    await page.getByRole("textbox", {
        name: "私钥"
    }).fill(args?.[0]?.privateKey || '')
    // 添加peerid ,填入peer-id-input
    await page.getByRole("textbox", {
        name: "Peer ID"
    }).fill(args?.[0]?.peerId || '')

    await page.selectOption('#config-file-select', args?.[0]?.devConfig || 'config.yml');
     // 添加数据库前缀，优先使用请求头中的值
    await page.getByRole("textbox", {
        name: "fiber database prefix"
    }).fill(args?.[0]?.databasePrefix || 'wasm')
    await page.getByRole("textbox", {
        name: "节点前缀"
    }).fill(args?.[0]?.databasePrefix || 'wasm');

    await page.getByRole("button", {
        name: buttonName
    }).click()


    await new Promise((resolve) => setTimeout(resolve, 5000));
});




app.use(bodyParser.json());


app.post('/', async (req, res) => {
    let jsonRPCRequest = req.body;
    console.log('body:', JSON.stringify(jsonRPCRequest));
    
    // 将请求头信息添加到上下文中
    const serverParams: ServerParams = { headers: req.headers };
    
    if (Array.isArray(jsonRPCRequest)) {
        // Handle batch requests
        const responses = await Promise.all(
            jsonRPCRequest.map((request) => {
                // 为每个请求添加请求头信息上下文
                return server.receive(request, serverParams);
            })
        );
        const filteredResponses = responses.filter((response) => response !== undefined);
        res.json(filteredResponses);
    } else {
        // Handle single request
        server
            .receive(jsonRPCRequest, serverParams)
            .then((jsonRPCResponse) => {
                if (jsonRPCResponse) {
                    res.json(jsonRPCResponse);
                } else {
                    res.sendStatus(204); // No content for notifications
                }
            })
            // .catch((error) => {
                // res.status(500).send(error.message);
            // });
    }
});

// @ts-ignore

// start service
app.listen(port, async () => {
    browser = await chromium.launch({ headless: true }); // Visible browser for debugging
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto(lightClientUrl); // Adjust URL if needed

    // await page.click('button[name="Initialize workers"]');
    // await page.getByRole("button", {
        // name: buttonName
    // }).click()
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 注册所有RPC方法
    registerRPCMethods();

    console.log(`JSON-RPC server is running at http://localhost:${port}`);
});


