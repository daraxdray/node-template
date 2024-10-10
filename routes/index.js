const express = require('express');
const router = express.Router();
const {index,fbFunction,verifyAndCreateToken, sendEmail} = require('../controllers')

router.route('/').get(index)
router.route('/test-fb').get(fbFunction)
router.route('/get-token').get(verifyAndCreateToken)
router.route('/send-email').post(sendEmail)


module.exports = router;