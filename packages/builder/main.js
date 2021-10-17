async function build() {
  const server = require("./dist/server/entry-server");
  console.log(await server.render());
}

build();
