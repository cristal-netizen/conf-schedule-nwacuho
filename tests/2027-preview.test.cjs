const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const html = fs.readFileSync(
  path.join(__dirname, "../public/2027-preview/index.html"),
  "utf8",
);
const source = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1])
  .join("\n");

// Exercise the prototype's state transitions without a browser or dependencies.
function createPreview({ blockedStorage = false, stored = new Map() } = {}) {
  const elements = new Map();
  const handlers = new Map();
  const register = (key, fn) =>
    handlers.set(key, [...(handlers.get(key) || []), fn]);
  const get = (id) => {
    if (!elements.has(id))
      elements.set(id, {
        innerHTML: "",
        textContent: "",
        hidden: false,
        addEventListener: (event, fn) => register(`${id}:${event}`, fn),
        close() {
          this.open = false;
        },
        showModal() {
          this.open = true;
        },
        reset() {},
      });
    return elements.get(id);
  };
  const context = vm.createContext({
    document: {
      getElementById: get,
      querySelectorAll: () => [],
      querySelector: () => ({ value: "" }),
      addEventListener: (event, fn) => register(event, fn),
    },
    localStorage: {
      getItem(key) {
        if (blockedStorage) throw Error("Blocked");
        return stored.get(key) || null;
      },
      setItem(key, value) {
        if (blockedStorage) throw Error("Blocked");
        stored.set(key, value);
      },
    },
    setTimeout: () => 0,
    clearTimeout() {},
    FormData: class {
      constructor(form) {
        this.data = form.data;
      }
      get(key) {
        return this.data[key];
      }
      getAll(key) {
        return this.data[key] || [];
      }
    },
  });
  vm.runInContext(source, context);
  const run = (code) => vm.runInContext(code, context);
  const event = (key, value) =>
    (handlers.get(key) || []).forEach((fn) => fn(value));
  const click = (dataset) =>
    event("click", { target: { closest: () => ({ dataset }) } });
  return { get, run, event, click, stored };
}

test("directory searches institutions, filters roles, and prioritizes shared interests", () => {
  const app = createPreview();
  let markup = app.get("networkResults").innerHTML;
  assert.ok(markup.indexOf("Alex Lee") < markup.indexOf("Jamie Taylor"));
  app.run("state.networkQuery='Cedar Coast';renderNetworkResults()");
  markup = app.get("networkResults").innerHTML;
  assert.match(markup, /Jamie Taylor/);
  assert.doesNotMatch(markup, /Alex Lee/);
  app.run(
    "state.networkQuery='';state.networkRole='Operations';renderNetworkResults()",
  );
  assert.match(app.get("networkResults").innerHTML, /Riley Morgan/);
  assert.doesNotMatch(app.get("networkResults").innerHTML, /Jamie Taylor/);
});

test("connections can be added, reloaded, and removed without contacting an attendee", () => {
  const app = createPreview();
  app.click({ connect: "alex" });
  const reloaded = createPreview({ stored: app.stored });
  reloaded.click({ networkTab: "Connections" });
  assert.match(reloaded.get("networkResults").innerHTML, /Alex Lee/);
  assert.doesNotMatch(reloaded.get("networkResults").innerHTML, /Jamie Taylor/);
  reloaded.click({ connect: "alex" });
  assert.match(reloaded.get("networkResults").innerHTML, /No attendees/);
  for (const key of app.stored.keys())
    assert.ok(key.startsWith("nwacuho:2027-preview:"));
});

test("coffee invitations remain local drafts and escape entered content", () => {
  const app = createPreview();
  app.click({ coffee: "alex" });
  app.event("coffeeForm:submit", {
    preventDefault() {},
    target: {
      data: {
        when: "Feb 9 · Morning break",
        where: "<script>test</script>",
        message: "Coffee?",
      },
    },
  });
  const markup = app.get("networkResults").innerHTML;
  assert.match(markup, /Demo invitation · Not sent/);
  assert.match(markup, /&lt;script&gt;test&lt;\/script&gt;/);
  assert.doesNotMatch(markup, /<script>test/);
  const id = app.run("state.invites[0].id");
  app.click({ removeInvite: id });
  assert.match(
    app.get("networkResults").innerHTML,
    /A conversation can start with coffee/,
  );
});

test("community posts and replies display input as text and persist across visits", () => {
  const app = createPreview();
  app.event("postForm:submit", {
    preventDefault() {},
    target: {
      data: {
        title: "<img src=x onerror=alert(1)>",
        body: "Hello colleagues",
        category: "Questions",
      },
    },
  });
  assert.match(app.get("posts").innerHTML, /&lt;img/);
  assert.doesNotMatch(app.get("posts").innerHTML, /<img src=x/);
  const id = app.run("state.posts[1].id");
  app.click({ reply: id });
  app.event("submit", {
    preventDefault() {},
    target: { dataset: { replyForm: id }, data: { reply: "Welcome!" } },
  });
  assert.match(app.get("posts").innerHTML, /Welcome!/);
  const reloaded = createPreview({ stored: app.stored });
  assert.equal(reloaded.run("state.posts[1].replies[0].body"), "Welcome!");
});

test("saved sessions can be toggled and viewed independently of networking", () => {
  const app = createPreview();
  app.click({ view: "schedule" });
  app.click({ save: "s2" });
  app.click({ view: "saved" });
  assert.match(app.get("view").innerHTML, /Building teams/);
  app.click({ save: "s2" });
  assert.match(app.get("view").innerHTML, /blank canvas/);
});

test("blocked browser storage does not prevent networking interactions", () => {
  const app = createPreview({ blockedStorage: true });
  app.click({ connect: "alex" });
  app.click({ networkTab: "Connections" });
  assert.match(app.get("networkResults").innerHTML, /Alex Lee/);
});
