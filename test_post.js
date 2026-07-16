const http = require('http');

function post(path, body) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const options = {
            hostname: 'localhost',
            port: 8080,
            path: path,
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
        };
        const req = http.request(options, res => {
            let out = '';
            res.on('data', chunk => out += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: out }));
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function main() {
    // Save a test bill
    const billResp = await post('/api/bills', {
        billDate: '2026-07-15',
        totalAmount: 100.0,
        customerName: 'Test Customer',
        customerPhone: '1234567890'
    });
    console.log('Bill saved:', billResp.status, billResp.body);
    const savedBill = JSON.parse(billResp.body);

    // Save a bill item
    const itemResp = await post('/api/bill-items', {
        quantity: 2,
        price: 50.0,
        bill: { id: savedBill.id },
        product: { id: 1 }
    });
    console.log('BillItem saved:', itemResp.status, itemResp.body);
}
main().catch(console.error);
