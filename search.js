search.addWidgets([
  instantsearch.widgets.searchBox({
    container: '#searchbox',
    placeholder: 'Search for videos',
  }),
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
        item: `
                <li>
                  <h2><a href="https://youtube.com/watch?v={{objectID}}">{{#helpers.highlight}}{ "attribute": "title" }{{/helpers.highlight}}</a></h2>
                </li>
            `

    }
  })
]);

search.start();
