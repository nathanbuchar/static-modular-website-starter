import contentfulClient from './contentful.js';

class Client {

  /**
   * Fetches entries from the CDN and returns them as a
   * key-value map.
   *
   * @static
   * @param {Source[]} sources
   * @returns {Promise<Data>}
   */
  static getData(sources) {
    return Promise.all([
      ...sources.map(({ name, contentType }) => {
        return (
          contentfulClient
            .getEntries({ content_type: contentType })
            .then((data) => {
              return [name, data.items];
            })
        );
      })
    ]).then((arr) => Object.fromEntries(arr));
  }
}

export default Client;