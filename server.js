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
const newMessageUrl = 'https://www.corrlinks.com/NewMessage.aspx';
const  mailboxUrl = 'https://www.corrlinks.com/Mailbox.aspx'
const { corrUsername, corrPassword, accounts, keywords, nbrowsers } = require('./config');

const login_data = JSON.parse(fs.readFileSync("./login.json"));
let running_browsers = 0;

const start = async (email, password) => {



    const info = [];
    puppeteer.use(StealthPlugin());
    process.setMaxListeners(Infinity);
	const browser = await puppeteer.launch({
		args: [
        '--no-sandbox',
        '--no-zygote'
              ], 
		headless: false,
		slowMo: 10,
        ignoreHTTPSErrors: true,
		devtools: false 
	})

	const [page] = await browser.pages();
    // await page.waitForTimeout(500)

	await page.goto(mainUrl);
	page.waitForNavigation({waitUntil: 'networkidle2'}),

    log(chalk.yellowBright.bold('Logging into Corrlinks...'));
        try {
            await log_in(page, email, password);
            // page.waitForNavigation({waitUntil: 'networkidle2'}),
            // await page.reload();

            // await page.waitForSelector('#ctl00_mainContentPlaceHolder_mailboxImageButton');
            log(chalk.greenBright.bold('Login Successful!'));
        } catch (error) {
            log(chalk.redBright.bold('Login Unsuccessful'));
            log(chalk.redBright.bold(error));
            // await browser.close();
            await Promise.all([ await browser.disconnect(), await browser.close(), await run() ])

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
                    log_in(page, login_data[data.keyword].email, login_data[data.keyword].password);
                                    // await page.waitForTimeout(2000);

                    log(chalk.yellowBright.bold("Fetching keyword associations..."));
                    await newMessage(page, data.msgSubject, data.msgBody);
                    // await page.waitForSelector('#ctl00_logoutLink');
                    // await page.goto(logoutUrl);
                    // running_browsers--;
                                        // await browser.close();

                    // run();
                    await Promise.all([ await browser.disconnect(), await browser.close(), await run() ])

                }
            } else {
                let messageExist = ''
                log(chalk.redBright.bold('No new messages...'));
                await browser.disconnect() 
                await browser.close() 
                // await run()
                // await page.reload();
                // await page.waitForTimeout(2000);
                // page.goto(logoutUrl);
                // await browser.disconnect();
                // await browser.close();
                // await running_browsers--;

                // run();
                // await page.waitForSelector('#ctl00_mainContentPlaceHolder_mailboxImageButton');
                // await page.click('#ctl00_mainContentPlaceHolder_mailboxImageButton');
                // await page.waitForSelector('#ctl00_mainContentPlaceHolder_Image1');
                // await page.click('#ctl00_mainContentPlaceHolder_Image1');
                // await page.waitForSelector('#ctl00_mainContentPlaceHolder_addressBox_addressTextBox');
                // await page.click('#ctl00_mainContentPlaceHolder_addressBox_addressTextBox');
                // await page.waitForSelector('#ctl00_mainContentPlaceHolder_addressBox_addressGrid_ctl02_sendCheckBox');
                // await page.click('#ctl00_mainContentPlaceHolder_addressBox_addressGrid_ctl02_sendCheckBox');
                // await page.click('#ctl00_mainContentPlaceHolder_addressBox_okButton');
                // await page.waitForTimeout(5000);
                // log(chalk.greenBright.bold('recipient selected!'));
                // await page.waitForSelector('#ctl00_mainContentPlaceHolder_subjectTextBox');
                // await page.click('#ctl00_mainContentPlaceHolder_subjectTextBox');
                // await page.keyboard.type('Automated Message!');
                // await page.click('#ctl00_mainContentPlaceHolder_messageTextBox');
                // await page.keyboard.type('Messages: 0 Time: ' + now + '. Currently no messages for your account at this time. Keep your heads up and rest easy my friends! L/Rs');
                // await page.click('#ctl00_mainContentPlaceHolder_sendMessageButton');
                // log(chalk.greenBright.bold('Automated message sent successfully!'));
                // await browser.close()

                // running_browsers--;
                // await browser.close();
                // run();

                // await page.goto(logoutUrl);


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
                //     await page.goto(logoutUrl);
                //     await browser.close(); }
            }
    
        } catch (error) {
            // await page.reload();
            log(chalk.redBright.bold(error));
            await page.waitForSelector('#ctl00_mainContentPlaceHolder_mailboxImageButton');
            await page.click('#ctl00_mainContentPlaceHolder_mailboxImageButton');
            await page.waitForSelector('#ctl00_mainContentPlaceHolder_Image1');
            await page.click('#ctl00_mainContentPlaceHolder_Image1');
            await page.waitForSelector('#ctl00_mainContentPlaceHolder_addressBox_addressTextBox');
            await page.click('#ctl00_mainContentPlaceHolder_addressBox_addressTextBox');
            await page.waitForSelector('#ctl00_mainContentPlaceHolder_addressBox_addressGrid_ctl02_sendCheckBox');
            await page.click('#ctl00_mainContentPlaceHolder_addressBox_addressGrid_ctl02_sendCheckBox');
            await page.click('#ctl00_mainContentPlaceHolder_addressBox_okButton');
            await page.waitForTimeout(5000);
            log(chalk.greenBright.bold('recipient selected!'));
            await page.waitForSelector('#ctl00_mainContentPlaceHolder_subjectTextBox');
            await page.click('#ctl00_mainContentPlaceHolder_subjectTextBox');
            await page.keyboard.type('Automated Message!', { delay: 50 });
            await page.click('#ctl00_mainContentPlaceHolder_messageTextBox');
            await page.keyboard.type('Please make sure to enter the institutional name in the subject! (e.g. colemanusp) Please also remeber on a reply email to start a new email until I get the reply function worked.  L/Rs', { delay: 50 });
            await page.click('#ctl00_mainContentPlaceHolder_sendMessageButton');
            await Promise.all([ await browser.disconnect(), await browser.close(), await run() ])

        } finally {

        }


    };

    async function log_in(page, corrUsername, corrPassword) {
            await page.waitForSelector('#ctl00_mainContentPlaceHolder_loginUserNameTextBox');
            await page.waitForSelector('#ctl00_mainContentPlaceHolder_loginPasswordTextBox');
            await page.keyboard.type(corrUsername, { delay: 20 });
            await page.click('#ctl00_mainContentPlaceHolder_loginPasswordTextBox');
            await page.keyboard.type(corrPassword, { delay: 20 });
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
        // await page.reload();
		log(chalk.yellowBright.bold('Loading new message input...'));
        await page.waitForSelector('#ctl00_mainContentPlaceHolder_mailboxImageButton');
        await page.click('#ctl00_mainContentPlaceHolder_mailboxImageButton');
        await page.waitForSelector('#ctl00_mainContentPlaceHolder_Image1');
        await page.click('#ctl00_mainContentPlaceHolder_Image1');
		await page.waitForSelector('#ctl00_mainContentPlaceHolder_addressBox_addressTextBox');
		await page.click('#ctl00_mainContentPlaceHolder_addressBox_addressTextBox');
		await page.waitForSelector('#ctl00_mainContentPlaceHolder_addressBox_addressGrid_ctl02_sendCheckBox');
		await page.click('#ctl00_mainContentPlaceHolder_addressBox_addressGrid_ctl02_sendCheckBox');
		await page.click('#ctl00_mainContentPlaceHolder_addressBox_okButton');
		await page.waitForTimeout(5000);
		log(chalk.greenBright.bold('recipient selected!'));
        await page.waitForSelector('#ctl00_mainContentPlaceHolder_subjectTextBox');
		await page.click('#ctl00_mainContentPlaceHolder_subjectTextBox');
		await page.keyboard.type(msgSubject);
		await page.click('#ctl00_mainContentPlaceHolder_messageTextBox');
		await page.keyboard.type(msgBody);
		await page.click('#ctl00_mainContentPlaceHolder_sendMessageButton');
		// await page.waitForSelector('#ctl00_mainContentPlaceHolder_messageLabel');
		log(chalk.greenBright.bold('Message sent successful!'));
		log(chalk.yellowBright.bold("Subject: " + msgSubject+"-"+now));
		log(chalk.yellowBright.bold("Body: " + msgBody));

        // await page.goto(logoutUrl)
        // await browser.close();
         await browser.disconnect() 
         await browser.close()


	} catch (error) {
		log(chalk.redBright.bold('Message sent failed, please try again...'));
		log(chalk.redBright.bold(error));
        // await page.goto(logoutUrl)
        // await browser.close();
        await Promise.all([ await browser.disconnect(), await browser.close(), await run() ])

        
	}
}


async function run() {

try {
    log(chalk.yellowBright.bold("Services in Idle mode..."));
    log(chalk.redBright.bold(now));
    //     const rule = new schedule.RecurrenceRule();
//     rule.minute = 45;
  

//    const job = schedule.scheduleJob(rule, function(){
  

    log(chalk.yellowBright.bold("Services in Run mode..."));
    log(chalk.yellowBright.bold(now));



		log(chalk.yellowBright.bold(`Loading accounts...`))

	let i = 0;
	while(i < accounts.length)
	{
		if(running_browsers < nbrowsers)
		{
			 start(accounts[i].email, accounts[i].password)
			i++;
        }
		}
    // })
} catch (error) {
    
    await Promise.all([ await browser.disconnect(), await browser.close(), await run() ])

  
}
	}
    run();
