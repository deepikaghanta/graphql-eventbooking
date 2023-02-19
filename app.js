const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql").graphqlHTTP;
const { buildSchema } = require("graphql");

const bcrypt = require("bcryptjs");

const app = express();
const mongoose = require("mongoose");

const Event = require("./models/event");
const User = require("./models/user");
app.use(bodyParser.json());

/*app.get('/',(req,res,next)=>{
    res.send('Hello World!');
})*/

app.use(
  "/graphql",
  graphqlHttp({
    schema: buildSchema(`
    type Event{
        _id: ID!
        title: String!
        description: String!
        price: Float!
        date: String!
    }

    type User {
        _id: ID!
        email: String!
        password: String
    }
    input EventInput {
        title: String!
        description: String!
        price: Float!
        date: String!
    }
    input UserInput{
        email:String! 
        password: String!
    }

    type RootQuery {
        events : [Event!]!

    }
    type RootMutation {
        createEvent(eventInput: EventInput):Event
        createUser(userInput: UserInput): User

    }
    schema{
        query: RootQuery
        mutation: RootMutation 
    }`),
    /**In the above for type user,   */
    rootValue: {
      events: () => {
        return Event.find()
          .then((events) => {
            return events.map((event) => {
              return {
                ...event._doc,
                _id: event._doc._id.toString(),
              }; /** _id:event._doc._id.toString() -
               this is not required as somehow graphql 
               is understanding that id is a string*/
            });
          })
          .catch((err) => {
            throw err;
          });
      },
      createEvent: (args) => {
        const event = new Event({
          title:
            args.eventInput
              .title /*Just args.title wont work cause its a nested obj, so use this instead */,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date),
          creator: "63f25f017526e776bc0a531d",
        });
        let createdEvent;
        return event
          .save()
          .then((result) => {
            createdEvent = { ...result._doc };
            return User.findById("63f25f017526e776bc0a531d");
          })
          .then((user) => {
            if (!user) {
              throw new Error("User not found");
            }
            user.createdEvents.push(event);
            return user.save();
          })
          .then((result) => {
            return createdEvent;
          })
          .catch((err) => {
            console.log(err);
            throw err;
          });
        /* event which is created is returned not the entire array */
      },
      createUser: (args) => {
        /* below then throws an error if an user is creating email
        that already exists, otherwise it takes the hash of password and 
        goes to next then block, takes the email and password and stores it in 
        the DB */
        User.findOne({ email: args.userInput.email })
          .then((user) => {
            if (user) {
              throw new Error("User exists already");
            }
            return bcrypt.hash(args.userInput.password, 12);
          })
          .then((hashedPassword) => {
            const user = new User({
              email: args.userInput.email,
              password: hashedPassword,
            });
            return user.save();
          })
          .then((result) => {
            return { ...result._doc, password: null }; /*password:null here 
            is the passowrd you see in GraphiQL interface. To hide it, we just return 
            null irrespective of what the user created*/
          })
          .catch((err) => {
            throw err;
          });
      },
    },
    graphiql: true,
  })
);
mongoose
  .connect(
    `mongodb+srv://deepika156:hhTvAwJ7yMCk6U6Y@cluster0.01n3cth.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(3000); /*Start the server if succeeded */
  })
  .catch((err) => {
    console.log(err); /*else throw an error */
  });
