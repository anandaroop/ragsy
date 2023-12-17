import { Document } from "langchain/document";
import { BaseDocumentLoader } from "langchain/document_loaders/base";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

/**
 * Structured artist data exported from Gravity with the following snippet.
 *
 * ```ruby
 * data = Artist.p1.map do |a|
 *   b = a.blurb.presence || "No information for #{a.name}"
 *   md = RDiscount.new(b, :smart, :filter_html)
 *   htm = md.to_html
 *   txt = helper.sanitize(htm, tags: [])
 *   { name: a.name, slug: a.slug, id: a.id, blurb: b, blurb_html: htm, blurb_text: txt }
 * end
 *
 * puts JSON.pretty_generate(data)
 * ```
 *
 */
type Artist = {
  name: string;
  slug: string;
  id: string;
  blurb: string;
  blurb_html: string;
  blurb_text: string;
};


/**
 * Chunk exported artist data into document chunks.
 *
 * ```js
 * const chunker = new ArtistChunker("data/artists-p1.json");
 * const chunks = await chunker.chunk();
 * console.log(chunks);
 * ```
 */
export class ArtistChunker {
  _loader: ArtistLoader

  constructor(path: string) {
    this._loader = new ArtistLoader(path);
  }

  async chunk() {
    const docs = await this._loader.load();
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100,
    });
    const chunks = await splitter.splitDocuments(docs);
    chunks.map((chunk) => {
      chunk.pageContent = `ARTIST: ${chunk.metadata.name}\n\n---\n\n` + chunk.pageContent
    })
    return chunks;
  }
}

/**
 * Load Artist data from a JSON file.
 */
export class ArtistLoader extends BaseDocumentLoader {
  readonly _path: string;
  private data: Artist[];

  constructor(path: string) {
    super();
    this._path = path;
    this.data = [];
  }

  async load(): Promise<Document[]> {
    const file = Bun.file(this._path);
    this.data = await file.json();

    const docs = this.data.map((artist) => {
      return new Document({
        pageContent: artist.blurb_text,
        metadata: {
          name: artist.name,
          slug: artist.slug,
          id: artist.id,
        },
      });
    });

    return docs;
  }
}
