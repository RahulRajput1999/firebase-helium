const functions = require('firebase-functions');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongo = require('mongoose');

const app = express();

const userSchema = mongo.Schema({
	email: String,
	username: String,
	dob: String,
	password: String,
});
const User = mongo.model("User", userSchema);

const sessionSchema = mongo.Schema({
	sessionID: String,
	userID: String,
	userName: String,
});
const Session = mongo.model("Session", sessionSchema);
const topicSchema = mongo.Schema({
	name: String,
});
const Topic = mongo.model("Topic", topicSchema);
const questionSchema = mongo.Schema({
	question: String,
	description: String,
	topic_ids: [String],
	date: String,
	user_id: String,
	up_votes: Number,
	down_votes: Number,
});
const Question = mongo.model("Question", questionSchema);
// Connecting to mongodb server.
const promise = mongo.connect('mongodb://admin:admin123@ds151523.mlab.com:51523/helium', { useNewUrlParser: true });
//console.log(promise);

// Cross Origin Resource Sharing filter to communicate between angular cli and node js.
app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors({ origin: true }));
app.use(session({ secret: "Your secret key" }));

app.get('/test', function (req, res) {
	res.write('Test successful! ch4');
	res.end();
});

app.post('/test', function (req, res) {
	//console.log(req.body.queryResult['action']);
	var action = req.body.queryResult['action'];
	var lang = req.body.queryResult['languageCode'];
	if (lang == 'hi') {
		if (action == 'input.welcome') {
			var response = {
				"payload": {
					"google": {
						"expectUserResponse": true,
						"richResponse": {
							"items": [
								{
									"simpleResponse": {
										"textToSpeech": "क्या मेरे द्वारा आपकी कोई सहायता हो सकती है?"
									}
								}
							],
							"suggestions": [
								{
									"title": "बीएमआई की गणना करें"
								},
								{
									"title": "उच्च प्रोटीन भोजन"
								},
								{
									"title": "उच्च फाइबर भोजन"
								}
							],
							"linkOutSuggestion": {
								"destinationName": "Suggestion Link",
								"url": "https://assistant.google.com/"
							}
						}
					}
				}
			}
			res.json(response);
			res.end();
		}
		else if (action == 'BMI.BMI-custom.BMI-weight-custom') {
			var weight = req.body.queryResult.outputContexts[0].parameters.unitweight;
			var length = req.body.queryResult.outputContexts[0].parameters.unitlength;
			if (weight.unit == "lb") {
				weight.unit = "kg";
				weight.amount = weight.amount / (2.205);
			}
			if (length.unit == "inch") {
				length.unit = "cm";
				length.amount = length.amount * (2.54);
			}
			if (length.unit == "ft") {
				length.unit = "cm";
				length.amount = length.amount * (30.48);
			}
			if (length.unit == "m") {
				length.unit = "cm";
				length.amount = length.amount * 100;
			}
			if (weight.unit == "kg" && length.unit == "cm") {
				var bmi = (10000 * weight.amount) / ((length.amount) * (length.amount));
				var bmi = bmi.toFixed(2);
				console.log(bmi);
			}
			var text;
			var suggestions;
			if (bmi <= 25 && bmi >= 18) {
				text = 'वाह, आपका बीएमआई ' + bmi + ' है, जो फिट रेंज में है!!';
				suggestions = [
					{
						"title": "उच्च प्रोटीन भोजन"
					},
					{
						"title": "संतुलित आहार"
					}
				];
			}
			else if (bmi < 18 && bmi >= 8) {
				text = 'आपका बीएमआई ' + bmi + ' ,जो कम वजन की सीमा में है!';
				suggestions = [
					{
						"title": "उच्च प्रोटीन भोजन"
					},
					{
						"title": "वजन बढ़ाने के लिए आहार"
					}
				];
			}
			else if (bmi < 8) {
				text = 'अब यह थोड़ा संदिग्ध लग रहा है, क्योंकि अब तक का सबसे कम बीएमआई 7.5 दर्ज किया गया है और आपका बीएमआई' + bmi + ' है।';
				suggestions = [
					{
						"title": "बीएमआई की गणना करें"
					},
					{
						"title": "वजन बढ़ाने के लिए आहार"
					}
				];
			}
			else if (bmi > 25 && bmi < 30) {
				text = 'आपका बीएमआई ' + bmi + ' है, जो अधिक वजन सीमा में है!';
				suggestions = [
					{
						"title": "उच्च फाइबर भोजन"
					},
					{
						"title": "उच्च प्रोटीन भोजन"
					},
					{
						"title": "वजन कम करने के लिए आहार"
					},
					{
						"title": "वजन कम करने के लिए एक्सरसाइज"
					}
				];
			}
			else if (bmi >= 30) {
				text = 'आपका बीएमआई ' + bmi + ' है, जो मोटापे की श्रेणी में है!';
				suggestions = [
					{
						"title": "उच्च फाइबर भोजन"
					},
					{
						"title": "वजन कम करने के लिए आहार"
					},
					{
						"title": "वजन कम करने की एक्सरसाइज"
					}
				];
			}
			var response = {
				"payload": {
					"google": {
						"expectUserResponse": true,
						"richResponse": {
							"items": [
								{
									"simpleResponse": {
										"textToSpeech": text
									}
								}
							],
							"suggestions": suggestions,
							"linkOutSuggestion": {
								"destinationName": "Suggestion Link",
								"url": "https://assistant.google.com/"
							}
						}
					}
				}
			}
			res.json(response);
			res.end();
		}
	} else {
		if (action == 'input.welcome') {
			var response = {
				"payload": {
					"google": {
						"expectUserResponse": true,
						"richResponse": {
							"items": [
								{
									"simpleResponse": {
										"textToSpeech": "What can i do for you?"
									}
								}
							],
							"suggestions": [
								{
									"title": "Calculate BMI"
								},
								{
									"title": "Suggest high protein food"
								},
								{
									"title": "Suggest high fiber food"
								}
							],
							"linkOutSuggestion": {
								"destinationName": "Suggestion Link",
								"url": "https://assistant.google.com/"
							}
						}
					}
				}
			}
			res.json(response);
			res.end();
		}
		else if (action == 'BMI.BMI-custom.BMI-weight-custom') {
			var weight = req.body.queryResult.outputContexts[0].parameters.unitweight;
			var length = req.body.queryResult.outputContexts[0].parameters.unitlength;
			if (weight.unit == "lb") {
				weight.unit = "kg";
				weight.amount = weight.amount / (2.205);
			}
			if (length.unit == "inch") {
				length.unit = "cm";
				length.amount = length.amount * (2.54);
			}
			if (length.unit == "m") {
				length.unit = "cm";
				length.amount = length.amount * 100;
			}
			if (length.unit == "ft") {
				length.unit = "cm";
				length.amount = length.amount * (30.48);
			}
			if (weight.unit == "kg" && length.unit == "cm") {
				var bmi = (10000 * weight.amount) / ((length.amount) * (length.amount));
				var bmi = bmi.toFixed(2);
				console.log(bmi);
			}
			var text;
			var suggestions;
			if (bmi <= 25 && bmi >= 18) {
				text = 'Wow its great, your BMI is ' + bmi + ' which is in a fit range!!';
				suggestions = [
					{
						"title": "Suggest high protein food"
					},
					{
						"title": "Balanced diet to stay fit"
					}
				];
			}
			else if (bmi < 18 && bmi >= 8) {
				text = 'Your BMI is ' + bmi + ', which is in under weight range!';
				suggestions = [
					{
						"title": "Suggest high protein food"
					},
					{
						"title": "Diet to gain weight"
					}
				];
			}
			else if (bmi < 8) {
				text = 'Now that looks a bit suspicious, because the lowest BMI recorded till date is 7.5 and yours is ' + bmi + '.';
				suggestions = [
					{
						"title": "Calculate BMI"
					},
					{
						"title": "Diet to gain weight"
					}
				];
			}
			else if (bmi > 25 && bmi < 30) {
				text = 'Your BMI is ' + bmi + ', which is in over weight range!';
				suggestions = [
					{
						"title": "Suggest high fiber food"
					},
					{
						"title": "Suggest high protein food"
					},
					{
						"title": "Diet to lose weight"
					},
					{
						"title": "Excercise to lose weight"
					}
				];
			}
			else if (bmi >= 30) {
				text = 'Your BMI is ' + bmi + ', which is in obesity range!';
				suggestions = [
					{
						"title": "Suggest high fiber food"
					},
					{
						"title": "Diet to lose weight"
					},
					{
						"title": "Excercise to lose weight"
					}
				];
			}
			var response = {
				"payload": {
					"google": {
						"expectUserResponse": true,
						"richResponse": {
							"items": [
								{
									"simpleResponse": {
										"textToSpeech": text
									}
								}
							],
							"suggestions": suggestions,
							"linkOutSuggestion": {
								"destinationName": "Suggestion Link",
								"url": "https://assistant.google.com/"
							}
						}
					}
				}
			}
			res.json(response);
			res.end();
		}
	}

});

