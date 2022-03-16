const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const lineReader = require("line-reader");
const fs = require("fs");
const schedule = require('node-schedule');
const moment = require('moment');
const chalk = require("chalk");
const figlet = require('figlet');
const figchalk = require('figchalk');
const ProgressBar = require('progress');

const dir = console.dir;
const log = console.log;
let now = moment().format('LLLL');

puppeteer.use(StealthPlugin());

const mainUrl = 'https://www.corrlinks.com/Login.aspx';
const logoutUrl = 'https://www.corrlinks.com/Logout.aspx'

const { corrUsername, corrPassword, accounts, keywords, nbrowsers } = require('./config');

const login_data = JSON.parse(fs.readFileSync("./login.json"));
let runing_browsers = 0;

const start = async (email, password) => {
    const info = [];
    puppeteer.use(StealthPlugin());
	const browser = await puppeteer.launch({
		args: ['--no-sandbox'], 
		headless: !false,
		slowMo: 5,
		devtools: false 
	})

	const page = await browser.newPage();
    await page.waitForTimeout(500)

	await page.goto(mainUrl);
	page.waitForNavigation({waitUntil: 'networkidle2'}),

    log(chalk.yellowBright.bold('Logging into Corrlinks...'));
        try {
            await log_in(page, email, password);
            await page.waitForSelector('#ctl00_mainContentPlaceHolder_mailboxImageButton');
            log(chalk.greenBright.bold('Login Successful!'));
        } catch (error) {
            log(chalk.redBright.bold('Login Unsuccessful'));
            log(chalk.redBright.bold(error));
            await browser.close();
            process.exit(1);
        }
        
        try {
            let messageExist
            if ((await page.$('.unreadMessage')) !== null) {
                messageExist = await page.evaluate(el => el.innerText, await page.$('.unreadMessage'));
                log(chalk.greenBright.bold(messageExist));
                await page.goto('https://www.corrlinks.com/Inbox.aspx?UnreadMessages');
                await page.reload();
                    info.push(...(await textToFind(browser, page, "heybro..")));
                await page.waitForSelector('#ctl00_logoutLink');
                await page.goto(logoutUrl);
                for (let i = 0; i < info.length; i++) {
                    const data = info[i];
                    await log_in(page, login_data[data.keyword].email, login_data[data.keyword].password);
                    log(chalk.yellowBright.bold("Fetching keyword associations..."));
                    await newMessage(page, data.msgSubject, data.msgBody);
                    await page.waitForSelector('#ctl00_logoutLink');
                    await page.click(logoutUrl);
                }
            } else {
                messageExist = ''
                log(chalk.redBright.bold('No new messages...'));
                await page.reload();
                await page.click('#ctl00_logoutLink');

                // ******** TESTING PURPOSES ONLY! *********
                // await page.goto('https://www.corrlinks.com/Inbox.aspx');
                // info.push(...(await textToFind(browser, page, "heybro..")));
                // await page.waitForSelector('#ctl00_logoutLink');
                // await page.goto(logoutUrl)
                // for (let i = 0; i < info.length; i++) {
                //     const data = info[i];
                //     await log_in(page, login_data[data.keyword].email, login_data[data.keyword].password);
                //     console.log("**** TESTING ****");
                //     await newMessage(page, data.msgSubject, data.msgBody)
                //     await page.waitForSelector('#ctl00_logoutLink');
                //     await page.click('#ctl00_logoutLink')
                // }
            }
    
        } catch (error) {
            log(chalk.redBright.bold(error));
        }
        await browser.close()
        runing_browsers--;
    };

    async function log_in(page, corrUsername, corrPassword) {
        await page.waitForSelector('#ctl00_mainContentPlaceHolder_loginUserNameTextBox');
        await page.waitForSelector('#ctl00_mainContentPlaceHolder_loginPasswordTextBox');
        await page.type('#ctl00_mainContentPlaceHolder_loginUserNameTextBox', corrUsername,);
        await page.type('#ctl00_mainContentPlaceHolder_loginPasswordTextBox', corrPassword,);
        await page.click('#ctl00_mainContentPlaceHolder_loginButton');
        await page.waitForTimeout(2000);
    }

    async function page_goto(page, page_number) {
        await page.waitForSelector('#ctl00_mainContentPlaceHolder_inboxGridView > tbody > tr.Pager > td > table > tbody > tr > td> a')
        const pages_handler = await page.$$('#ctl00_mainContentPlaceHolder_inboxGridView > tbody > tr.Pager > td > table > tbody > tr > td> a')
        console.log("page number => ", page_number);
        for (let i = 0; i < pages_handler.length; i++) {
            if (Number(await page.evaluate(el => el.innerText, pages_handler[i]) == page_number)) {
                await page.evaluate(elm => elm.click(), pages_handler[i]);
                await page.waitForResponse((response) => response.url() === 'https://www.corrlinks.com/Inbox.aspx?UnreadMessages');
            }
        }
    }
 

    const textToFind = async (browser, page, textString, msgBody, msgSubject, page_number) => {
        const info= []
        const reads = await page.$x("//a[contains(text(), 'Read')]")
        let Textarray = keywords.map(e => e.toLowerCase().replace(/\s/g, ""))
            const subjectArea = await page.$$('td > a.tooltip')
            for (var i = 0; i < subjectArea.length; i++) {
            let subjectValue = await subjectArea[i].getProperty('innerText');
            let subjectText = await subjectValue.jsonValue();
            const text = getText(subjectText);
            if (Textarray.includes(text)) {        
                log(chalk.greenBright.bold('Keyword match found!'));
                await reads[i].click();
                await page.waitForSelector('textarea#ctl00_mainContentPlaceHolder_messageTextBox');
            const msgBody = await page.$eval('textarea#ctl00_mainContentPlaceHolder_messageTextBox', (elm) => {
                return elm.textContent;
       });
                await page.waitForSelector('input#ctl00_mainContentPlaceHolder_subjectTextBox');
            const msgSubject = await page.$eval('input#ctl00_mainContentPlaceHolder_subjectTextBox', (elm) => {
                return elm.value;
       });
       log(chalk.greenBright.bold(msgSubject+"-"+now, '   =>   ', msgBody));
       info.push({ keyword: text, msgSubject, msgBody });
        return info;
    }
  }
}    

