1. Consider switching from xmlbuilder2 to htmlparser2 for xml parsing.
   1. xmlbuilder2 is premature.
   2. htmlparser2 has working demo of feedparsing.
   3. htmlparser2 is at ast level. Require additional abstraction work.


Parser architecture
```
feed: FeedObjectResolver
   title: TitleFieldResolver
   link: LinkFieldResolver
   items: ItemsMapper(ItemResolver)
```


```js

const atomFeed = {};
const rdfFeed = {};
const rssFeed = resolveObject(() => {
   return {
      title,
      link,
      items, 
   }
});

const title = resolveField((parent, root) => {
  return parent("title").text();
});

const items = arrayResolver(selectItems, resolveItem);

const selectItems = arraySelector((parent, root) => {
   return parent("items").children;
});

const resolveItem = resolveObject(() => {
   return {
      title,
      url,
      summary,
      content_html,
   }
});

function resolveField() {}



// extension system

// called in parallel with other json feed is being resolved
resolveField

// called after all json feed becomes available
resolveFieldFromJsonFeed


// A more declarative alternative design
csont rssFeedParser = define((root) => ({
   title: define(() => asText(root, "title")),
   link: define(() => asText(root, "link"))
   items: define(() => asArray(root, "items")).map(i => define(i => ({
      title: define(() => asText(parent), "title")
      content_html: define(() => asHtml(parent, "content:encoded")),
      content_text: define(() => fullbackStack([asText(parent, "content:encoded"), asText("description")]))
   })))
}))

// Minimalist API
csont rssFeedParser = {
   title: root("title").text(),
   link: root("link").text(),
   items: root("items").map(i => ({
      title: i("title").text(),
      content_html: priorityStack([
         i("content:encoded").html(),
         i("description").html(),
      ]),
      content_text: priorityStack([
         i("content:encoded").text(),
         i("description").text(),
      ])
   }))
}
```