app.post('/login', function (req, res) {
	console.log('Entered login:');
	const userInfo = req.body;
	if (!userInfo.username || !userInfo.password) {
		res.json({ status: false, msg: 'All fields are mercenary' });
		console.log('l1');
		res.end();
	} else {
		User.find({ username: userInfo.username }, function (err, user) {
			if (user.length <= 0) {
				res.json({ status: false, msg: 'Wrong Username or Password' });
				res.end();
			} else {
				console.log(user);
				if (user[0].password.match(userInfo.password)) {
					var date = new Date();
					var t = date.getMilliseconds();
					var sessID = t.toString() + user[0]._id;
					const newSession = new Session({
						sessionID: sessID,
						userID: user[0]._id,
						userName: user[0].username
					});
					newSession.save(function (err, data) {
						if (err) {
							console.log(err);
						} else {
							console.log(data);
						}
					});
					res.json({ status: true, msg: 'Successfully logged in', sessionID: sessID });
					res.end();
				} else {
					res.json({ status: false, msg: 'Wrong Username or Password' });
					res.end();
				}
			}
		});
	}

});
//User.collection.drop();
//Session.collection.drop();
// get the user session if exists
app.post('/getSession', function (req, res) {
	const sessionID = req.body;
	if (sessionID.sessionID) {
		Session.find({ sessionID: sessionID.sessionID }, function (err, session) {
			if (err) {
				console.log('error' + err);
				res.end();
			} else {
				if (session.length > 0) {
					res.json({ status: true, session: session[0] });
				} else {
					res.json({ status: false });
				}
				res.end();
			}
		});
	} else {
		res.json({ status: false });
		res.end();
	}
});
// Get the whole user object according to session data.
app.post('/getUser', function (req, res) {
	const sessionID = req.body.sessionID;
	if (sessionID) {
		Session.find({ sessionID: sessionID }, function (err, data) {
			if (err) {
				console.log(err);
			} else {
				let session = data[0];
				if (session) {
					User.find({ _id: session.userID }, function (err, data) {
						if (err) {
							console.log(err);
						} else {
							res.json({ status: true, user: data[0] });
							res.end();
						}
					})
				}
			}
		});
	}
});

