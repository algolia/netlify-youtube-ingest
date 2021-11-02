
import React from 'react';
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch-dom';
const searchClient = algoliasearch(process.env.SNOWPACK_PUBLIC_ALGOLIA_APP_ID, process.env.SNOWPACK_PUBLIC_ALGOLIA_SEARCH_KEY);
const Hit = ({ hit }) => <p>{hit.title}</p>;


const Search = () => {
  return (
    <InstantSearch searchClient={searchClient} indexName={process.env.VIDEO_INDEX}>
        <SearchBox />
        <Hits hitComponent={Hit} />
    </InstantSearch>
  )
}

export default Search;