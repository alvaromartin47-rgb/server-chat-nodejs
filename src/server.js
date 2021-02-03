import express from 'express';
import http from 'http';
import cors from 'cors';
import { graphqlHTTP } from 'express-graphql';

const app = express();
app.use(cors);
const server = http.createServer(app);

const schema = {};

// app.get("/", (req, res) => {
//     res.json({
//         message:"hola"
//     })
// });

// app.use(express.static("/home/alvaro/Escritorio/fronted-react/build"));

app.use("/graphql", graphqlHTTP({
    graphiql: true,
    schema: schema
}));

export default server;