import express from 'express';
import bodyParser from 'body-parser';
import {JSONRPCServer} from 'json-rpc-2.0';
import {Browser, chromium, Page} from "playwright";
import {BrowserContext} from "playwright-core";
import * as fs from 'fs';
import * as path from 'path';

const app = express();
const port = 9000;
const lightClientUrl = 'http://localhost:8000/demo.html'
const buttonName = '启动节点'

let browser:Browser, context:BrowserContext, page:Page;

// @ts-ignore
BigInt.prototype.toJSON = function () {
    return `0x${this.toString(16)}`
}


const server = new JSONRPCServer();
app.use(express.json({limit: '50000mb'}));
app.use(express.urlencoded({limit: '50000mb'}));

// 自动注册RPC方法
function registerRPCMethods() {
    try {
        // 读取rpc.json文件
        const rpcConfigPath = path.join(__dirname, '../../rpc.json');
        const rpcConfig = JSON.parse(fs.readFileSync(rpcConfigPath, 'utf8'));
        
        // 为每个命令注册方法
        rpcConfig.commands.forEach((command: any) => {
            const methodName = command.name;
            
            server.addMethod(methodName, async (args?: any[]) => {
                let options = {}
                options["methodName"] = methodName;
                options["args"] = args;
                return await page.evaluate((options) => {
                    // @ts-ignore
                    return window.fiber.invokeCommand(options["methodName"], options["args"]);
                },  options);
            });
            console.log(`已注册RPC方法: ${methodName}`);
        });
        
        console.log(`总共注册了 ${rpcConfig.commands.length} 个RPC方法`);
    } catch (error) {
        console.error('注册RPC方法失败:', error);
    }
}


server.addMethod("stop", async () => {
    // @ts-ignore
    await page.evaluate(() => window.fiber.stop())
});


server.addMethod("start", async () => {
    await page.getByRole("button", {
        name: buttonName
    }).click()
    await new Promise((resolve) => setTimeout(resolve, 1000));
});


server.addMethod("new_client", async (args?: any[]) => {
    await page.close()
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto(lightClientUrl); // Adjust URL if needed

    await page.getByRole("textbox", {
        name: "私钥"
    }).fill(args?.['privateKey'] || '')
    // 添加peerid ,填入peer-id-input
    
    await page.getByRole("textbox", {
        name: "Peer ID"
    }).fill(args?.['peerId']|| '')

    await page.getByRole("button", {
        name: buttonName
    }).click()
    await new Promise((resolve) => setTimeout(resolve, 1000));
});

server.addMethod("new_dev_client", async (args?: any[]) => {
    await page.close()
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto(lightClientUrl); // Adjust URL if needed
    // 添加参数 私钥，填入private-key-input
    
    await page.getByRole("textbox", {
        name: "私钥"
    }).fill(args?.['privateKey'] || '')
    // 添加peerid ,填入peer-id-input
    
    await page.getByRole("textbox", {
        name: "Peer ID"
    }).fill(args?.['peerId']|| '')

    await page.selectOption('#config-file-select', 'dev-config.yml');
    await page.getByRole("button", {
        name: buttonName
    }).click()
    await new Promise((resolve) => setTimeout(resolve, 1000));
});


app.use(bodyParser.json());


app.post('/', async (req, res) => {
    let jsonRPCRequest = req.body;
    console.log('body:', JSON.stringify(jsonRPCRequest));

    if (Array.isArray(jsonRPCRequest)) {
        // Handle batch requests
        const responses = await Promise.all(
            jsonRPCRequest.map((request) => server.receive(request))
        );
        const filteredResponses = responses.filter((response) => response !== undefined);
        res.json(filteredResponses);
    } else {
        // Handle single request
        server
            .receive(jsonRPCRequest)
            .then((jsonRPCResponse) => {
                if (jsonRPCResponse) {
                    res.json(jsonRPCResponse);
                } else {
                    res.sendStatus(204); // No content for notifications
                }
            })
            // @ts-ignore
            .catch((error) => {
                res.status(500).send(error.message);
            });
    }
});

// @ts-ignore

// start service
app.listen(port, async () => {
    browser = await chromium.launch({headless: false}); // Visible browser for debugging
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto(lightClientUrl); // Adjust URL if needed

    // await page.click('button[name="Initialize workers"]');
    await page.getByRole("button", {
        name: buttonName
    }).click()
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // 注册所有RPC方法
    registerRPCMethods();

    console.log(`JSON-RPC server is running at http://localhost:${port}`);
});


