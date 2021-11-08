
import React from 'react';
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, Configure, Pagination, SearchBox, Hits, Snippet, Highlight } from 'react-instantsearch-dom';
import Styles from './InstantSearch.module.css'
const searchClient = algoliasearch(import.meta.env.VITE_ALGOLIA_APP_ID, import.meta.env.VITE_ALGOLIA_SEARCH_KEY);
const Hit = ({ hit }) => {
  return (
    <div className={Styles.hit}>
      <h3><a href={`https://www.youtube.com/watch?v=${hit.objectID}`}><Highlight hit={hit} attribute="title" /></a></h3>
      <p><Snippet hit={hit} attribute="description" /></p>
      <p>Current Likes: {hit.likes} | Current Views: {hit.viewCount}</p>
      <p>Tags: <Highlight attribute='tags' hit={hit} /></p>
    </div>
)};


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