// log-off the user from the server, remove the session from database.
app.post('/destroySession', function (req, res) {
	const sessionID = req.body;
	if (sessionID.sessionID) {
		Session.remove({ sessionID: sessionID.sessionID }, function (err, data) {
			if (err) {
				console.log(err);
				res.end();
			} else {
				res.json({ status: true });
				res.end();
			}
		});
	} else {
		res.json({ status: false });
		res.end();
	}
});

// router for post request of sign up page
app.post('/postuser', function (req, res) {
	const userInfo = req.body;
	if (!userInfo.email || !userInfo.username || !userInfo.dob || !userInfo.password) {
		res.json({ status: false, msg: 'All fields are mercenary' });
		console.log('l1');
		console.log(userInfo.email + '|' + userInfo.username + '|' + userInfo.dob + '|' + userInfo.password);
		res.end();
	} else {
		let count = 0;
		User.find({ username: userInfo.username }, function (err, users) {
			count = users.length;
			console.log(count);
			if (count <= 0) {
				const newUser = new User({
					email: userInfo.email,
					username: userInfo.username,
					dob: userInfo.dob,
					password: userInfo.password
				});
				newUser.save(function (err, data) {
					if (err) {
						res.json({ status: false, msg: 'Something went wrong' });
						console.log('l2');
						res.end();
					} else {
						res.json({ status: true, msg: 'Done' });
						res.end();
					}
				});
			} else {
				res.json({ status: false, msg: 'User already exists' });
				console.log('false-l3');
				res.end();
			}
		});
	}
});
//Question.collection.drop();
//POst request route for posting the question.
app.post('/postQuestion', function (req, res) {
	const q = req.body;
	console.log(q);
	let i;
	let topics = [];
	for (i = 0; i < q.tags.length; i++) {
		topics[i] = q.tags[i].name;
	}
	const d = new Date();
	console.log(topics);
	let userID;
	Session.findOne({ sessionID: q.sessionID }).exec(function (err, data) {
		userID = data.userID;
		const newQue = new Question({
			question: q.question,
			description: q.description,
			topic_ids: topics,
			date: d.toString(),
			user_id: userID,
			up_votes: 0,
			down_votes: 0,
		});
		newQue.save();
	});
	Question.find({}, function (err, data) {
		res.json({ data: data });
		res.end();
	});

});

// To get all the questions.
app.get('/getQuestions', function (req, res) {
	Question.find({}, function (err, data) {
		if (err) {
			console.log(err);
		} else {
			res.json({ questions: data });
			res.end();
		}
	});
});

// To get questions according to their topic tags.
app.post('/getQuestions', function (req, res) {
	const tag = req.body.tag;
	if (tag) {
		Question.find({ topic_ids: tag }, function (err, data) {
			if (err) {
				console.log(err);
			} else {
				res.json({ status: true, questions: data });
				res.end();
			}
		});
	} else {
		res.json({ status: false });
		res.end();
	}
});

// To get question according one unique id.
app.post('/getQuestion', function (req, res) {
	const id = req.body.id;
	if (id) {
		Question.find({ _id: id }, function (err, data) {
			if (err) {
				console.log(err);
			} else {
				if (data.length > 0) {
					res.json({ status: true, question: data[0] });
					res.end();
				} else {
					res.json({ status: false });
					res.end();
				}
			}
		})
	}
});
exports.app = functions.https.onRequest(app);