function getText(linkText) {
	linkText = linkText.replace(/\r\n|\r/g, "\n").toLowerCase();
	linkText = linkText.replace(/\ +/g, " ").toLowerCase();
	linkText = linkText.replace(/\s+/g, "").toLowerCase();

	var nbspPattern = new RegExp(String.fromCharCode(160), "g");
	return linkText.replace(nbspPattern, " ");
}

const newMessage = async (page, msgSubject, msgBody) => {
	try {
        await page.reload();
		log(chalk.yellowBright.bold('Loading new message input...'));
		await page.goto('https://www.corrlinks.com/NewMessage.aspx');
		await page.waitForSelector('#ctl00_mainContentPlaceHolder_addressBox_addressTextBox');
		await page.click('#ctl00_mainContentPlaceHolder_addressBox_addressTextBox');
		await page.waitForSelector('#ctl00_mainContentPlaceHolder_addressBox_addressGrid_ctl02_sendCheckBox');
		await page.click('#ctl00_mainContentPlaceHolder_addressBox_addressGrid_ctl02_sendCheckBox');
		await page.click('#ctl00_mainContentPlaceHolder_addressBox_okButton');
		await page.waitForTimeout(2000);
		log(chalk.greenBright.bold('recipient selected!'));
        await page.waitForSelector('#ctl00_mainContentPlaceHolder_subjectTextBox');
		await page.click('#ctl00_mainContentPlaceHolder_subjectTextBox');
		await page.keyboard.type(msgSubject, { delay: 50 });
		await page.click('#ctl00_mainContentPlaceHolder_messageTextBox');
		await page.keyboard.type(msgBody, { delay: 50 });
		await page.click('#ctl00_mainContentPlaceHolder_sendMessageButton');
		await page.waitForSelector('#ctl00_mainContentPlaceHolder_messageLabel');
		log(chalk.greenBright.bold('Message sent successful!'));
		log(chalk.yellowBright.bold("Subject: " + msgSubject+"-"+now));
		log(chalk.yellowBright.bold("Body: " + msgBody));

	} catch (error) {
		log(chalk.redBright.bold('Message sent failed, please try again...'));
		log(chalk.redBright.bold(error));
	}
}

(async () =>  {
    log(figchalk.mix("CorrBrothers", "red", "Graffiti"));
	log(chalk.yellowBright.bold("                                                                             By: Brian" + " 'KT' "+ "Turner"));
	log(chalk.bgRed.bold('                                                                                                    '))

    const rule = new schedule.RecurrenceRule();
    rule.minute = 04;
    const job = schedule.scheduleJob(rule, function(){

    log(chalk.yellowBright.bold("Starting services..."))
    log(chalk.yellowBright.bold(now));

    const bar = new ProgressBar(':bar', { 
		width: 20,
		total: 30 });
	const timer = setInterval(function () {
	  bar.tick();
	  if (bar.complete) {
		log(chalk.yellowBright.bold('\n+++ Accounts loaded! +++\n'));
		clearInterval(timer);
	  }
	}, 100);

		log(chalk.yellowBright.bold(`Loading accounts...`))

	let i = 0;
	while(i < accounts.length)
	{
		if(runing_browsers < nbrowsers)
		{
			start(accounts[i].email, accounts[i].password)
			i++;
        }
		}
	})
})();