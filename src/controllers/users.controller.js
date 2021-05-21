import { PythonShell } from 'python-shell';
import { TwitterClient } from 'twitter-api-client';

const twitterClient = new TwitterClient({
    apiKey: 'AL6gbsMB82UaB2aJTqRhfnJ0N',
    apiSecret: '5kG5TYeLWzlFo4YKyQCxbfSXiSdoqEWOFWzF5kfI3o3SBoNspV',
    accessToken: '1330790482952089603-YVxAtEAcuI7ETQnujjHUxhSgJEN4Yg',
    accessTokenSecret: 'ONFjOYmL5755e9KxGWnFzQNXkG1IXFEx8iZoT8LQGPk08',
});

export async function getProductInfo(req, res, next) {
    try {

        // var data = [
        //     "Really cute piece, but it's huge. i ordered an xxs petite and it was unfortunately extremely wide and not flattering. returning.",
        //     "I don't normally review my purchases, but i was so amazed at how poorly this dress was made, i couldn't help myself but to post a review. the neck line isn't even hemmed down so it flaps up. the material is thin and feel cheap. this dress isnt even worth $20 in my opinion. i was expecting a well made, good quality dress for the high price tag.",
        //     "I hate You",
        //     "It was bad movie i saw and west of money"
        // ]
        var results = await twitterClient.tweets.search({ q: 'wtc' });
        // for (let text of data) {
        //     let response = await getPolarityFromPyScript(text);
        //     if (response.success) {
        //         results.push({ text: text, sentiment: response.results[0] });
        //     }

        // }

        return res.success("working :)", results)
    } catch (error) {
        return res.error("Error While fetching Product Info")
    }
}


export async function getPolarityFromPyScript(text) {
    let sentiment;
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