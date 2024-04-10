# Ragsy

Tinkering with [Retrieval Augmented Generation](https://www.promptingguide.ai/techniques/rag) techniques over Artsy data.

- Chunking, prompting, and message history with [Langchain](https://www.langchain.com) ([TS flavor](https://js.langchain.com))
- Vectorizing with [OpenAI](https://platform.openai.com/docs/guides/embeddings)
- Persistence and nearest-neighbor searches with [pgvector](https://github.com/pgvector/pgvector)

## Setup

This uses [Bun](https://bun.sh) for its JS runtime, but you can probably make it work with whatever.

```sh
git clone git@github.com:anandaroop/ragsy.git
cd ragsy
cp .env.example .env # add OpenAI API key here
```

### Bring up docker env

In one terminal…

```sh
bun up
```

### Load some p1 artist data

In another terminal…

```sh
bun load
```

## Usage

Bring up the docker env 👆🏽 if you haven't already.

Start a chat session…

```sh
bun chat
```

## Example session

```
🎨 Name some famous impressionist artists

Some famous Impressionist artists include Pierre-Auguste Renoir, Pierre Bonnard,
and Camille Pissarro.

🎨 Tell me more about the second one

 Pierre Bonnard was a French artist and a founding member of the avant-garde
 Post-Impressionist group Les Nabis. His paintings feature bold color palettes
 and draw inspiration from artists like Paul Gauguin and Japanese woodcut prints.
 Bonnard's work often focuses on intimate urban and domestic scenes, emphasizing
 the hues and material qualities of his paint. His art has been exhibited in
 prestigious institutions worldwide and has sold for over $10 million on the
 secondary market.

🎨 Where has he exhibited?

 Pierre Bonnard has exhibited his artwork at the Museum of Modern Art, the Art
 Institute of Chicago, Tate Modern, and the Metropolitan Museum of Art, among others.

🎨 <Ctrl-C to quit>
```

And compare that to the data for Bonnard in `data/artists-p1.json` (which was
vectorized and inserted into PG in the earlier steps)