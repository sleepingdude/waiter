import React, { useEffect, useState } from "react";
import "./App.css";
import { Waiter } from "./Waiter/Waiter";
import { WaiterProvider } from "./Waiter/WaiterProvider";
import { createStore, Store } from "./Waiter/store";
import { useCall } from "./Waiter/useCall";

type User = {
  id: string;
  name: string;
};

const fetchUser = async (id: string): Promise<User> => {
  return await new Promise((resolve) =>
    setTimeout(() => resolve({ id, name: "UserName" }), 2000)
  );
};

const updateUser = (id: string) => async (store: Store): Promise<User> => {
  return await new Promise((resolve) =>
    setTimeout(() => {
      const newUser = { id, name: "UserName" + Math.random() };
      store.setDataByKey("user", newUser);
      resolve(newUser);
    }, 2000)
  );
};

type Post = {
  id: number;
  text: string;
};

const fetchPost = async (id: number): Promise<Post[]> => {
  return await new Promise((resolve) =>
    setTimeout(() => resolve([{ id, text: "Post" }]), 2000)
  );
};

type Message = {
  id: number;
  message: string;
};

const fetchMessages = async (id: number): Promise<Message[]> => {
  return await new Promise((resolve) =>
    setTimeout(() => resolve([{ id, message: "Message" }]), 2000)
  );
};

const fetchWithError = async (id: number): Promise<Message[]> => {
  return await new Promise((resolve, reject) =>
    setTimeout(() => reject(new Error("Fetch error")), 2000)
  );
};

const Loader = () => <div style={{ color: "gold" }}>Loading</div>;
const Errors = (errors: Error[]) => (
  <div style={{ color: "red" }}>{errors.map((e) => e.toString())}</div>
);

const myMutation = (params: string) => async (store: Store) => {
  console.log(store);

  return (await new Promise((resolve) =>
    setTimeout(() => resolve({ success: "Message" }), 2000)
  )) as { success: string };
};

const myAction = async (store: Store) => {
  console.log(store);

  return (await new Promise((resolve) =>
    setTimeout(() => resolve({ success: "Message" }), 2000)
  )) as { success: string };
};

const userNameSelector = (user: User) => user.name;

const store = createStore();

store.subscribeData(console.info);

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
            requests={{
              user: () => fetchUser("userId")
            }}
            renderLoader={Loader}
            renderErrors={Errors}
          >
            {({ data, meta, update, mutations }) => {
              return (
                <div>
                  <h4>Data:</h4>
                  User:
                  {JSON.stringify(data.user)}
                  <h4>Meta:</h4>
                  User:
                  {JSON.stringify(meta.user)}
                </div>
              );
            }}
          </Waiter>
        )}
        {active === "cache" && (
          <Waiter
            requests={{
              user: () => fetchUser("userId"),
              posts: () => fetchPost(111)
            }}
            renderLoader={Loader}
            renderErrors={Errors}
          >
            {({ data, meta, update, mutations }) => {
              const userName = userNameSelector(data.user);

              return (
                <div>
                  <h4>Data:</h4>
                  User:
                  {JSON.stringify(userName)}
                  <br />
                  Post:
                  {JSON.stringify(data.posts)}
                  <h4>Meta:</h4>
                  User:
                  {JSON.stringify(meta.user)}
                  <br />
                  Post:
                  {JSON.stringify(meta.posts)}
                  <br />
                </div>
              );
            }}
          </Waiter>
        )}

        {active === "error" && (
          <Waiter
            requests={{
              errorRequest: () => fetchWithError(111)
            }}
            renderLoader={Loader}
            renderErrors={Errors}
          >
            {({ data, meta, update, mutations }) => {
              return (
                <div>
                  <h4>Data:</h4>
                  {JSON.stringify(data.errorRequest)}
                  <h4>Meta:</h4>
                  {JSON.stringify(meta.errorRequest)}
                  <br />
                  <Waiter
                    requests={{
                      myAction
                    }}
                    renderLoader={Loader}
                    renderErrors={Errors}
                  >
                    {({ data }) => {
                      console.log(data.myAction);

                      return (
                        <div style={{ width: "50%" }}>
                          {(() => {
                            throw new Error("error");
                            return null;
                          })()}
                          Cashed User
                          {JSON.stringify(data)}
                        </div>
                      );
                    }}
                  </Waiter>
                </div>
              );
            }}
          </Waiter>
        )}

        {active === "mutations" && (
          <Waiter
            requests={{
              messages: () => fetchMessages(1111),
              user: () => fetchUser("userId")
            }}
            mutations={{
              updateUser: updateUser,
              someOtherMutation: myMutation
            }}
            renderLoader={Loader}
            renderErrors={Errors}
          >
            {({ data, meta, update, call, mutations }) => {
              return (
                <div>
                  <br />
                  Messages:
                  <br />
                  {JSON.stringify(data.messages)}
                  <br />
                  User data:
                  <br />
                  {JSON.stringify(data.user)}
                  User meta: <br />
                  {JSON.stringify(meta.user)}
                  <br />
                  updateUser data:
                  <br />
                  {JSON.stringify(data.updateUser)}
                  <br />
                  updateUser meta: <br />
                  {JSON.stringify(meta.updateUser)}
                  <br />
                  <button
                    onClick={async () => {
                      const mm = await mutations.updateUser("111" + new Date());

                      console.log(mm);

                      // update.messages([...data.messages, ...data.messages]);
                    }}
                  >
                    Click for update
                  </button>
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
