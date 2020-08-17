import React, { useState } from "react";
import "./App.css";
import { Waiter } from "./Waiter/Waiter";
import { WaiterProvider } from "./Waiter/WaiterProvider";
import { createStore } from "./Waiter/store";
import {
  createObject,
  deleteObject,
  getObject,
  getList,
  query,
  updateObject,
  updateList
} from "./Waiter/methods";

type User = {
  id: string;
  name: string;
};

const fetchUser = async (id: string): Promise<User> => {
  return await new Promise((resolve) =>
    setTimeout(() => resolve({ id, name: "UserName" }), 2000)
  );
};

const updateUsers = async (): Promise<User[]> => {
  return await new Promise((resolve) =>
    setTimeout(
      () =>
        resolve([
          { id: "user_1", name: "user_1" },
          { id: "user_2", name: "user_2" },
          { id: "user_3", name: "user_3" },
          { id: "user_4", name: "user_4" },
          { id: "user_5", name: "user_5" }
        ]),
      2000
    )
  );
};

const fetchUsers = async (): Promise<User[]> => {
  return await new Promise((resolve) =>
    setTimeout(
      () =>
        resolve([
          { id: "user_1", name: "user_1" },
          { id: "user_2", name: "user_2" },
          { id: "user_3", name: "user_3" }
        ]),
      2000
    )
  );
};

async function updateUser(id: string): Promise<User> {
  return await new Promise((resolve) =>
    setTimeout(() => {
      const newUser = { id, name: "UserName" + Math.random() };
      resolve(newUser);
    }, 2000)
  );
}

async function deleteUser(id: string) {
  return (await new Promise((resolve) =>
    setTimeout(() => resolve({ success: "Message" }), 2000)
  )) as { success: string };
}

const Loader = () => <div style={{ color: "gold" }}>Loading</div>;
const Errors = (errors: Error[]) => (
  <div style={{ color: "red" }}>{errors.map((e) => e.toString())}</div>
);

const userNameSelector = (user: User) => user.name;

const store = createStore();

store.subscribeData(console.info);
store.subscribeMeta(console.info);

function App() {
  const [active, setActive] = useState("basic");

  return (
    <WaiterProvider store={store}>
      <ul>
        <li onClick={() => setActive("basic")}>Basic</li>
        <li onClick={() => setActive("cache")}>Cache</li>
        <li onClick={() => setActive("error")}>Error</li>
        <li onClick={() => setActive("mutations")}>Mutations</li>
      </ul>
      <div className="App">
        <h1>{active}</h1>
        {active === "basic" && (
          <Waiter
            queries={{
              someItem: query("SomeItem", (store) => fetchUser("userId")),
              users: getList("Users", "User", "id", () => fetchUsers())
            }}
            renderLoader={Loader}
            renderErrors={Errors}
          >
            {({ queries, mutations }) => {
              return (
                <div>
                  <h4>Data:</h4>
                  Users:
                  {JSON.stringify(queries.users.data)}
                  <h4>Meta:</h4>
                  {JSON.stringify(queries.users.meta)}
                </div>
              );
            }}
          </Waiter>
        )}
        {active === "cache" && (
          <Waiter
            queries={{
              user: getObject("User", "user_1", () => fetchUser("user_1"))
            }}
            renderLoader={Loader}
            renderErrors={Errors}
          >
            {({ queries, mutations }) => {
              return (
                <div>
                  <h4>Data:</h4>
                  User:
                  {JSON.stringify(queries.user.data)}
                  <h4>Meta:</h4>
                  User:
                  {JSON.stringify(queries.user.meta)}
                </div>
              );
            }}
          </Waiter>
        )}
        {active === "mutations" && (
          <Waiter
            queries={{
              users: getList("Users", "User", "id", () => fetchUsers())
            }}
            mutations={{
              deleteUser: (id: string) =>
                deleteObject("User", id, () => deleteUser(id)),
              updateUser: (id: string) =>
                updateObject("User", id, () => updateUser(id)),
              createUser: () =>
                createObject("User", "id", () =>
                  updateUser(`user_${Date.now()}`)
                ),
              updateUsers: () =>
                updateList("Users", "User", "id", () => updateUsers())
            }}
            renderLoader={Loader}
            renderErrors={Errors}
          >
            {({ queries, mutations }) => {
              return (
                <div>
                  <h4>Data:</h4>
                  Users:
                  {JSON.stringify(queries.users.data)}
                  <h4>Mutations:</h4>
                  <button onClick={() => mutations.deleteUser.call("user_1")}>
                    deleteUser:
                  </button>
                  <h4>Data:</h4>
                  {JSON.stringify(mutations.deleteUser.data)}
                  <h4>Meta:</h4>
                  {JSON.stringify(mutations.deleteUser.meta)}
                  <button onClick={() => mutations.updateUser.call("user_2")}>
                    updateUser:
                  </button>
                  <h4>Data:</h4>
                  {JSON.stringify(mutations.updateUser.data)}
                  <h4>Meta:</h4>
                  {JSON.stringify(mutations.updateUser.meta)}
                  <button onClick={() => mutations.createUser.call()}>
                    createUser:
                  </button>
                  <h4>Data:</h4>
                  {JSON.stringify(mutations.createUser.data)}
                  <h4>Meta:</h4>
                  {JSON.stringify(mutations.createUser.meta)}
                  <button onClick={() => mutations.updateUsers.call()}>
                    updateUsers:
                  </button>
                  <h4>Data:</h4>
                  {JSON.stringify(mutations.updateUsers.data)}
                  <h4>Meta:</h4>
                  {JSON.stringify(mutations.updateUsers.meta)}
                </div>
              );
            }}
          </Waiter>
        )}
        {active === "error" && (
          <Waiter
            queries={{
              user: getObject("User", "user_1", () => fetchUser("user_1"))
            }}
            renderLoader={Loader}
            renderErrors={Errors}
          >
            {({ queries, mutations }) => {
              const userName = userNameSelector(queries.user.data);

              return (
                <div>
                  <h4>Data:</h4>
                  {(() => {
                    throw new Error("error");
                    return null;
                  })()}
                  User:
                  {JSON.stringify(userName)}
                  <h4>Meta:</h4>
                  User:
                  {JSON.stringify(queries.user.meta)}
                </div>
              );
            }}
          </Waiter>
        )}
      </div>
    </WaiterProvider>
  );
}

export default App;
