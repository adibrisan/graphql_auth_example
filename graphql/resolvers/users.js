const User = require("../../models/User");
const { ApolloError } = require("apollo-server");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = {
  Mutation: {
    async registerUser(_, { registerInput: { username, email, password } }) {
      const checkUser = await User.findOne({ email });
      //check if we have an user with this email
      if (checkUser) {
        throw new ApolloError(
          "A user is already registred with this email.",
          "USER_ALREADY_EXISTS"
        );
      }
      //encrypt password
      const encryptedPassword = await bcrypt.hash(password, 10);
      //create new mongodb user
      const newUser = new User({
        username,
        email: email.toLowerCase(),
        password: encryptedPassword,
      });
      //assign jwt token
      const token = jwt.sign(
        {
          user_id: newUser._id,
          email,
        },
        "SECRET_STRING",
        { expiresIn: "10h" }
      );

      newUser.token = token;
      //save user in db
      const res = await newUser.save();

      return {
        id: res.id,
        ...res._doc,
      };
    },
    async loginUser(_, { loginInput: { email, password } }) {
      const checkUser = await User.findOne({ email });

      if (checkUser && bcrypt.compare(password, checkUser.password)) {
        const token = jwt.sign(
          {
            user_id: checkUser._id,
            email,
          },
          "SECRET_STRING",
          { expiresIn: "10h" }
        );
        checkUser.token = token;

        return {
          id: checkUser.id,
          ...checkUser._doc,
        };
      } else {
        throw new ApolloError("Incorrect password", "INCORRECT_PASSWORD");
      }
    },
  },
  Query: {
    user: (_, { ID }) => User.findById(ID),
  },
};
