const graphql = require("graphql");
const Course = require("../models/course");
const Professor = require("../models/professor");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const auth = require("../utils/auth");
const jwt = require("jsonwebtoken");

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLSchema,
  GraphQLList
} = graphql;

/* let courses = [
  {
    id: "1",
    name: "Patrones diseño Java",
    language: "Java",
    date: "2020",
    professorId: "1"
  },
  {
    id: "2",
    name: "Patrones diseño Javascript",
    language: "Javascript",
    date: "2021",
    professorId: "1"
  },
  {
    id: "3",
    name: "Patrones diseño PHP",
    language: "PHP",
    date: "2022",
    professorId: "2"
  },
  {
    id: "4",
    name: "Patrones diseño GO",
    language: "Go",
    date: "2021",
    professorId: "3"
  },
  {
    id: "5",
    name: "Patrones diseño Phyton",
    language: "Phyton",
    date: "2020",
    professorId: "4"
  }
];

let professors = [
  { id: "1", name: "Ruben", age: 40, active: true, date: 2020 },
  { id: "2", name: "Paco", age: 30, active: true, date: 2021 },
  { id: "3", name: "Juan", age: 34, active: true, date: 2023 },
  { id: "4", name: "Silvia", age: 45, active: true, date: 2024 },
  { id: "5", name: "Maria", age: 39, active: true, date: 2024 }
]; */

/* let users = [
  { id: "1", name: "Ruben", email: "a@a.com", password: "1234", date: 2020 },
  { id: "2", name: "Ana", email: "b@a.com", password: "1234", date: 2021 },
  { id: "3", name: "Paco", email: "c@a.com", password: "1234", date: 2020 },
  { id: "4", name: "Laura", email: "d@a.com", password: "1234", date: 2022 }
]; */

const CourseType = new GraphQLObjectType({
  name: "Course",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    language: { type: GraphQLString },
    date: { type: GraphQLString },
    professor: {
      type: ProfessorType,
      resolve(parent, args) {
        // return professors.find( professor => professor.id === parent.professorId );
        return Professor.findById(parent.professorId);
      }
    }
  })
});

const ProfessorType = new GraphQLObjectType({
  name: "Professor",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    age: { type: GraphQLInt },
    active: { type: GraphQLBoolean },
    date: { type: GraphQLString },
    course: {
      type: new GraphQLList(CourseType),
      resolve(parent, args) {
        // return courses.filter(course => course.professorId === parent.id);
        return Course.find({ professorId: parent.id });
      }
    }
  })
});

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
    date: { type: GraphQLString }
  })
});

const MessageType = new GraphQLObjectType({
  name: "Message",
  fields: () => ({
    message: { type: GraphQLString },
    token: { type: GraphQLString },
    error: { type: GraphQLString }
  })
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    course: {
      type: CourseType,
      args: {
        id: { type: GraphQLID }
      },
      resolve(parent, args, context) {
        // return courses.find(course => course.id === args.id);
        if (!context.user.auth) {
          throw new Error("No autenticado");
        }
        return Course.findById(args.id);
      }
    },
    courses: {
      type: new GraphQLList(CourseType),
      resolve(parent, args) {
        // return courses;
        return Course.find();
      }
    },
    professor: {
      type: ProfessorType,
      args: {
        name: { type: GraphQLString }
      },
      resolve(parent, args) {
        // return professors.find(professor => professor.name === args.name);
        return Professor.findOne({ name: args.name });
      }
    },
    professors: {
      type: new GraphQLList(ProfessorType),
      resolve(parent, args) {
        // return professors;
        return Professor.find();
      }
    },
    user: {
      type: UserType,
      args: {
        email: { type: GraphQLString }
      },
      resolve(parent, args) {
        return users.find(user => user.email === args.email);
      }
    },
    user: {
      type: new GraphQLList(UserType),
      resolve(parent, args) {
        return users;
      }
    }
  }
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addCourse: {
      type: CourseType,
      args: {
        name: { type: GraphQLString },
        language: { type: GraphQLString },
        date: { type: GraphQLString },
        professorId: { type: GraphQLID }
      },
      resolve(parent, args) {
        let course = new Course({
          name: args.name,
          language: args.language,
          date: args.date,
          professorId: args.professorId
        });
        return course.save();
      }
    },
    updateCourse: {
      type: CourseType,
      args: {
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        language: { type: GraphQLString },
        date: { type: GraphQLString },
        professorId: { type: GraphQLID }
      },
      resolve(parent, args) {
        return Course.findByIdAndUpdate(
          args.id,
          {
            name: args.name,
            language: args.language,
            date: args.date,
            professorId: args.professorId
          },
          { new: true }
        );
      }
    },
    deleteCourse: {
      type: CourseType,
      args: {
        id: { type: GraphQLID }
      },
      resolve(parent, args) {
        return Course.findByIdAndDelete(args.id);
      }
    },
    deleteAllCourses: {
      type: CourseType,
      resolve(parent, args) {
        return Course.deleteMany({});
      }
    },
    addProfessor: {
      type: ProfessorType,
      args: {
        name: { type: GraphQLString },
        age: { type: GraphQLInt },
        active: { type: GraphQLBoolean },
        date: { type: GraphQLString },
        professorId: { type: GraphQLID }
      },
      resolve(parent, args) {
        return Professor(args).save();
      }
    },
    updateProfessor: {
      type: ProfessorType,
      args: {
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        age: { type: GraphQLInt },
        active: { type: GraphQLBoolean },
        date: { type: GraphQLString }
      },
      resolve(parent, args) {
        return Professor.findOneAndUpdate(
          args.name,
          {
            name: args.name,
            age: args.age,
            active: args.active,
            date: args.date
          },
          { new: true }
        );
      }
    },
    deleteProfessor: {
      type: ProfessorType,
      args: {
        name: { type: GraphQLString }
      },
      resolve(parent, args) {
        return Professor.findOneAndRemove(args.name);
      }
    },
    addUser: {
      type: MessageType,
      args: {
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        date: { type: GraphQLString }
      },
      async resolve(parent, args) {
        let user = await User.findOne({ email: args.email });
        if (user) return { error: "El usuario ya existe en la base de datos" };
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(args.password, salt);
        user = new User({
          name: args.name,
          email: args.email,
          date: args.date,
          password: hashPassword
        });
        user.save();
        return { message: "Usuario registrado correctamente" };
      }
    },
    updateUser: {
      type: UserType,
      args: {
        id: { type: GraphQLID },
        name: { type: GraphQLString }
      },
      resolve(parent, args, context) {
        // return courses.find(course => course.id === args.id);
        if (!context.user.auth) {
          throw new Error("No autenticado");
        }
        if (context.user._id !== args.id) {
          throw new Error("No tiene permiso para modificar este usuario");
        }
        return User.findByIdAndUpdate(
          args.id,
          {
            name: args.name
          },
          { new: true }
        );
      }
    },
    login: {
      type: MessageType,
      args: {
        email: { type: GraphQLString },
        password: { type: GraphQLString }
      },
      async resolve(parent, args) {
        const result = await auth.login(
          args.email,
          args.password,
          process.env.SECRET_KEY_JWT_COURSE_API
        );
        return {
          message: result.message,
          error: result.error,
          token: result.token
        };
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});
