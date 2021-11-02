
import React from 'react';
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, Configure, Pagination, SearchBox, Hits, Snippet, Highlight } from 'react-instantsearch-dom';
const searchClient = algoliasearch(import.meta.env.VITE_ALGOLIA_APP_ID, import.meta.env.VITE_ALGOLIA_SEARCH_KEY);
const Hit = ({ hit }) => (
    <div className="hit">
    <h3><Highlight hit={hit} attribute="title" /></h3>
    <p><Snippet hit={hit} attribute="description" /></p>
    </div>
);


const Search = () => {
  return (
    <InstantSearch searchClient={searchClient} indexName={import.meta.env.VITE_VIDEO_INDEX}>
        <Configure 
            attributesToSnippet={['description']} 
            hitsPerPage={10}
        />
        <SearchBox />
        <Hits hitComponent={Hit} />
        <Pagination />
    </InstantSearch>
  )
}

export default Search;