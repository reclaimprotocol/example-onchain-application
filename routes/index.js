var express = require('express');
var router = express.Router();
var { reclaimprotocol } = require('@reclaimprotocol/reclaim-sdk');
 
const reclaim = new reclaimprotocol.Reclaim();
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/request-proofs", async(req, res) => {
    const request = reclaim.requestProofs({
        title: "My Company Uniswap Pool", // Name of your application
        baseCallbackUrl: "http://bot.questbook.xyz:3008/callback", 
        callbackId: req.query.address, // optional
        contextMessage: "Company Uniswap Pools", //optional
        contextAddress: req.query.address, //optional
        requestedProofs: [
            new reclaim.CustomProvider({
                provider: 'google-login',
                payload: {}
            }),
        ],
    });
 
    const { callbackId } = request;
    const reclaimUrl = await request.getReclaimUrl();
    // Store the callback Id and Reclaim URL in your database
    // ...
    res.json({ reclaimUrl });
     // display this reclaimUrl as a QR code on laptop or as a link on mobile devices for users to initiate creating proofs
});

//router.use(express.text({ type: "*/*" }));
 
router.post("/callback", async (req, res) => {
  console.log(req.body);
  const body = Object.keys(req.body)[0];
  console.log(body);
  try {
    // Retrieve the callback ID from the URL parameters
    const callbackId = req.query.callbackId;
 
    // Retrieve the proofs from the request body
    const proofs = reclaimprotocol.utils.getProofsFromRequestBody(body)
 
    // Verify the correctness of the proofs (optional but recommended)
    const isProofsCorrect = await reclaim.verifyCorrectnessOfProofs(callbackId, proofs);
 
    if (isProofsCorrect) {
      // Proofs are correct, handle them as needed
      // ... business logic goes here
 
      // Respond with a success message
      res.json({ success: true });
    } else {
      // Proofs are not correct or verification failed
      // ... handle the error accordingly
 
      // Respond with an error message
      res.status(400).json({ error: "Proofs verification failed" });
    }
  } catch (error) {
    console.error("Error processing callback:", error);
    res.status(500).json({ error: "Failed to process callback" });
  }
});



module.exports = router;
