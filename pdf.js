const express = require('express')
const app = express()
const port = 3009;

const cors = require('cors');
const bodyParser = require('body-parser');

const fs = require("fs");
const path = require("path");
const puppeteer = require('puppeteer');
const handlebars = require("handlebars");




app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
});


app.use(cors());
app.use(
    bodyParser.json({
        limit: '16mb'
    })
);
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

let total = '';
let customerName = '';
let customerContact = '';
let receiptNo = '';
let paymentDate = '';
let balance = '';
let description = '';
let path2 = '';

app.use('/file', express.static(__dirname + '/INVOICES/'));

app.post('/', (req, res) => {

    total = req.body.amount;
    customerName = req.body.customerName;
    customerContact = req.body.customerContact;
    receiptNo = req.body.receiptNo;
    paymentDate = req.body.paymentDate;
    balance = req.body.outstandingBalance;
    description = req.body.description;
    path2 = req.body.id;



    generatePdf();

    return res.status(200).send({success: true});

});

app.listen(port, () => console.log(`GENERATING INVOICE FOR CALEB AT @@ -> ${port}!`))


async function generatePdf() {

    try {

        var dataBinding = {
            items: [{
                name: description,
                price: total
            }],
            total: total,
            customerName: customerName,
            customerContact: customerContact,
            receiptNo: receiptNo,
            paymentDate: paymentDate,
            balance: balance,
            isWatermark: true
        }

        var templateHtml = fs.readFileSync(path.join(process.cwd(), 'invoice.html'), 'utf8');
        var template = handlebars.compile(templateHtml);
        var finalHtml = template(dataBinding);


        var options = {
            format: 'A4',
            headerTemplate: "<p></p>",
            footerTemplate: "<p></p>",
            displayHeaderFooter: false,
            margin: {
                top: "40px",
                bottom: "100px"
            },
            printBackground: true,
            path: `INVOICES/${path2}.pdf`
        }

        const browser = await puppeteer.launch({
            headless: true
        });
        const page = await browser.newPage();
        await page.setContent(finalHtml);
        const buffer = await page.pdf(options);
        await browser.close();


        console.log('Done: invoice.pdf is created!')

    } catch (error) {

        console.log(error);

    }

}