import { ArtistStore } from "./src/artist-store";

console.log("\nConnecting…\n");
const artists = await ArtistStore.connect();

console.log("Setting up chat…\n");
const chat = artists.asChat();

const query1= 'Name one artist from the Dada movement'
const response1 = await chat.send(query1)
console.log({query1, response1})

const query2= 'Tell me some more about their art'
const response2 = await chat.send(query2)
console.log({query2, response2})

const query3= 'Who are some similar artists?'
const response3 = await chat.send(query3)
console.log({query3, response3})

console.log("Done.")

await artists.close();
