const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const database = require("./config/db");
const userRoute = require("./Routes/userRoute");
const articleRoute = require("./Routes/articleRoute");
const error = require("./Middlewares/error");
const cors = require("cors");


const app = express();
const port = process.env.PORT || 7860;

//dotenv config.
dotenv.config({ path: ".env" });

//Enable cookie-parser.
app.use(cookieParser());

// Define the allowed origins in an array
const allowedOrigins = ['https://blog-zo8s.vercel.app', 'http://65.21.198.80:3000/', 'https://stashify-app.vercel.app/'];

// Configure CORS middleware with options to allow only specified origins
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

//Enable cors for making policies.
app.use(cors(corsOptions));

//body-parser to parse the data from body in POST method.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//calling database for initialization.
database();

//Using router.
app.use('/app/v1',userRoute);
app.use('/app/v2',articleRoute);

app.get('/',(req,res)=>{
  res.status(200).json({
    success:true,
    message:`Server is working at port ${port}`
  })
})

//Handling error when user request for invalid route.
app.all('*',(req,res)=>{
  let statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: `Requested URL ${req.path} not found!`,
    stack: err.stack,
  });
});

//NodeJS uncaught error handler.
app.use(error);

app.listen(port, () => {
  console.log(`Server is working on ${port}`);
});
