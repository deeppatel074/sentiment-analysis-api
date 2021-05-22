import csvtojson from 'csvtojson';
import { PythonShell } from 'python-shell';
import { TwitterClient } from 'twitter-api-client';
import * as UserModel from '../models/users.model';
const twitterClient = new TwitterClient({
    apiKey: 'AL6gbsMB82UaB2aJTqRhfnJ0N',
    apiSecret: '5kG5TYeLWzlFo4YKyQCxbfSXiSdoqEWOFWzF5kfI3o3SBoNspV',
    accessToken: '1330790482952089603-YVxAtEAcuI7ETQnujjHUxhSgJEN4Yg',
    accessTokenSecret: 'ONFjOYmL5755e9KxGWnFzQNXkG1IXFEx8iZoT8LQGPk08',
});
export async function register(req, res, next) {
    try {
        let body = req.body;
        if (body.email) {
            let user = await UserModel.getUser(body);
            if (user) {
                throw 'User already registered. Please login to continue';
            } else {
                if (body.password) {
                    const createUser = await UserModel.register(body);
                    return res.success('User Registered Successfully', createUser);
                } else throw 'Password Required';
            }
        } else {
            return res.error('Email should not empty');
        }
    } catch (error) {
        return res.error('Error', error);
    }
}

export async function authenticate(email, password) {
    let user = await Admin.findOne({ $or: [{ email: email }, { phoneNumber: email }] }).exec();
    if (user) {
        if (user.status === constants.status.user.inactive) {
            throw 'Account is Inactive';
        } else if (user.status === constants.status.user.deleted) {
            throw 'User not found';
        } else {
            if (user.status === constants.status.user.active && user.password) {
                if (compareSync(password, user.password)) {
                    user.lastLogin = new Date();
                    user.save();
                    return user;
                } else {
                    throw 'Incorrect Password!!!';
                }
            }
        }
    } else throw 'User not found';
}



export async function login(req, res, next) {
    try {
        const email = req.body.email;
        const password = req.body.password;
        if (email && password) {
            let authorized = await UserModel.authenticate(email, password);
            return res.success('Login Success', {
                email: authorized.email,
                name: authorized.name
            });
        } else {
            return res.error('Email or Password should not empty');
        }
    } catch (error) {
        return res.error('Error', error);
    }
}

export async function getSentimentByText(req, res, next) {
    try {
        let text = req.query.text;
        let emotion = ''
        let response = await getPolarityFromPyScript(text);
        let polarity = Number.parseInt(response.results[0])
        if (polarity >= 1) emotion = "Positive";
        else if (polarity == 0) emotion = "Neutral";
        else emotion = "Negative";
        let results = { text: text, polarity, sentiment: emotion }
        return res.success("working :)", results)
    } catch (error) {
        return res.error("Error While fetching Product Info")
    }
}

export async function getSentimentByCsv(req, res, next) {
    try {
        let str = Buffer.from(req.file.buffer).toString();
        let jsonData = await csvtojson().fromString(str);
        // console.log("Json Data", jsonData);
        let results = [];
        let positive = 0, negative = 0, neutral = 0;
        for (let el of jsonData) {
            el = Object.entries(el).reduce((a, [key, value]) => {
                a[key.toLowerCase()] = value;
                return a;
            }, {});
            console.log("el", el);
            let emotion = ''
            let response = await getPolarityFromPyScript(el.text);
            let polarity = Number.parseInt(response.results[0])
            if (polarity >= 1) {
                emotion = "Positive";
                positive++;
            }
            else if (polarity == 0) {
                emotion = "Neutral";
                neutral++;
            }
            else {
                emotion = "Negative";
                negative++
            }
            if (response.success) {
                results.push({ text: el.text, polarity, sentiment: emotion });
            }
        }
        return res.success("working :)", { results, dataSet: [positive, negative, neutral] })
    } catch (error) {
        return res.error("Error While fetching Product Info")
    }
}
export async function getSentimentFromTwitter(req, res, next) {
    try {
        let text = req.query.text;
        let count = req.query.count;
        let tweets = await twitterClient.tweets.search({ q: text, count: count });
        let texts = [], results = [];
        let positive = 0, negative = 0, neutral = 0;
        tweets.statuses.map(tweet => {
            texts.push(tweet.text)
        });
        for (let el of texts) {
            let emotion = ''
            let response = await getPolarityFromPyScript(el);
            let polarity = Number.parseInt(response.results[0])
            if (polarity >= 1) {
                emotion = "Positive";
                positive++;
            }
            else if (polarity == 0) {
                emotion = "Neutral";
                neutral++;
            }
            else {
                emotion = "Negative";
                negative++
            }
            if (response.success) {
                results.push({ text: el, polarity, sentiment: emotion });
            }
        }
        return res.success("working :) " + texts.length, { results, dataSet: [positive, negative, neutral] })
    } catch (error) {
        return res.error("Error While fetching Product Info")
    }
}

export async function getPolarityFromPyScript(text) {
    let options = {
        mode: 'text',
        pythonPath: 'C:/Python37/python.exe',
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: 'D:/sentiment-analysis-api/src/controllers',
        args: [text]
    };
    return await new Promise((resolve, reject) => {
        PythonShell.run('sentiment.py', options, function (
            err,
            results
        ) {
            if (err) {
                reject({ success: false, err });
            }
            resolve({ success: true, results });
        });
    });
}












// export async function getProductInfo(req, res, next) {
//     try {
//         var data = [
//             "Really cute piece, but it's huge. i ordered an xxs petite and it was unfortunately extremely wide and not flattering. returning.",
//             "I don't normally review my purchases, but i was so amazed at how poorly this dress was made, i couldn't help myself but to post a review. the neck line isn't even hemmed down so it flaps up. the material is thin and feel cheap. this dress isnt even worth $20 in my opinion. i was expecting a well made, good quality dress for the high price tag.",
//             "I hate You",
//             "It was bad movie i saw and west of money"
//         ]
//         var results = [];
//         // var results = await twitterClient.tweets.search({ q: 'wtc' });
//         for (let text of data) {
//             let response = await getPolarityFromPyScript(text);
//             if (response.success) {
//                 results.push({ text: text, sentiment: response.results[0] });
//             }

//         }

//         return res.success("working :)", results)
//     } catch (error) {
//         return res.error("Error While fetching Product Info")
//     }
// }


